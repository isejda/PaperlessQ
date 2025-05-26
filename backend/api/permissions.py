from rest_framework import permissions

class IsServiceProviderOrReadOnly(permissions.BasePermission):
    """
    Only the creator (service_provider) can edit or delete.
    Others can only read.
    """

    def has_object_permission(self, request, view, obj):
        # SAFE_METHODS: GET, HEAD, OPTIONS → allow anyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only allow modifications if user is the service provider
        return obj.service_provider == request.user
