import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EventosComponent } from './eventos/eventos.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'eventos', component: EventosComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];