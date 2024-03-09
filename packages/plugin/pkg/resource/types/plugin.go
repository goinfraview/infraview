package types

type ResourceProviderInput[I OperationInput] struct {
	Input       I
	ResourceID  string
	NamespaceID string
}

type RegisterPreHookRequest[I OperationInput] struct {
	Hook  PreHookFunc[I]
	ID    string
	Phase PreHookType
}

// ResourceInformer adds additional functionality on top of a resource provider to signal
// back to the IDE when resources have changed automatically.
type ResourceInformer interface {
	// Subscribe is sent from the IDE that the resource provider is interested in receiving
	// informer messages for a given resource in a resource namespace.
	Subscribe(resourceID, namespaceID string, actions []InformerAction) error
	// Unsubscribe is sent from the IDE that the resource provider is no longer interested in
	// receiving informer messages for a given resource in a resource namespace.
	Unsubscribe(resourceID, namespaceID string, actions []InformerAction) error
	// UnsubscribeAll is sent from the IDE that the resource provider is no longer interested in
	// receiving informer messages for any resource in a resource namespace.
	UnsubscribeAll(namespaceID string) error
	// GetInformerAddChannel is sent from the IDE to request a channel that will be used to send
	// informer messages to the IDE.
	GetInformerAddChannel() chan InformerMessage[InformerAddPayload]
	// GetInformerUpdateChannel is sent from the IDE to request a channel that will be used to send
	// informer messages to the IDE.
	GetInformerUpdateChannel() chan InformerMessage[InformerUpdatePayload]
	// GetInformerDeleteChannel is sent from the IDE to request a channel that will be used to send
	// informer messages to the IDE.
	GetInformerDeleteChannel() chan InformerMessage[InformerDeletePayload]
}

// ResourceProvider provides an interface for performing operations against a resource backend
// given a resource namespace and a resource identifier.
type ResourceProvider interface {
	// Get returns a single resource in the given resource namespace.
	Get(resourceID string, namespaceID string, input GetInput) *GetResult
	// Get returns a single resource in the given resource namespace.
	List(resourceID string, namespaceID string, input ListInput) *ListResult
	// FindResources returns a list of resources in the given resource namespace that
	// match a set of given options.
	Find(resourceID string, namespaceID string, input FindInput) *FindResult
	// Create creates a new resource in the given resource namespace.
	Create(resourceID string, namespaceID string, input CreateInput) *CreateResult
	// Update updates an existing resource in the given resource namespace.
	Update(resourceID string, namespaceID string, input UpdateInput) *UpdateResult
	// Delete deletes an existing resource in the given resource namespace.
	Delete(resourceID string, namespaceID string, input DeleteInput) *DeleteResult

	// RegisterPreGetHook registers a pre-get hook that will be called before a resource is retrieved
	RegisterPreGetHook(PreHook[GetInput]) error
	// RegisterPreListHook registers a pre-list hook that will be called before a resource is listed
	RegisterPreListHook(PreHook[ListInput]) error
	// RegisterPreFindHook registers a pre-find hook that will be called before a resource is found
	RegisterPreFindHook(PreHook[FindInput]) error
	// RegisterPreCreateHook registers a pre-create hook that will be called before a resource is created
	RegisterPreCreateHook(PreHook[CreateInput]) error
	// RegisterPreUpdateHook registers a pre-update hook that will be called before a resource is updated
	RegisterPreUpdateHook(PreHook[UpdateInput]) error
	// RegisterPreDeleteHook registers a pre-delete hook that will be called before a resource is deleted
	RegisterPreDeleteHook(PreHook[DeleteInput]) error

	// RegisterPostGetHook registers a post-create hook that will be called after a resource is created
	RegisterPostGetHook(PostHook[GetResult]) error
	// RegisterPostListHook registers a post-create hook that will be called after a resource is created
	RegisterPostListHook(PostHook[ListResult]) error
	// RegisterPostFindHook registers a post-create hook that will be called after a resource is created
	RegisterPostFindHook(PostHook[FindResult]) error
	// RegisterPostCreateHook registers a post-create hook that will be called after a resource is created
	RegisterPostCreateHook(PostHook[CreateResult]) error
	// RegisterPostUpdateHook registers a post-create hook that will be called after a resource is created
	RegisterPostUpdateHook(PostHook[UpdateResult]) error
	// RegisterPostDeleteHook registers a post-create hook that will be called after a resource is created
	RegisterPostDeleteHook(PostHook[DeleteResult]) error
}
