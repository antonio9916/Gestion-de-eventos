import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EventosComponent } from './eventos/eventos.component';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventFormTestComponent } from './components/event-form/event-form-test.component';
import { authChildGuard, authGuard, roleGuard } from './auth/auth.guards';
import { UnauthorizedComponent } from './errors/unauthorized/unauthorized.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: '401', component: UnauthorizedComponent },
  { path: '404', component: NotFoundComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador', 'conferencista', 'participante'] },
      },
      {
        path: 'test/event-form',
        component: EventFormTestComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador'] },
      },
      {
        path: 'eventos',
        component: EventosComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador', 'conferencista', 'participante'] },
      },
      {
        path: 'eventos/:id',
        component: EventoDetalleComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador', 'conferencista', 'participante'] },
      },
      {
        path: 'eventos/crear/nuevo',
        component: EventFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador'] },
      },
      {
        path: 'eventos/editar/:id',
        component: EventFormComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'organizador'] },
      },
    ],
  },
  { path: '**', redirectTo: '404' },
];