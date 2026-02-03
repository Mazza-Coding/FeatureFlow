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
        # Response is paginated, so check results array
        self.assertEqual(len(response.data['results']), 1)

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
        
        # proposed -> approved is a valid transition
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'approved',
            'justification': 'Team approved this feature'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')

    def test_change_status_invalid_transition(self):
        """Test that invalid status transitions are rejected"""
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            status='proposed',
            created_by=self.user
        )
        
        # proposed -> done is NOT a valid transition
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'done',
            'justification': 'Trying to skip to done'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot transition', response.data['error'])
        
        # Verify status wasn't changed
        feature.refresh_from_db()
        self.assertEqual(feature.status, 'proposed')

    def test_change_status_valid_workflow(self):
        """Test a complete valid status workflow"""
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='Test Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            status='proposed',
            created_by=self.user
        )
        
        # proposed -> under_discussion
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'under_discussion',
            'justification': 'Starting discussion'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # under_discussion -> approved
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'approved',
            'justification': 'Team approved'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # approved -> in_progress
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'in_progress',
            'justification': 'Development started'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # in_progress -> done
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'done',
            'justification': 'Feature completed'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'done')

    def test_change_status_missing_justification(self):
        """Test that justification is required for status changes"""
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
            'status': 'approved'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_invalid_status_value(self):
        """Test that invalid status values are rejected"""
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
            'status': 'invalid_status',
            'justification': 'Testing invalid status'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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


class PermissionTests(APITestCase):
    """Test permission-related functionality"""
    
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        self.client = APIClient()

    def get_token(self, username, password='testpass123'):
        response = self.client.post('/api/auth/login/', {
            'username': username,
            'password': password
        })
        return response.data['access']

    def test_user_can_delete_own_feature(self):
        """Test that a user can delete their own feature"""
        token = self.get_token('user1')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        feature = Feature.objects.create(
            title='My Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user1
        )
        
        response = self.client.delete(f'/api/features/{feature.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Feature.objects.filter(id=feature.id).exists())

    def test_any_user_can_comment_on_feature(self):
        """Test that any authenticated user can comment on any feature"""
        # User1 creates a feature
        feature = Feature.objects.create(
            title='User1 Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            created_by=self.user1
        )
        
        # User2 comments on it
        token = self.get_token('user2')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post(f'/api/features/{feature.id}/comments/', {
            'content': 'User2 comment',
            'tag': 'idea'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author']['username'], 'user2')

    def test_any_user_can_change_status(self):
        """Test that any authenticated user can change status of any feature"""
        # User1 creates a feature
        feature = Feature.objects.create(
            title='User1 Feature',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            status='proposed',
            created_by=self.user1
        )
        
        # User2 changes status
        token = self.get_token('user2')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post(f'/api/features/{feature.id}/change_status/', {
            'status': 'under_discussion',
            'justification': 'Moving to discussion'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class EdgeCaseTests(APITestCase):
    """Test edge cases and boundary conditions"""
    
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

    def test_priority_score_boundaries(self):
        """Test priority score calculation at extreme values"""
        # Maximum positive score: value=10, effort=1, risk=1
        feature_max = Feature.objects.create(
            title='Max Priority',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            business_value=10,
            effort=1,
            risk=1,
            created_by=self.user
        )
        # (10*2 - 1 - 1) / 2 = 9
        self.assertEqual(feature_max.priority_score, 9.0)
        
        # Minimum score: value=1, effort=10, risk=10
        feature_min = Feature.objects.create(
            title='Min Priority',
            business_problem='Problem',
            expected_value='Value',
            affected_users='Users',
            business_value=1,
            effort=10,
            risk=10,
            created_by=self.user
        )
        # (1*2 - 10 - 10) / 2 = -9
        self.assertEqual(feature_min.priority_score, -9.0)

    def test_feature_with_long_content(self):
        """Test creating a feature with maximum length content"""
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        long_text = 'A' * 5000
        response = self.client.post('/api/features/', {
            'title': 'A' * 255,  # Max CharField length
            'business_problem': long_text,
            'expected_value': long_text,
            'affected_users': long_text
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_nonexistent_feature(self):
        """Test accessing a non-existent feature returns 404"""
        token = self.get_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/features/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_empty_comment_rejected(self):
        """Test that empty comments are rejected"""
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
            'content': '',
            'tag': 'question'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        """Test that duplicate usernames are rejected"""
        response = self.client.post('/api/auth/register/', {
            'username': 'testuser',  # Already exists
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        """Test that mismatched passwords are rejected"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'password123',
            'password_confirm': 'different123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
