import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { HttpClient } from '@angular/common/http';

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private http = inject(HttpClient);

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

  login(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    const loginData = this.loginForm.value;

    this.http.post('http://localhost:8000/api/login/', loginData).subscribe({
      next: (response: any) => {

        console.log('Respuesta del servidor:', response);

        // Convertimos el rol único de Django en un arreglo para cumplir con la interfaz UserAccount
        const userRoles = response.role ? [response.role] : ['Participante'];

        // GUARDAR USUARIO REAL (con roles adaptados a arreglo)
        const user: UserAccount = {
          id: response.id,
          name: response.name || response.username, // Usa el nombre si viene, sino el username
          email: response.email,
          roles: userRoles
        };

        // Pasamos los datos exactos que tu AuthSessionService espera procesar
        this.authSession.saveAuthenticatedUser({
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role || 'Participante' // Aquí le pasamos el string directo en singular
        });

        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en el login:', error);

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. ¿Está encendido Django?';
        } else {
          this.errorMessage = error.error?.error || 'Usuario o contraseña incorrectos.';
        }
      }
    });
  }

  toggleRegister(): void {
    this.showRegister = !this.showRegister;
    this.errorMessage = '';
    this.message = '';
  }

  register(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      return;
    }

    const newUser = this.registerForm.value;

    this.http.post('http://localhost:8000/api/register/', newUser).subscribe({
      next: () => {
        this.message = 'Usuario creado correctamente. Ahora puedes iniciar sesión.';
        this.registerForm.reset({ role: 'Participante' });
        this.showRegister = false;
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.errorMessage = error.error?.error || 'Error al registrar el usuario.';
      }
    });
  }
}