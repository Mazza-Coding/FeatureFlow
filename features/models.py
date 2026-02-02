from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Feature(models.Model):
    COMPLEXITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('under_discussion', 'Under Discussion'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]
    
    title = models.CharField(max_length=255)
    business_problem = models.TextField()
    expected_value = models.TextField()
    affected_users = models.TextField()
    complexity = models.CharField(max_length=10, choices=COMPLEXITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')
    
    business_value = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    effort = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    risk = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='features')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def priority_score(self):
        return round((self.business_value * 2 - self.effort - self.risk) / 2, 1)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Comment(models.Model):
    TAG_CHOICES = [
        ('question', 'Question'),
        ('idea', 'Idea'),
        ('risk', 'Risk'),
        ('agreement', 'Agreement'),
    ]
    
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    tag = models.CharField(max_length=20, choices=TAG_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.tag}: {self.content[:50]}"


class StatusChange(models.Model):
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='status_changes')
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    justification = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.feature.title}: {self.from_status} -> {self.to_status}"


class Activity(models.Model):
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('commented', 'Commented'),
        ('status_changed', 'Status Changed'),
        ('updated', 'Updated'),
    ]
    
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.user.username} {self.action} on {self.feature.title}"
