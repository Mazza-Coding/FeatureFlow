from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Feature, Comment, StatusChange, Activity


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match'})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Comment
        fields = ['id', 'feature', 'author', 'author_id', 'content', 'tag', 'created_at']
        read_only_fields = ['id', 'created_at', 'author', 'feature']


class StatusChangeSerializer(serializers.ModelSerializer):
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = StatusChange
        fields = ['id', 'feature', 'changed_by', 'from_status', 'to_status', 'justification', 'created_at']
        read_only_fields = ['id', 'created_at', 'changed_by', 'from_status']


class ActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'feature', 'user', 'action', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class FeatureListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    priority_score = serializers.FloatField(read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Feature
        fields = [
            'id', 'title', 'business_problem', 'expected_value', 'affected_users',
            'complexity', 'status', 'business_value', 'effort', 'risk',
            'priority_score', 'created_by', 'created_at', 'updated_at', 'comment_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'priority_score']
    
    def get_comment_count(self, obj):
        return obj.comments.count()


class FeatureDetailSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    status_changes = StatusChangeSerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    priority_score = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Feature
        fields = [
            'id', 'title', 'business_problem', 'expected_value', 'affected_users',
            'complexity', 'status', 'business_value', 'effort', 'risk',
            'priority_score', 'created_by', 'created_at', 'updated_at',
            'comments', 'status_changes', 'activities'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'priority_score']
