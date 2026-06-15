from django.urls import path
from .views import (
    login_view,
    register_view,
    evento_api_view,
    inscripcion_view,
    cancelar_inscripcion_view,
    verificar_inscripcion_view,
    participantes_evento_view
)

urlpatterns = [
    path('login/', login_view),
    path('register/', register_view),

    path('eventos/', evento_api_view),
    path('eventos/<int:pk>/', evento_api_view),

    path('inscripciones/', inscripcion_view),
    path('inscripciones/cancelar/', cancelar_inscripcion_view),

    path(
        'inscripciones/verificar/<int:evento_id>/<int:usuario_id>/',
        verificar_inscripcion_view
    ),

    path(
        'eventos/<int:evento_id>/participantes/',
        participantes_evento_view
    ),
]