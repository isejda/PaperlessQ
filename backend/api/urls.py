from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    
    path("users", views.UserListView.as_view(), name="user-list"),
    path("auth-user/", views.AuthUserDetailView.as_view(), name="auth-user"),
    path('users/<int:pk>/', views.UserUpdateView.as_view(), name="user-update-view"),
    path('users/<int:pk>/delete/', views.UserDestroyView.as_view(), name='user-delete'),

    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('services/create/', views.ServiceCreateView.as_view(), name='service-create'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    path('services/<int:pk>/queue/', views.QueueServiceView.as_view(), name='service-queue'),
    path('services/<int:pk>/queue/leave/', views.LeaveQueueView.as_view(), name='service-leave-queue'),
]