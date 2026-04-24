from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Rol, UsuarioRol


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password'),
                first_name=data.get('name')
            )

            #  ASIGNAR ROL POR DEFECTO (Participante)
            rol_default = Rol.objects.get(nombre_rol="Participante")

            UsuarioRol.objects.create(
                usuario=user,
                rol=rol_default
            )

            return JsonResponse({'message': 'Usuario creado con éxito'}, status=201)

        except IntegrityError:
            return JsonResponse({'error': 'Ese usuario o email ya existe'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(username=username, password=password)

            if user is not None:

                # OBTENER ROLES DEL USUARIO
                roles_qs = UsuarioRol.objects.filter(usuario=user).select_related('rol')
                roles = [r.rol.nombre_rol for r in roles_qs]

                return JsonResponse({
                    'message': 'Inicio de sesión correcto',
                    'id': user.id,
                    'username': user.username,
                    'name': user.first_name,
                    'email': user.email,
                    'roles': roles
                }, status=200)

            else:
                return JsonResponse({'error': 'Usuario o contraseña incorrectos'}, status=400)

        except Exception as e:
            return JsonResponse({'error': 'Error en el formato de datos'}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)