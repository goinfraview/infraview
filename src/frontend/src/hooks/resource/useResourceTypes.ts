import { useQuery } from '@tanstack/react-query';

// Underlying client
import { GetResourceTypes } from '@api/resource/Client';

type UseResourceTypesOptions = {
  /**
   * The ID of the category responsible for this resource
   * @example "appearance"
   */
  pluginID: string;
};

/**
 * Interact with a category of settings from the global settings provider. Intended for use in the settings UI - if
 * you need to read or write settings from a specific plugin, use the `@hooks/settings/useSettings` hook instead.
 */
export const useResourceTypes = ({ pluginID }: UseResourceTypesOptions) => {
  const queryKey = [pluginID, 'resources', 'list'];

  const types = useQuery({
    queryKey,
    queryFn: async () => GetResourceTypes(pluginID),
    retry: false,
  });

  return {
    /**
     * The current settings from the provider.
     */
    types,
  };
};
