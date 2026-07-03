from django.urls import path
from .views import (
    login_view,
    register_view,
    evento_api_view,
    inscripcion_view,
    cancelar_inscripcion_view,
    verificar_inscripcion_view,
    participantes_evento_view,
    inscripciones_usuario_view
)
from .role_views import (
    crear_rol_view,
    listar_roles_view,
    asignar_rol_view,
    remover_rol_view,
    listar_usuarios_view,
    usuario_detalle_view
)

urlpatterns = [
    # Auth
    path('login/', login_view),
    path('register/', register_view),

    # Eventos
    path('eventos/', evento_api_view),
    path('eventos/<int:pk>/', evento_api_view),

    # Inscripciones
    path('inscripciones/', inscripcion_view),
    path('inscripciones/cancelar/', cancelar_inscripcion_view),
    path('inscripciones/verificar/<int:evento_id>/<int:usuario_id>/', verificar_inscripcion_view),

    # Participantes
    path('eventos/<int:evento_id>/participantes/', participantes_evento_view),
    path('usuarios/<int:usuario_id>/inscripciones/', inscripciones_usuario_view),

    # Roles (nuevos)
    path('roles/', listar_roles_view),
    path('roles/crear/', crear_rol_view),
    path('usuarios/asignar-rol/', asignar_rol_view),
    path('usuarios/remover-rol/', remover_rol_view),

    # Usuarios
    path('usuarios/', listar_usuarios_view),
    path('usuarios/<int:usuario_id>/', usuario_detalle_view),
]
