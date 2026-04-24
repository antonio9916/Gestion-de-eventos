import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthSessionService } from '../auth/auth-session.service';
import { ACTIVIDADES_MOCK, ActividadItem } from './actividades.mock';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.scss',
})
export class ActividadesComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);

  readonly actividades: ActividadItem[] = this.buildVisibleActivities();

  private buildVisibleActivities(): ActividadItem[] {
    if (!this.isConferencista) {
      return ACTIVIDADES_MOCK;
    }
    const userId = this.authSession.getCurrentUser()?.id;
    if (typeof userId !== 'number') {
      return [];
    }
    return ACTIVIDADES_MOCK.filter((actividad) => actividad.idUsuarioConferencista === userId);
  }

  get isConferencista(): boolean {
    return this.authSession.getRole() === 'conferencista';
  }

  get canManageActivities(): boolean {
    const role = this.authSession.getRole();
    return role === 'admin' || role === 'organizador';
  }

  getConferencistasText(actividad: ActividadItem): string {
    return actividad.conferencistas.length > 0 ? actividad.conferencistas.join(', ') : 'Sin asignar';
  }

  verDetalle(actividad: ActividadItem): void {
    void this.router.navigate(['/actividades', actividad.id]);
  }

  editarActividad(actividad: ActividadItem): void {
    window.alert(`Editar actividad: ${actividad.titulo}`);
  }

  eliminarActividad(actividad: ActividadItem): void {
    window.alert(`Eliminar actividad: ${actividad.titulo}`);
  }

  asignarConferencista(actividad: ActividadItem): void {
    window.alert(`Asignar conferencista a: ${actividad.titulo}`);
  }
}
