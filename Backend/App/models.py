from django.db import models
from django.contrib.auth.models import User

# --- ROLES ---
class Rol(models.Model):
    nombre_rol = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_rol

class UsuarioRol(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('usuario', 'rol')


# --- EVENTOS (Adaptado a Angular & PostgreSQL) ---
class Evento(models.Model):
    TIPOS_EVENTO = [
        ('conferencia', 'Conferencia'),
        ('taller', 'Taller'),
        ('seminario', 'Seminario'),
        ('networking', 'Networking'),
        ('otro', 'Otro'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    eventType = models.CharField(max_length=50, choices=TIPOS_EVENTO, default='otro')
    startDate = models.DateTimeField()
    endDate = models.DateTimeField()
    maxAttendees = models.PositiveIntegerField()
    inscriptionPolicy = models.TextField()
    organizador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title
        
        # --- INSCRIPCIONES ---
class Inscripcion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('usuario', 'evento')

    def __str__(self):
        return f"{self.usuario.username} -> {self.evento.title}"