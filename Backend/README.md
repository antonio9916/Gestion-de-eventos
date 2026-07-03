# Backend - Sistema de Gestión de Eventos

## Stack
- **Python 3.11+**
- **Django 5.2**
- **Django REST Framework**
- **Django REST Framework SimpleJWT** (autenticación con JWT)
- **PostgreSQL** (base de datos)
- **CORS Headers** (para comunicación con frontend Angular)

## Configuración Inicial

### 1. Crear entorno virtual
```bash
cd Backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
```

### 2. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 3. Configurar base de datos PostgreSQL
Asegúrate de que PostgreSQL esté corriendo en tu máquina. Crea la base de datos:
```bash
psql -U postgres
CREATE DATABASE gestion_eventos;
```

Configura las credenciales en `Backend/config/settings.py` (líneas 80-88):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gestion_eventos',
        'USER': 'postgres',
        'PASSWORD': 'aguante18',  # Cambia si es necesario
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### 4. Ejecutar migraciones
```bash
cd Backend
python manage.py migrate
```

### 5. Crear usuarios de prueba
```bash
python manage.py create_test_users
```

Esto creará:
- **Admin**: username `antonio`, password `aguante18`
- **Usuario 1**: username `johana`, password `aguante18`
- **Usuario 2**: username `german`, password `aguante18`

### 6. Iniciar servidor de desarrollo
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

---

## Autenticación con JWT

### Obtener token
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"antonio","password":"aguante18"}'
```

**Respuesta:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Usar token en requests
```bash
curl -X GET http://localhost:8000/api/eventos/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Refrescar token
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<REFRESH_TOKEN>"}'
```

---

## Endpoints API

### Autenticación
- `POST /api/register/` - Registrar usuario
- `POST /api/login/` - Login (devuelve datos de usuario, no JWT; usar `/api/token/` para JWT)
- `POST /api/token/` - Obtener JWT token
- `POST /api/token/refresh/` - Refrescar JWT token

### Eventos
- `GET /api/eventos/` - Listar todos los eventos
- `GET /api/eventos/<id>/` - Obtener detalle de evento
- `POST /api/eventos/` - Crear evento (requiere autenticación)
- `PUT /api/eventos/<id>/` - Editar evento (requiere ser organizador o staff)
- `DELETE /api/eventos/<id>/` - Eliminar evento (requiere ser organizador o staff)

### Inscripciones
- `POST /api/inscripciones/` - Inscribirse a un evento (requiere autenticación)
- `POST /api/inscripciones/cancelar/` - Cancelar inscripción (requiere autenticación)
- `GET /api/inscripciones/verificar/<evento_id>/<usuario_id>/` - Verificar si está inscrito
- `GET /api/usuarios/<usuario_id>/inscripciones/` - Listar eventos del usuario

### Participantes
- `GET /api/eventos/<evento_id>/participantes/` - Listar participantes de un evento

### Roles (requieren permisos admin)
- `GET /api/roles/` - Listar todos los roles
- `POST /api/roles/crear/` - Crear nuevo rol (requiere admin)
- `POST /api/usuarios/asignar-rol/` - Asignar rol a usuario (requiere admin)
- `POST /api/usuarios/remover-rol/` - Remover rol de usuario (requiere admin)

### Usuarios
- `GET /api/usuarios/` - Listar usuarios (requiere admin)
- `GET /api/usuarios/<usuario_id>/` - Obtener detalle de usuario (requiere autenticación)

---

## Ejemplos de Uso

### Ejemplo 1: Crear evento
```bash
ACCESS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

curl -X POST http://localhost:8000/api/eventos/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Conferencia de Python",
    "description": "Una conferencia sobre Python avanzado",
    "eventType": "conferencia",
    "startDate": "2026-08-15T10:00:00Z",
    "endDate": "2026-08-15T12:00:00Z",
    "maxAttendees": 100,
    "inscriptionPolicy": "Inscripción abierta hasta 1 día antes del evento"
  }'
```

### Ejemplo 2: Inscribirse a evento
```bash
curl -X POST http://localhost:8000/api/inscripciones/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"evento_id": 1}'
```

### Ejemplo 3: Listar participantes
```bash
curl -X GET http://localhost:8000/api/eventos/1/participantes/
```

### Ejemplo 4: Asignar rol (admin)
```bash
curl -X POST http://localhost:8000/api/usuarios/asignar-rol/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuario_id": 2, "rol_id": 1}'
```

---

## Ejecutar Tests

```bash
cd Backend
python manage.py test App.tests -v 2
```

Tests incluyen:
- Validación de eventos (fechas, capacidad)
- Control de cupos en inscripciones
- Permisos (autenticación requerida para operaciones sensibles)
- Prevención de inscripciones duplicadas
- Cancelación de inscripciones

---

## Estructura del Proyecto

```
Backend/
├── App/
│   ├── migrations/          # Migraciones de base de datos
│   ├── management/
│   │   └── commands/
│   │       └── create_test_users.py
│   ├── admin.py             # Admin de Django
│   ├── apps.py
│   ├── models.py            # Modelos: Rol, UsuarioRol, Evento, Inscripcion
│   ├── serializers.py       # Serializers DRF
│   ├── views.py             # Vistas de API (auth, eventos, inscripciones)
│   ├── role_views.py        # Vistas de gestión de roles
│   ├── urls.py              # Rutas de API
│   └── tests.py             # Tests unitarios
├── config/
│   ├── settings.py          # Configuración Django
│   ├── urls.py              # URLs raíz
│   ├── asgi.py
│   └── wsgi.py
├── manage.py
└── requirements.txt
```

---

## Cambios Recientes (Rama actu-fix-backend)

### Migraciones a DRF + JWT
1. **Serializers** (serializers.py) - Validaciones en EventoSerializer e InscripcionSerializer
2. **Vistas actualizadas** (views.py) - Uso de DRF decorators (@api_view, @permission_classes)
3. **Control de permisos** - IsAuthenticated, IsAdminUser en endpoints sensibles
4. **Validaciones mejoradas** - Cupos, fechas, campos obligatorios
5. **Gestión de roles** (role_views.py) - Endpoints para crear, listar, asignar, remover roles
6. **Tests completos** (tests.py) - Casos de prueba para eventos e inscripciones

---

## Notas de Seguridad

- En producción, cambiar `DEBUG = False` en settings.py
- Usar variables de entorno para credenciales (no hardcodear en settings)
- Cambiar CORS_ALLOW_ALL_ORIGINS a un dominio específico
- Usar HTTPS en producción
- Configurar SECRET_KEY con un valor seguro

---

## Troubleshooting

### Error: "could not translate host name "localhost" to address"
Verifica que PostgreSQL esté corriendo. En Linux/Mac:
```bash
brew services start postgresql
```

### Error: "psycopg2" not found
Instala el adaptador PostgreSQL:
```bash
pip install psycopg2-binary
```

### Error: "No module named 'rest_framework'"
Reinstala dependencias:
```bash
pip install -r requirements.txt
```

---

## Contacto / Soporte
Para preguntas sobre el backend, revisar el código en los archivos mencionados arriba.
