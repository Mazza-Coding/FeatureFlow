from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'features', views.FeatureViewSet, basename='feature')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.current_user, name='current_user'),
    path('features/<int:feature_pk>/comments/', 
         views.CommentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='feature-comments'),
    path('features/<int:feature_pk>/activities/',
         views.ActivityViewSet.as_view({'get': 'list'}),
         name='feature-activities'),
]
