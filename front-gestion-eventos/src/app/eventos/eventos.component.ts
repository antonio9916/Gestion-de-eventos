import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthSessionService } from '../auth/auth-session.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { EventoInscripcionService } from './evento-inscripcion.service';

export type EventoEstado = 'Activo' | 'Finalizado' | 'Cancelado';

export interface EventoListItem {
  id: number;
  nombre: string;
  fecha: string;
  lugar: string;
  tipo: string;
  cupo: number;
  estado: EventoEstado;
}

type ConfirmAction = 'inscribir' | 'desinscribir';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ConfirmationModalComponent],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
})
export class EventosComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly inscripcionService = inject(EventoInscripcionService);

  readonly tiposEvento = ['Conferencia', 'Taller', 'Networking', 'Feria', 'Webinar'] as const;

  readonly estadosFiltro = ['Todos', 'Activo', 'Finalizado', 'Cancelado'] as const;

  buscarNombre = '';
  tipoSeleccionado = '';
  estadoFiltro: 'Todos' | EventoEstado = 'Todos';

  private readonly mockEventos: EventoListItem[] = [
    {
      id: 1,
      nombre: 'Cumbre de Innovación 2026',
      fecha: '15 abr 2026, 09:00',
      lugar: 'Centro de Convenciones Norte',
      tipo: 'Conferencia',
      cupo: 350,
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Taller UX para equipos',
      fecha: '22 abr 2026, 14:00',
      lugar: 'Aula Magna — Campus Central',
      tipo: 'Taller',
      cupo: 40,
      estado: 'Activo',
    },
    {
      id: 3,
      nombre: 'Meetup Desarrolladores',
      fecha: '3 mar 2026, 18:30',
      lugar: 'Hub Coworking',
      tipo: 'Networking',
      cupo: 80,
      estado: 'Finalizado',
    },
    {
      id: 4,
      nombre: 'Feria de Empleo Tech',
      fecha: '10 may 2026, 10:00',
      lugar: 'Pabellón Sur',
      tipo: 'Feria',
      cupo: 500,
      estado: 'Cancelado',
    },
    {
      id: 5,
      nombre: 'Webinar seguridad en la nube',
      fecha: '28 abr 2026, 11:00',
      lugar: 'Online',
      tipo: 'Webinar',
      cupo: 200,
      estado: 'Activo',
    },
    {
      id: 6,
      nombre: 'Hackathon 48h',
      fecha: '1 feb 2026, 08:00',
      lugar: 'Laboratorio de Software',
      tipo: 'Taller',
      cupo: 120,
      estado: 'Finalizado',
    },
  ];

  eventosVisibles: EventoListItem[] = [...this.mockEventos];
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: ConfirmAction | null = null;
  selectedEvento: EventoListItem | null = null;

  successOpen = false;
  successTitle = '';
  successMessage = '';
  successEvento: EventoListItem | null = null;

  aplicarFiltros(): void {
    const nombre = this.buscarNombre.trim().toLowerCase();
    const tipo = this.tipoSeleccionado;
    const estado = this.estadoFiltro;

    this.eventosVisibles = this.mockEventos.filter((e) => {
      const matchNombre = !nombre || e.nombre.toLowerCase().includes(nombre);
      const matchTipo = !tipo || e.tipo === tipo;
      const matchEstado = estado === 'Todos' || e.estado === estado;
      return matchNombre && matchTipo && matchEstado;
    });
  }

  get isParticipante(): boolean {
    return this.authSession.getRole() === 'participante';
  }

  puedeInscribirse(evento: EventoListItem): boolean {
    return this.isParticipante && evento.estado === 'Activo' && !this.isInscrito(evento);
  }

  puedeDesinscribirse(evento: EventoListItem): boolean {
    return this.isParticipante && evento.estado === 'Activo' && this.isInscrito(evento);
  }

  isInscrito(evento: EventoListItem): boolean {
    const username = this.authSession.getCurrentUser()?.username;
    if (!username) {
      return false;
    }
    return this.inscripcionService.isInscrito(username, evento.id);
  }

  crearEvento(): void {
    void this.router.navigate(['/eventos/crear/nuevo']);
  }

  verDetalle(evento: EventoListItem): void {
    void this.router.navigate(['/eventos', evento.id]);
  }

  editar(evento: EventoListItem): void {
    void this.router.navigate(['/eventos/editar', evento.id]);
  }

  eliminar(evento: EventoListItem): void {
    window.alert(`Eliminar: ${evento.nombre}`);
  }

  solicitarInscripcion(evento: EventoListItem): void {
    this.selectedEvento = evento;
    this.confirmAction = 'inscribir';
    this.confirmTitle = 'Confirmar inscripción';
    this.confirmMessage = '¿Estás seguro que deseas inscribirte a este evento?';
    this.confirmOpen = true;
  }

  solicitarDesinscripcion(evento: EventoListItem): void {
    this.selectedEvento = evento;
    this.confirmAction = 'desinscribir';
    this.confirmTitle = 'Confirmar desinscripción';
    this.confirmMessage = '¿Estás seguro que deseas desinscribirte de este evento?';
    this.confirmOpen = true;
  }

  confirmarAccion(): void {
    const evento = this.selectedEvento;
    const action = this.confirmAction;
    const username = this.authSession.getCurrentUser()?.username;
    if (!evento || !action || !username || evento.estado !== 'Activo') {
      this.cerrarConfirmacion();
      return;
    }

    if (action === 'inscribir') {
      this.inscripcionService.inscribirse(username, evento.id);
      this.successEvento = evento;
      this.successTitle = 'Inscripción exitosa';
      this.successMessage = `Se envió confirmación al correo: ${this.authSession.getUserEmail() ?? username}`;
      this.successOpen = true;
    } else {
      this.inscripcionService.desinscribirse(username, evento.id);
    }

    this.cerrarConfirmacion();
  }

  cerrarConfirmacion(): void {
    this.confirmOpen = false;
    this.confirmAction = null;
    this.selectedEvento = null;
  }

  cerrarExito(): void {
    this.successOpen = false;
    this.successEvento = null;
  }
}
