from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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

            # authenticate verifica las credenciales contra la base de datos
            user = authenticate(username=username, password=password)

            if user is not None:
                return JsonResponse({
                    'message': 'Inicio de sesión correcto',
                    'user': {
                        'username': user.username,
                        'name': user.first_name
                    }
                }, status=200)
            else:
                return JsonResponse({'error': 'Usuario o contraseña incorrectos'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Error en el formato de datos'}, status=400)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)