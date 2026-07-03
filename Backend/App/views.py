from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Rol, UsuarioRol, Evento, Inscripcion
from .serializers import EventoSerializer, InscripcionSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not username or not password or not email:
            return Response({'error': 'Faltan campos requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name if name else ""
        )

        rol_default, _ = Rol.objects.get_or_create(nombre_rol="Participante")

        UsuarioRol.objects.create(
            usuario=user,
            rol=rol_default
        )

        return Response({'message': 'Usuario creado con éxito'}, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response({'error': 'Ese usuario o email ya existe'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            rol_usuario = UsuarioRol.objects.filter(usuario=user).select_related('rol').first()
            nombre_rol = rol_usuario.rol.nombre_rol if rol_usuario else "Participante"

            return Response({
                'message': 'Inicio de sesión correcto',
                'id': user.id,
                'username': user.username,
                'name': user.first_name,
                'email': user.email,
                'role': nombre_rol
            }, status=status.HTTP_200_OK)

        else:
            return Response({'error': 'Usuario o contraseña incorrectos'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': f'Error interno: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def evento_api_view(request, pk=None):
    # GET: list or retrieve
    if request.method == 'GET':
        if pk:
            evento = get_object_or_404(Evento, pk=pk)
            serializer = EventoSerializer(evento)
            return Response(serializer.data)
        else:
            eventos = Evento.objects.all().order_by('-startDate')
            serializer = EventoSerializer(eventos, many=True)
            return Response(serializer.data)

    # POST: create (authenticated)
    elif request.method == 'POST':
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = EventoSerializer(data=request.data)
        if serializer.is_valid():
            evento = serializer.save(organizador=request.user)
            return Response({'message': 'Evento creado', 'id': evento.id}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # PUT: update
    elif request.method == 'PUT':
        if not pk:
            return Response({'error': 'ID requerido'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida'}, status=status.HTTP_401_UNAUTHORIZED)

        evento = get_object_or_404(Evento, pk=pk)
        # only organizer or staff can update
        if evento.organizador and evento.organizador != request.user and not request.user.is_staff:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        serializer = EventoSerializer(evento, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Evento actualizado con éxito'})
        else:
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: delete
    elif request.method == 'DELETE':
        if not pk:
            return Response({'error': 'ID requerido'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user or not request.user.is_authenticated:
            return Response({'error': 'Autenticación requerida'}, status=status.HTTP_401_UNAUTHORIZED)

        evento = get_object_or_404(Evento, pk=pk)
        if evento.organizador and evento.organizador != request.user and not request.user.is_staff:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        evento.delete()
        return Response({'message': 'Evento eliminado correctamente'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inscripcion_view(request):
    try:
        data = request.data
        usuario_id = data.get('usuario_id') or request.user.id
        evento_id = data.get('evento_id')

        usuario = get_object_or_404(User, id=usuario_id)
        evento = get_object_or_404(Evento, id=evento_id)

        if Inscripcion.objects.filter(usuario=usuario, evento=evento).exists():
            return Response({'error': 'Ya estás inscrito'}, status=status.HTTP_400_BAD_REQUEST)

        # check max attendees
        num_inscritos = Inscripcion.objects.filter(evento=evento).count()
        if evento.maxAttendees is not None and num_inscritos >= evento.maxAttendees:
            return Response({'error': 'Cupos completos'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            ins = Inscripcion.objects.create(usuario=usuario, evento=evento)

        serializer = InscripcionSerializer(ins)
        return Response({'message': 'Inscripción realizada correctamente', 'inscripcion': serializer.data})

    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Evento.DoesNotExist:
        return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancelar_inscripcion_view(request):
    try:
        data = request.data
        usuario_id = data.get('usuario_id') or request.user.id
        evento_id = data.get('evento_id')

        inscripcion = get_object_or_404(Inscripcion, usuario_id=usuario_id, evento_id=evento_id)
        # allow only the user or staff to cancel
        if inscripcion.usuario.id != request.user.id and not request.user.is_staff:
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

        inscripcion.delete()
        return Response({'message': 'Inscripción cancelada'})

    except Inscripcion.DoesNotExist:
        return Response({'error': 'No existe inscripción'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def verificar_inscripcion_view(request, evento_id, usuario_id):
    existe = Inscripcion.objects.filter(evento_id=evento_id, usuario_id=usuario_id).exists()
    return Response({'inscrito': existe})


@api_view(['GET'])
def participantes_evento_view(request, evento_id):
    inscripciones = Inscripcion.objects.filter(evento_id=evento_id).select_related('usuario')
    participantes = []
    for i in inscripciones:
        participantes.append({
            'id': i.usuario.id,
            'username': i.usuario.username,
            'email': i.usuario.email,
            'nombre': i.usuario.first_name
        })
    return Response(participantes)


@api_view(['GET'])
def inscripciones_usuario_view(request, usuario_id):
    inscripciones = Inscripcion.objects.filter(usuario_id=usuario_id)
    eventos = [inscripcion.evento_id for inscripcion in inscripciones]
    return Response({'eventos': eventos})
