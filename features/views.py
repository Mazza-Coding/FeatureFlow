from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Feature, Comment, StatusChange, Activity
from .serializers import (
    FeatureListSerializer, FeatureDetailSerializer, CommentSerializer,
    StatusChangeSerializer, ActivitySerializer, UserSerializer, RegisterSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(UserSerializer(request.user).data)


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FeatureDetailSerializer
        return FeatureListSerializer
    
    def perform_create(self, serializer):
        feature = serializer.save(created_by=self.request.user)
        Activity.objects.create(
            feature=feature,
            user=self.request.user,
            action='created',
            description=f'Created feature: {feature.title}'
        )
    
    def perform_update(self, serializer):
        feature = serializer.save()
        Activity.objects.create(
            feature=feature,
            user=self.request.user,
            action='updated',
            description=f'Updated feature: {feature.title}'
        )
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        feature = self.get_object()
        new_status = request.data.get('status')
        justification = request.data.get('justification')
        
        if not new_status or not justification:
            return Response(
                {'error': 'Both status and justification are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in Feature.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = feature.status
        StatusChange.objects.create(
            feature=feature,
            changed_by=request.user,
            from_status=old_status,
            to_status=new_status,
            justification=justification
        )
        
        feature.status = new_status
        feature.save()
        
        Activity.objects.create(
            feature=feature,
            user=request.user,
            action='status_changed',
            description=f'Changed status from {old_status} to {new_status}: {justification}'
        )
        
        return Response(FeatureDetailSerializer(feature).data)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        feature_id = self.kwargs.get('feature_pk')
        if feature_id:
            return Comment.objects.filter(feature_id=feature_id)
        return Comment.objects.all()
    
    def perform_create(self, serializer):
        feature_id = self.kwargs.get('feature_pk')
        feature = Feature.objects.get(pk=feature_id)
        comment = serializer.save(author=self.request.user, feature=feature)
        
        Activity.objects.create(
            feature=feature,
            user=self.request.user,
            action='commented',
            description=f'Added {comment.tag} comment: {comment.content[:100]}'
        )


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        feature_id = self.kwargs.get('feature_pk')
        if feature_id:
            return Activity.objects.filter(feature_id=feature_id)
        return Activity.objects.all()
