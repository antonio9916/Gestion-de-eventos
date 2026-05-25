from django.urls import path
from .views import login_view, register_view, evento_api_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('eventos/', evento_api_view, name='eventos_lista_crea'),
    path('eventos/<int:pk>/', evento_api_view, name='evento_detalle_update_delete'),
]