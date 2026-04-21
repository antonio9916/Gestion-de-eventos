import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { EventosComponent } from './eventos/eventos.component';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventFormTestComponent } from './components/event-form/event-form-test.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'test/event-form', component: EventFormTestComponent },
      { path: 'eventos', component: EventosComponent },
      { path: 'eventos/:id', component: EventoDetalleComponent },
      { path: 'eventos/crear/nuevo', component: EventFormComponent },
      { path: 'eventos/editar/:id', component: EventFormComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];