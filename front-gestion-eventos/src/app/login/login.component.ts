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

interface LoginResponse {
  id: number;
  username: string;
  email: string;
  name?: string;
  role: string;
  access: string;
  refresh: string;
}

interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  name: string;
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
  isLoading = false;

  roles = ['Administrador', 'Participante', 'Organizador', 'Conferencista'];

  login(): void {
    this.message = '';
    this.errorMessage = '';
    this.isLoading = true;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos.';
      this.isLoading = false;
      return;
    }

    const loginData = this.loginForm.value;

    this.http.post<LoginResponse>('http://localhost:8000/api/login/', loginData).subscribe({
      next: (response: LoginResponse) => {

        console.log('Respuesta del servidor:', response);

        // Guardar tokens JWT
        this.authSession.saveJWTTokens(response.access, response.refresh);

        // Guardar datos del usuario en sesión
        this.authSession.saveAuthenticatedUser({
          id: response.id,
          username: response.username,
          email: response.email,
          name: response.name || response.username,
          role: response.role || 'Participante'
        });

        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.isLoading = false;

        if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. ¿Está encendido Django?';
        } else if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else {
          this.errorMessage = error.error?.error || 'Error al iniciar sesión.';
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
    this.isLoading = true;

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      this.isLoading = false;
      return;
    }

    const newUser = this.registerForm.value;

    this.http.post<RegisterResponse>('http://localhost:8000/api/register/', newUser).subscribe({
      next: (response: RegisterResponse) => {
        this.message = 'Usuario creado correctamente. Ahora puedes iniciar sesión.';
        this.registerForm.reset({ role: 'Participante' });
        this.showRegister = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.isLoading = false;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.error || 'Los datos ingresados no son válidos.';
        } else {
          this.errorMessage = error.error?.error || 'Error al registrar el usuario.';
        }
      }
    });
  }
}
