import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthSessionService } from '../auth/auth-session.service';
import { ACTIVIDADES_MOCK, ActividadItem } from './actividades.mock';

@Component({
  selector: 'app-actividad-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './actividad-detalle.component.html',
  styleUrl: './actividad-detalle.component.scss',
})
export class ActividadDetalleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private sub?: Subscription;

  actividad: ActividadItem | null = null;

  ngOnInit(): void {
    this.applyRouteId(this.route.snapshot.paramMap.get('id'));
    this.sub = this.route.paramMap.subscribe((params) => this.applyRouteId(params.get('id')));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get conferencistasText(): string {
    if (!this.actividad) {
      return 'Sin asignar';
    }
    return this.actividad.conferencistas.length > 0
      ? this.actividad.conferencistas.join(', ')
      : 'Sin asignar';
  }

  get isConferencista(): boolean {
    return this.authSession.getRole() === 'conferencista';
  }

  private applyRouteId(raw: string | null): void {
    const id = raw !== null ? Number(raw) : NaN;
    const found = Number.isFinite(id) ? ACTIVIDADES_MOCK.find((item) => item.id === id) : undefined;
    if (!found) {
      this.actividad = null;
      return;
    }

    const role = this.authSession.getRole();
    const userId = this.authSession.getCurrentUser()?.id;
    if (role === 'conferencista' && found.idUsuarioConferencista !== userId) {
      this.actividad = null;
      void this.router.navigate(['/401']);
      return;
    }

    this.actividad = found;
  }
}
