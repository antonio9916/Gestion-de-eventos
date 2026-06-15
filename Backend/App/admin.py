from django.contrib import admin
from .models import (
    Rol,
    UsuarioRol,
    Evento,
    Inscripcion
)

admin.site.register(Rol)
admin.site.register(UsuarioRol)
admin.site.register(Evento)
admin.site.register(Inscripcion)