import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { HttpClient } from '@angular/common/http'; // Modificado

export interface UserAccount {
  id?: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  users: UserAccount[] = [
    {
      id: 1,
      name: 'Laura Gómez',
      username: 'admin_laura',
      email: 'laura.gomez@example.com',
      password: 'Admin123!',
      role: 'Administrador',
    },
    {
      id: 2,
      name: 'Carlos Méndez',
      username: 'participante_carlos',
      email: 'carlos.mendez@example.com',
      password: 'Parti456$',
      role: 'Participante',
    },
    {
      id: 3,
      name: 'María Torres',
      username: 'organizador_maria',
      email: 'maria.torres@example.com',
      password: 'Organiza789#',
      role: 'Organizador',
    },
    {
      id: 4,
      name: 'Ricardo Salas',
      username: 'conferencista_ricardo',
      email: 'ricardo.salas@example.com',
      password: 'Speaker321@',
      role: 'Conferencista',
    },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private http = inject(HttpClient);  // Modificado

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['Participante', Validators.required],
  });

  showRegister = false;
  message = '';
  errorMessage = '';

  roles = ['Administrador', 'Participante', 'Organizador', 'Conferencista'];

 login(): void {    // Modificado el Login completo
  this.message = '';
  this.errorMessage = '';

  if (this.loginForm.invalid) {
    this.errorMessage = 'Por favor completa todos los campos.';
    return;
  }

  // Obtenemos los datos del formulario
  const loginData = this.loginForm.value;

  // Hacemos la petición POST a Django
  this.http.post('http://localhost:8000/api/login/', loginData).subscribe({
    next: (response: any) => {
      // Si Django responde con éxito (status 200)
      console.log('Respuesta del servidor:', response);
      this.router.navigate(['/home']);
    },
    error: (error) => {
      // Si Django responde con error (status 400, 404, 500, etc.)
      console.error('Error en el login:', error);
      if (error.status === 0) {
        this.errorMessage = 'No se pudo conectar con el servidor. ¿Está encendido Django?';
      } else {
        this.errorMessage = error.error.error || 'Usuario o contraseña incorrectos.';
      }
    }
  });
}

  toggleRegister(): void {
    this.showRegister = !this.showRegister;
    this.errorMessage = '';
    this.message = '';
  }

  register(): void { // Modificado el registro completo 
  this.message = '';
  this.errorMessage = '';

  if (this.registerForm.invalid) {
    this.errorMessage = 'Por favor completa todos los campos correctamente.';
    return;
  }

  const newUser = this.registerForm.value;

  // Enviamos el nuevo usuario a Django
  this.http.post('http://localhost:8000/api/register/', newUser).subscribe({
    next: (response: any) => {
      this.message = 'Usuario creado correctamente en la base de datos. Ahora puedes iniciar sesión.';
      this.registerForm.reset({ role: 'Participante' });
      this.showRegister = false;
    },
    error: (error) => {
      console.error('Error en el registro:', error);
      this.errorMessage = error.error.error || 'Error al registrar el usuario.';
    }
  });
}
}
