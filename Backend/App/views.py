from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from .models import Rol, UsuarioRol, Evento

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')

            if not username or not password or not email:
                return JsonResponse({'error': 'Faltan campos requeridos'}, status=400)

            # Crear el usuario nativo de Django
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=name if name else ""
            )

            # Asignar Rol por defecto ("Participante") garantizando que exista
            rol_default, _ = Rol.objects.get_or_create(nombre_rol="Participante")

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
                # Obtener el rol principal del usuario
                rol_usuario = UsuarioRol.objects.filter(usuario=user).select_related('rol').first()
                
                # Si por algún motivo no tiene rol, le asignamos Participante temporalmente
                nombre_rol = rol_usuario.rol.nombre_rol if rol_usuario else "Participante"

                # Estructura exacta que espera AuthSessionService de Angular
                return JsonResponse({
                    'message': 'Inicio de sesión correcto',
                    'id': user.id,
                    'username': user.username,
                    'name': user.first_name,
                    'email': user.email,
                    'role': nombre_rol  # Enviado en singular para que Angular lo mapee bien
                }, status=200)

            else:
                return JsonResponse({'error': 'Usuario o contraseña incorrectos'}, status=400)

        except Exception as e:
            # Esto imprimirá el error real en la terminal donde corre Django
            print(f"ERROR REAL EN LOGIN: {str(e)}") 
            return JsonResponse({'error': f'Error interno: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Método no permitido'}, status=405)
    
@csrf_exempt
def evento_api_view(request, pk=None):
    # --- OBTENER UNO O LISTAR TODOS ---
    if request.method == 'GET':
        if pk:
            evento = get_object_or_404(Evento, pk=pk)
            return JsonResponse({
                'id': evento.id,
                'title': evento.title,
                'description': evento.description,
                'eventType': evento.eventType,
                'startDate': evento.startDate.isoformat(),
                'endDate': evento.endDate.isoformat(),
                'maxAttendees': evento.maxAttendees,
                'inscriptionPolicy': evento.inscriptionPolicy
            })
        else:
            eventos = Evento.objects.all().order_by('-startDate')
            data = [{
                'id': e.id,
                'title': e.title,
                'description': e.description,
                'eventType': e.eventType,
                'startDate': e.startDate.isoformat(),
                'endDate': e.endDate.isoformat(),
                'maxAttendees': e.maxAttendees,
                'inscriptionPolicy': e.inscriptionPolicy
            } for e in eventos]
            return JsonResponse(data, safe=False)

    # --- CREAR EVENTO ---
    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
            evento = Evento.objects.create(
                title=body.get('title'),
                description=body.get('description'),
                eventType=body.get('eventType'),
                startDate=parse_datetime(body.get('startDate')),
                endDate=parse_datetime(body.get('endDate')),
                maxAttendees=int(body.get('maxAttendees')),
                inscriptionPolicy=body.get('inscriptionPolicy')
            )
            return JsonResponse({'message': 'Evento creado', 'id': evento.id}, status=201)
        except Exception as e:
            return JsonResponse({'error': f'Datos inválidos: {str(e)}'}, status=400)

    # --- ACTUALIZAR EVENTO ---
    elif request.method == 'PUT':
        if not pk:
            return JsonResponse({'error': 'ID requerido'}, status=400)
        try:
            body = json.loads(request.body)
            evento = get_object_or_404(Evento, pk=pk)
            
            evento.title = body.get('title', evento.title)
            evento.description = body.get('description', evento.description)
            evento.eventType = body.get('eventType', evento.eventType)
            evento.startDate = parse_datetime(body.get('startDate')) or evento.startDate
            evento.endDate = parse_datetime(body.get('endDate')) or evento.endDate
            evento.maxAttendees = int(body.get('maxAttendees')) if body.get('maxAttendees') else evento.maxAttendees
            evento.inscriptionPolicy = body.get('inscriptionPolicy', evento.inscriptionPolicy)
            
            evento.save()
            return JsonResponse({'message': 'Evento actualizado con éxito'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    # --- ELIMINAR EVENTO ---
    elif request.method == 'DELETE':
        if not pk:
            return JsonResponse({'error': 'ID requerido'}, status=400)
        evento = get_object_or_404(Evento, pk=pk)
        evento.delete()
        return JsonResponse({'message': 'Evento eliminado correctamente'}, status=200)

    return JsonResponse({'error': 'Método no soportado'}, status=405)