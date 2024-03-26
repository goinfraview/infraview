import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/providers/SnackbarProvider';

// Types
import { types } from '@api/models';

// Underlying client
import { List, Create } from '@api/resource/Client';
import { EventsOff, EventsOn } from '@runtime/runtime';
import { produce } from 'immer';

type AddPayload = {
  data: any;
  key: string;
  connection: string;
  id: string;
  namespace: string;
};

type UpdatePayload = {
  oldData: any;
  newData: any;
  key: string;
  connection: string;
  id: string;
  namespace: string;
};

type DeletePayload = {
  data: any;
  key: string;
  connection: string;
  id: string;
  namespace: string;
};

type UseResourcesOptions = {
  /**
   * The ID of the plugin responsible for this resource
   * @example "kubernetes"
   */
  pluginID: string;

  /**
   * The connection ID to scope the resource to
   * @example "integration"
   */
  connectionID: string;

  /**
   * The GVR (Group, Version, Resource) identifier to fetch
   * @example "core::v1::pods"
   */
  resourceKey: string;

  /**
   * Optional namespace to scope the resource to, if the backend
   * supports the concept of namespaces of resources. If the backend
   * supports the concept of namespaces, and this is not provided,
   * it will default to selecting from all namespaces.
   * @example "default"
   */
  namespaces?: string[];

  /**
   * Optional parameters to pass to the resource fetch
   * @example { labelSelector: "app=nginx" }
   */
  listParams?: Record<string, unknown>;

  /**
  * Optional parameters to pass to the resource create
  * @example { dryRun: true }
  */
  createParams?: Record<string, unknown>;
};

/**
 * The useResource hook returns a hook, scoped to the desired resource and connection, that allows for interacting
 * with, and fetching, the resource data.
 *
 * It should be noted that this hook does not perform any logic to ensure that either the resource exists,
 * @throws If the resourceID is invalid
 */
export const useResources = ({
  pluginID,
  connectionID,
  resourceKey,
  namespaces = [],
  listParams = {},
  createParams = {},
}: UseResourcesOptions) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const queryKey = ['RESOURCE', pluginID, connectionID, resourceKey];

  // === Mutations === //

  const { mutateAsync: create } = useMutation({
    mutationFn: async (opts: Partial<types.CreateInput>) => Create(pluginID, connectionID, resourceKey, types.CreateInput.createFrom({
      params: opts.params as Record<string, unknown> || createParams,
      input: opts.input,
      namespaces,
    })),
    onSuccess: async (data) => {
      let foundID = '';

      // Attempt to find an ID based on some common patterns
      if (data.result.metadata?.name) {
        foundID = data.result.metadata.name as string;
      } else if (data.result?.id) {
        foundID = data.result?.id as string;
      } else if (data.result?.name) {
        foundID = data.result?.name as string;
      } else if (data.result?.ID) {
        foundID = data.result?.ID as string;
      } else if (data.result?.Name) {
        foundID = data.result.Name as string;
      }

      const message = foundID ? `Resource ${foundID} created` : 'Resource created';
      showSnackbar(message, 'success');

      await queryClient.invalidateQueries({ queryKey });
    },
    onError(error) {
      showSnackbar(`Failed to create resource: ${error.message}`, 'error');
    },
  });

  const resourceQuery = useQuery({
    queryKey,
    queryFn: async () => List(pluginID, connectionID, resourceKey, types.ListInput.createFrom({
      params: listParams,
      order: {
        by: 'name',
        direction: true,
      },
      pagination: {
        page: 1,
        pageSize: 200,
      },
      namespaces,
    })),
  });


  // === Informer Cache Updates === //

  /**
   * Handle adding new resources to the resource list
   */
  const onResourceAdd = React.useCallback((newResource: AddPayload) => {
    queryClient.setQueryData(queryKey, (oldData: types.ListResult) => {
      return produce(oldData, (draft) => {
        draft.result[newResource.id] = newResource.data;
      });
    });
  }, []);

  /**
   * Handle updating resources in the resource list
   */
  const onResourceUpdate = React.useCallback((updateEvent: UpdatePayload) => {
    queryClient.setQueryData(queryKey, (oldData: types.ListResult) => {
      return produce(oldData, (draft) => { 
        draft.result[updateEvent.id] = updateEvent.newData;
      });
    });
  }, []);

  /**
   * Handle deleting pods from the resource list
   */
  const onResourceDelete = React.useCallback((deletedResource: DeletePayload) => {
    queryClient.setQueryData(queryKey, (oldData: types.ListResult) => {
      return produce(oldData, (draft) => { 
        /* eslint-disable-next-line */
        delete draft.result[deletedResource.id];
      });
    });
  }, []);

  // *Only on mount*, we want subscribe to new resources, updates and deletes
  React.useEffect(() => {
    EventsOn(`${pluginID}/${connectionID}/${resourceKey}/ADD`, onResourceAdd);
    EventsOn(`${pluginID}/${connectionID}/${resourceKey}/UPDATE`, onResourceUpdate);
    EventsOn(`${pluginID}/${connectionID}/${resourceKey}/DELETE`, onResourceDelete);

    return () => {
      EventsOff(`${pluginID}/${connectionID}/${resourceKey}/ADD`);
      EventsOff(`${pluginID}/${connectionID}/${resourceKey}/UPDATE`);
      EventsOff(`${pluginID}/${connectionID}/${resourceKey}/DELETE`);
    };
  }, []); 

  return {
    /**
     * Fetch result for the resource. The client will automatically cache the result, and update the cache
     * when the resources are updated or deleted via the returned create and remove mutation functions, or
     * the per-resource hook mutation functions.
     */
    resources: resourceQuery,

    /**
     * Create a new resource. A set of optional parameters can be passed to customize the create behavior,
     * which if specified, will add additional default behavior set via the hook options.
     *
     * @params opts Optional parameters to pass to the resource create operation
     */
    create,
  };
};
