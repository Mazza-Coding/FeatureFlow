from django.contrib import admin
from .models import Feature, Comment, StatusChange, Activity


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'complexity', 'priority_score', 'created_by', 'created_at']
    list_filter = ['status', 'complexity', 'created_at']
    search_fields = ['title', 'business_problem', 'expected_value']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['feature', 'author', 'tag', 'created_at']
    list_filter = ['tag', 'created_at']


@admin.register(StatusChange)
class StatusChangeAdmin(admin.ModelAdmin):
    list_display = ['feature', 'from_status', 'to_status', 'changed_by', 'created_at']
    list_filter = ['from_status', 'to_status', 'created_at']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['feature', 'user', 'action', 'created_at']
    list_filter = ['action', 'created_at']
