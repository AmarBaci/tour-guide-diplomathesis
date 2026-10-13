from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser, TouristProfile


class TouristRegistrationTests(APITestCase):
    url = reverse('tourist-register')

    def payload(self, **overrides):
        data = {
            'email': 'tourist@example.com',
            'password': 'Str0ngPass!23',
            'full_name': 'Test Tourist',
            'nationality': 'Albanian',
            'phone': '+355691234567',
        }
        data.update(overrides)
        return data

    def test_registration_creates_user_and_profile(self):
        response = self.client.post(self.url, self.payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email='tourist@example.com')
        self.assertEqual(user.user_type, 'tourist')
        self.assertTrue(TouristProfile.objects.filter(user=user, full_name='Test Tourist').exists())

    def test_registration_rejects_non_albanian_phone(self):
        response = self.client.post(self.url, self.payload(phone='+391234567890'), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone', response.data['errors'])

    def test_registration_rejects_duplicate_email(self):
        CustomUser.objects.create_user(email='tourist@example.com', password='x', user_type='tourist')

        response = self.client.post(self.url, self.payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    url = reverse('login')

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='guide@example.com', password='Str0ngPass!23', user_type='guide'
        )

    def test_login_returns_tokens_and_role(self):
        response = self.client.post(
            self.url, {'email': 'guide@example.com', 'password': 'Str0ngPass!23'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user_type'], 'guide')

    def test_login_with_wrong_password_fails(self):
        response = self.client.post(
            self.url, {'email': 'guide@example.com', 'password': 'wrong'}, format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_wrong_expected_role_is_forbidden(self):
        response = self.client.post(
            self.url,
            {'email': 'guide@example.com', 'password': 'Str0ngPass!23', 'expected_role': 'tourist'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RoleBasedAccessTests(APITestCase):
    def login_as(self, user_type):
        user = CustomUser.objects.create_user(
            email=f'{user_type}@example.com', password='Str0ngPass!23', user_type=user_type
        )
        self.client.force_authenticate(user=user)
        return user

    def test_anonymous_user_cannot_access_platform_stats(self):
        response = self.client.get(reverse('platform-stats'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_tourist_cannot_access_platform_stats(self):
        self.login_as('tourist')

        response = self.client.get(reverse('platform-stats'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_platform_admin_can_access_platform_stats(self):
        self.login_as('admin')

        response = self.client.get(reverse('platform-stats'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_guide_cannot_list_ministry_agencies(self):
        self.login_as('guide')

        response = self.client.get(reverse('ministry-agencies'))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ministry_admin_can_list_ministry_agencies(self):
        self.login_as('ministry_admin')

        response = self.client.get(reverse('ministry-agencies'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
