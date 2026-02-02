from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Feature, Comment, StatusChange, Activity


class FeatureModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.feature = Feature.objects.create(
            title='Test Feature',
            business_problem='A test problem',
            expected_value='Test value',
            affected_users='Test users',
            complexity='medium',
            business_value=8,
            effort=4,
            risk=3,
            created_by=self.user
        )

    def test_feature_creation(self):
        self.assertEqual(self.feature.title, 'Test Feature')
        self.assertEqual(self.feature.status, 'proposed')

    def test_priority_score_calculation(self):
        expected_score = (8 * 2 - 4 - 3) / 2
        self.assertEqual(self.feature.priority_score, expected_score)

    def test_feature_str(self):
        self.assertEqual(str(self.feature), 'Test Feature')


class CommentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.feature = Feature.objects.create(
            title='Test Feature',
            business_problem='A test problem',
            expected_value='Test value',
            affected_users='Test users',
            created_by=self.user
        )
        self.comment = Comment.objects.create(
            feature=self.feature,
            author=self.user,
            content='This is a test comment',
            tag='idea'
        )

    def test_comment_creation(self):
        self.assertEqual(self.comment.content, 'This is a test comment')
        self.assertEqual(self.comment.tag, 'idea')

    def test_comment_str(self):
        self.assertIn('idea', str(self.comment))


class FeatureAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()

    def get_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        return response.data['access']

    def test_register_user(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)

    def test_login(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_create_feature_unauthorized(self):
        response = self.client.post('/api/features/', {
            'title': 'New Feature',
            'business_problem': 'A problem',
            'expected_value': 'Value',
            'affected_users': 'Users'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_feature_authorized(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post('/api/features/', {
            'title': 'New Feature',
            'business_problem': 'A problem',
            'expected_value': 'Value',
            'affected_users': 'Users'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Feature')

    def test_get_features_list(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user
        )
        
        response = self.client.get('/api/features/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_change_status(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user
        )
        
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'approved',
            'justification': 'Team approved this feature'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')

    def test_add_comment(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user
        )
        
        response = self.client.post(f'/api/features/{feature.id}/comments/', {
            'content': 'This is a comment',
            'tag': 'question'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['tag'], 'question')


class ActivityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client = APIClient()

    def get_token(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        return response.data['access']

    def test_activity_created_on_feature_creation(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post('/api/features/', {
            'title': 'New Feature',
            'business_problem': 'A problem',
            'expected_value': 'Value',
            'affected_users': 'Users'
        })
        
        feature_id = response.data['id']
        activities = Activity.objects.filter(feature_id=feature_id)
        self.assertEqual(activities.count(), 1)
        self.assertEqual(activities.first().action, 'created')

    def test_activity_created_on_status_change(self):
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user
        )
        
        self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'approved',
            'justification': 'Approved by team'
        })
        
        activities = Activity.objects.filter(feature=feature, action='status_changed')
        self.assertEqual(activities.count(), 1)
