from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Agency, AgencyAdminProfile, CustomUser
from .models import Tour


class AgencyTourActionTests(APITestCase):
    def setUp(self):
        ministry_user = CustomUser.objects.create_user(
            email='ministry@example.com', password='x', user_type='ministry_admin'
        )
        self.agency = Agency.objects.create(
            name='Explore Albania',
            registration_no='AL-AG-0001',
            ministry_contact=ministry_user.ministry_admin_profile,
            is_active=True,
        )
        self.agency_admin = CustomUser.objects.create_user(
            email='agency@example.com', password='x', user_type='agency_admin'
        )
        AgencyAdminProfile.objects.create(user=self.agency_admin, agency=self.agency)
        self.tour = Tour.objects.create(
            title='Tirana Cultural Tour',
            description='Walking tour of the city centre',
            agency=self.agency,
            meeting_point='Skanderbeg Square',
            duration_hours=3,
            price_per_person=25,
            max_group_size=15,
            inclusions='Guide',
            exclusions='Meals',
        )

    def test_agency_admin_can_deactivate_own_tour(self):
        self.client.force_authenticate(user=self.agency_admin)

        response = self.client.post(f'/api/tours/{self.tour.id}/deactivate/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.tour.refresh_from_db()
        self.assertFalse(self.tour.is_active)

    def test_agency_admin_can_delete_own_tour(self):
        self.client.force_authenticate(user=self.agency_admin)

        response = self.client.delete(f'/api/tours/{self.tour.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tour.objects.filter(id=self.tour.id).exists())

    def test_admin_of_another_agency_cannot_delete_tour(self):
        other_agency = Agency.objects.create(
            name='Other Agency',
            registration_no='AL-AG-0002',
            ministry_contact=self.agency.ministry_contact,
            is_active=True,
        )
        other_admin = CustomUser.objects.create_user(
            email='other@example.com', password='x', user_type='agency_admin'
        )
        AgencyAdminProfile.objects.create(user=other_admin, agency=other_agency)
        self.client.force_authenticate(user=other_admin)

        response = self.client.delete(f'/api/tours/{self.tour.id}/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Tour.objects.filter(id=self.tour.id).exists())

    def test_tourist_cannot_delete_tour(self):
        tourist = CustomUser.objects.create_user(
            email='tourist@example.com', password='x', user_type='tourist'
        )
        self.client.force_authenticate(user=tourist)

        response = self.client.delete(f'/api/tours/{self.tour.id}/')

        self.assertIn(response.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))
        self.assertTrue(Tour.objects.filter(id=self.tour.id).exists())
