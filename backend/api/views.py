from django.shortcuts import render
from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from .serializers import UserSerializer, NoteSerializer, ServicesSerializer, ServiceQueueSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import Note, Services, ServiceQueue
from .permissions import IsServiceProviderOrReadOnly
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

User = get_user_model()

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    
    
# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 

class UserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_staff:
            raise PermissionDenied("Only staff users can view the user list.")
        return super().get_queryset()


class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()

        if self.request.user.is_staff:
            return obj

        if obj.id == self.request.user.id:
            return obj

        raise PermissionDenied("You are not allowed to update this user.")

class UserDestroyView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": f"User {instance.username} has been deleted."}, status=status.HTTP_204_NO_CONTENT)

class AuthUserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class ServiceCreateView(generics.CreateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(service_provider=self.request.user)

class ServiceListView(generics.ListAPIView):
    serializer_class = ServicesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Services.objects.filter(service_provider=user)
        return Services.objects.all()
    
class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [permissions.IsAuthenticated, IsServiceProviderOrReadOnly]

class QueueServiceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        service = get_object_or_404(Services, pk=pk)

        # Check if already queued
        if ServiceQueue.objects.filter(service=service, user=request.user).exists():
            return Response({"detail": "You are already in the queue."}, status=status.HTTP_400_BAD_REQUEST)

        ServiceQueue.objects.create(service=service, user=request.user)
        return Response({"detail": "You have joined the queue."}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        service = get_object_or_404(Services, pk=pk)

        first_in_queue = ServiceQueue.objects.filter(service=service).order_by('joined_at').first()
        if not first_in_queue:
            return Response({"detail": "The queue is empty."}, status=status.HTTP_400_BAD_REQUEST)

        first_in_queue.delete()
        return Response({"detail": f"The user {first_in_queue.user.username} is served and removed from the queue."}, status=status.HTTP_200_OK)
    


class LeaveQueueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        service = get_object_or_404(Services, pk=pk)

        # Check if user is even in the queue
        user_entry = ServiceQueue.objects.filter(service=service, user=request.user).first()
        if not user_entry:
            return Response({"detail": "You are not in the queue."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is the one currently being served
        first_in_queue = ServiceQueue.objects.filter(service=service).order_by('joined_at').first()
        if first_in_queue and first_in_queue.user == request.user:
            return Response({"detail": "You cannot leave the queue while being served."}, status=status.HTTP_400_BAD_REQUEST)

        # Remove user from the queue
        user_entry.delete()
        return Response({"detail": "You have left the queue."}, status=status.HTTP_200_OK)