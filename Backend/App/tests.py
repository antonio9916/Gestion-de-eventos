from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Evento, Inscripcion, Rol, UsuarioRol
from datetime import datetime, timedelta


class EventoAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123', email='test@example.com')
        self.admin = User.objects.create_user(username='admin', password='adminpass123', email='admin@example.com', is_staff=True, is_superuser=True)
        
        rol = Rol.objects.create(nombre_rol="Participante")
        UsuarioRol.objects.create(usuario=self.user, rol=rol)
        UsuarioRol.objects.create(usuario=self.admin, rol=rol)

    def test_crear_evento_sin_autenticacion(self):
        """Test that creating event without auth fails"""
        data = {
            'title': 'Test Event',
            'description': 'Test',
            'eventType': 'conferencia',
            'startDate': '2026-08-01T10:00:00Z',
            'endDate': '2026-08-01T12:00:00Z',
            'maxAttendees': 50,
            'inscriptionPolicy': 'Test policy'
        }
        response = self.client.post('/api/eventos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crear_evento_con_autenticacion(self):
        """Test creating event with valid auth"""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Test Event',
            'description': 'Test',
            'eventType': 'conferencia',
            'startDate': '2026-08-01T10:00:00Z',
            'endDate': '2026-08-01T12:00:00Z',
            'maxAttendees': 50,
            'inscriptionPolicy': 'Test policy'
        }
        response = self.client.post('/api/eventos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)

    def test_validacion_fecha_evento(self):
        """Test that startDate must be before endDate"""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Test Event',
            'description': 'Test',
            'eventType': 'conferencia',
            'startDate': '2026-08-01T12:00:00Z',
            'endDate': '2026-08-01T10:00:00Z',  # End before start
            'maxAttendees': 50,
            'inscriptionPolicy': 'Test policy'
        }
        response = self.client.post('/api/eventos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_validacion_max_attendees(self):
        """Test that maxAttendees must be > 0"""
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Test Event',
            'description': 'Test',
            'eventType': 'conferencia',
            'startDate': '2026-08-01T10:00:00Z',
            'endDate': '2026-08-01T12:00:00Z',
            'maxAttendees': 0,
            'inscriptionPolicy': 'Test policy'
        }
        response = self.client.post('/api/eventos/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_obtener_eventos(self):
        """Test retrieving all events"""
        evento = Evento.objects.create(
            title='Test Event',
            description='Test',
            eventType='conferencia',
            startDate=datetime.now() + timedelta(days=1),
            endDate=datetime.now() + timedelta(days=2),
            maxAttendees=50,
            inscriptionPolicy='Test'
        )
        response = self.client.get('/api/eventos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_obtener_evento_detalle(self):
        """Test retrieving a single event"""
        evento = Evento.objects.create(
            title='Test Event',
            description='Test',
            eventType='conferencia',
            startDate=datetime.now() + timedelta(days=1),
            endDate=datetime.now() + timedelta(days=2),
            maxAttendees=50,
            inscriptionPolicy='Test'
        )
        response = self.client.get(f'/api/eventos/{evento.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], evento.id)


class InscripcionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', password='pass123', email='user1@example.com')
        self.user2 = User.objects.create_user(username='user2', password='pass123', email='user2@example.com')
        
        rol = Rol.objects.create(nombre_rol="Participante")
        UsuarioRol.objects.create(usuario=self.user1, rol=rol)
        UsuarioRol.objects.create(usuario=self.user2, rol=rol)

        self.evento = Evento.objects.create(
            title='Test Event',
            description='Test',
            eventType='conferencia',
            startDate=datetime.now() + timedelta(days=1),
            endDate=datetime.now() + timedelta(days=2),
            maxAttendees=2,
            inscriptionPolicy='Test'
        )

    def test_inscripcion_sin_autenticacion(self):
        """Test that inscription without auth fails"""
        data = {'evento_id': self.evento.id}
        response = self.client.post('/api/inscripciones/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inscripcion_exitosa(self):
        """Test successful inscription"""
        self.client.force_authenticate(user=self.user1)
        data = {'evento_id': self.evento.id}
        response = self.client.post('/api/inscripciones/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('inscripcion', response.data)

    def test_inscripcion_duplicada(self):
        """Test that user can't inscribe twice"""
        self.client.force_authenticate(user=self.user1)
        data = {'evento_id': self.evento.id}
        self.client.post('/api/inscripciones/', data, format='json')
        response = self.client.post('/api/inscripciones/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Ya estás inscrito', response.data['error'])

    def test_control_cupos(self):
        """Test that max attendees is enforced"""
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        
        self.client.force_authenticate(user=self.user2)
        self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        
        # Create third user to exceed capacity
        user3 = User.objects.create_user(username='user3', password='pass123', email='user3@example.com')
        rol = Rol.objects.get(nombre_rol="Participante")
        UsuarioRol.objects.create(usuario=user3, rol=rol)
        
        self.client.force_authenticate(user=user3)
        response = self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cupos completos', response.data['error'])

    def test_cancelar_inscripcion(self):
        """Test canceling inscription"""
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        
        response = self.client.post('/api/inscripciones/cancelar/', {'evento_id': self.evento.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify inscription was deleted
        existe = Inscripcion.objects.filter(usuario=self.user1, evento=self.evento).exists()
        self.assertFalse(existe)

    def test_verificar_inscripcion(self):
        """Test checking if user is inscribed"""
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        
        response = self.client.get(f'/api/inscripciones/verificar/{self.evento.id}/{self.user1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['inscrito'])

    def test_listar_participantes(self):
        """Test listing event participants"""
        self.client.force_authenticate(user=self.user1)
        self.client.post('/api/inscripciones/', {'evento_id': self.evento.id}, format='json')
        
        response = self.client.get(f'/api/eventos/{self.evento.id}/participantes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'user1')
