from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title
    
class Services(models.Model):
    title = models.CharField(max_length=100)
    service_provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name="services")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class ServiceQueue(models.Model):
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='queue_entries')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('service', 'user')
        ordering = ['joined_at']