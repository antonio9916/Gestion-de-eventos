from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from App.models import Rol, UsuarioRol


class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        # Create roles
        rol_admin, _ = Rol.objects.get_or_create(nombre_rol="Administrador")
        rol_participante, _ = Rol.objects.get_or_create(nombre_rol="Participante")

        # Create admin user
        admin_user, created = User.objects.get_or_create(
            username='antonio',
            defaults={
                'email': 'aijoaijo09@gmail.com',
                'first_name': 'Antonio',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('aguante18')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Created admin user: antonio'))
        else:
            self.stdout.write('Admin user antonio already exists')

        # Assign admin role to antonio
        UsuarioRol.objects.get_or_create(usuario=admin_user, rol=rol_admin)

        # Create regular user: johana
        johana_user, created = User.objects.get_or_create(
            username='johana',
            defaults={
                'email': 'johana@example.com',
                'first_name': 'Johana',
            }
        )
        if created:
            johana_user.set_password('aguante18')
            johana_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Created user: johana'))
        else:
            self.stdout.write('User johana already exists')

        UsuarioRol.objects.get_or_create(usuario=johana_user, rol=rol_participante)

        # Create regular user: german
        german_user, created = User.objects.get_or_create(
            username='german',
            defaults={
                'email': 'german@example.com',
                'first_name': 'German',
            }
        )
        if created:
            german_user.set_password('aguante18')
            german_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Created user: german'))
        else:
            self.stdout.write('User german already exists')

        UsuarioRol.objects.get_or_create(usuario=german_user, rol=rol_participante)

        self.stdout.write(self.style.SUCCESS('\n✓ Test users setup complete!'))
        self.stdout.write('\nCredenciales de prueba:')
        self.stdout.write('Admin: username=antonio, password=aguante18')
        self.stdout.write('Usuario 1: username=johana, password=aguante18')
        self.stdout.write('Usuario 2: username=german, password=aguante18')
