package resources

import (
	"go.uber.org/zap"
	corev1 "k8s.io/api/core/v1"

	"github.com/infraview/infraview/backend/services"
	"github.com/infraview/infraview/backend/services/resources"
)

type EventsService struct {
	resources.NamespacedResourceService[*corev1.Event]
}

// NewEventsService creates a new instance of EventsService.
func NewEventsService(
	logger *zap.SugaredLogger,
	publisher *services.ClusterContextPublisher,
	stateChan chan<- services.ResourceStateEvent,
) *EventsService {
	return &EventsService{
		NamespacedResourceService: *resources.NewNamespacedResourceService[*corev1.Event](
			logger,
			corev1.SchemeGroupVersion.WithResource("events"),
			publisher,
			stateChan,
		),
	}
}
