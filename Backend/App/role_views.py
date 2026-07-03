from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Rol, UsuarioRol


@api_view(['POST'])
@permission_classes([IsAdminUser])
def crear_rol_view(request):
    """
    Create a new role (admin only)
    POST /api/roles/
    Body: { "nombre_rol": "Conferencista" }
    """
    try:
        data = request.data
        nombre_rol = data.get('nombre_rol')

        if not nombre_rol:
            return Response({'error': 'nombre_rol requerido'}, status=status.HTTP_400_BAD_REQUEST)

        rol, created = Rol.objects.get_or_create(nombre_rol=nombre_rol)

        if created:
            return Response({'message': 'Rol creado', 'id': rol.id}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Rol ya existe', 'id': rol.id})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def listar_roles_view(request):
    """
    List all roles
    GET /api/roles/
    """
    try:
        roles = Rol.objects.all()
        data = [{'id': r.id, 'nombre_rol': r.nombre_rol} for r in roles]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def asignar_rol_view(request):
    """
    Assign a role to a user (admin only)
    POST /api/usuarios/asignar-rol/
    Body: { "usuario_id": 2, "rol_id": 1 }
    """
    try:
        data = request.data
        usuario_id = data.get('usuario_id')
        rol_id = data.get('rol_id')

        if not usuario_id or not rol_id:
            return Response({'error': 'usuario_id y rol_id requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        usuario = get_object_or_404(User, id=usuario_id)
        rol = get_object_or_404(Rol, id=rol_id)

        usuario_rol, created = UsuarioRol.objects.get_or_create(usuario=usuario, rol=rol)

        if created:
            return Response({'message': 'Rol asignado al usuario'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Usuario ya tenía este rol'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def remover_rol_view(request):
    """
    Remove a role from a user (admin only)
    POST /api/usuarios/remover-rol/
    Body: { "usuario_id": 2, "rol_id": 1 }
    """
    try:
        data = request.data
        usuario_id = data.get('usuario_id')
        rol_id = data.get('rol_id')

        if not usuario_id or not rol_id:
            return Response({'error': 'usuario_id y rol_id requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        usuario_rol = UsuarioRol.objects.filter(usuario_id=usuario_id, rol_id=rol_id).first()

        if not usuario_rol:
            return Response({'error': 'Usuario no tiene este rol'}, status=status.HTTP_404_NOT_FOUND)

        usuario_rol.delete()
        return Response({'message': 'Rol removido del usuario'})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_usuarios_view(request):
    """
    List all users (admin only)
    GET /api/usuarios/
    """
    try:
        usuarios = User.objects.all()
        data = []
        for u in usuarios:
            rol_usuario = UsuarioRol.objects.filter(usuario=u).select_related('rol').first()
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'is_staff': u.is_staff,
                'rol': rol_usuario.rol.nombre_rol if rol_usuario else None
            })
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuario_detalle_view(request, usuario_id):
    """
    Get user details (authenticated)
    GET /api/usuarios/<usuario_id>/
    """
    try:
        usuario = get_object_or_404(User, id=usuario_id)
        rol_usuario = UsuarioRol.objects.filter(usuario=usuario).select_related('rol').first()

        return Response({
            'id': usuario.id,
            'username': usuario.username,
            'email': usuario.email,
            'first_name': usuario.first_name,
            'is_staff': usuario.is_staff,
            'rol': rol_usuario.rol.nombre_rol if rol_usuario else None
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
