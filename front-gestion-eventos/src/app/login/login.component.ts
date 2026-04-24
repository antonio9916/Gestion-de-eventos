import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';

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

    const { username, password } = this.loginForm.value;
    const user = this.users.find(
      (account) => account.username === username && account.password === password
    );

    if (!user) {
      this.errorMessage = 'Usuario o contraseña incorrectos.';
      return;
    }

    this.authSession.saveAuthenticatedUser({
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    this.router.navigate(['/home']);
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

    const newUser: UserAccount = this.registerForm.value as UserAccount;
    const exists = this.users.some((account) => account.username === newUser.username || account.email === newUser.email);

    if (exists) {
      this.errorMessage = 'El nombre de usuario o correo ya existen.';
      return;
    }

    const nextId = Math.max(...this.users.map((account) => account.id ?? 0), 0) + 1;
    this.users.push({ ...newUser, id: nextId });
    this.message = 'Usuario creado correctamente. Ahora puedes iniciar sesión.';
    this.registerForm.reset({ role: 'Participante' });
    this.showRegister = false;
  }
}
