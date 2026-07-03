import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthSessionService } from '../auth/auth-session.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { EventoInscripcionService } from './evento-inscripcion.service';
import { EventoService, EventoBackend, EventoEstado as EventoEstadoEnum } from './evento.service'; // Inyectamos el nuevo servicio

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
  private readonly eventoService = inject(EventoService);

  readonly tiposEvento = ['Conferencia', 'Taller', 'Networking', 'Feria', 'Webinar'] as const;

  readonly estadosFiltro = ['Todos', 'Activo', 'Finalizado', 'Cancelado'] as const;

  buscarNombre = '';
  tipoSeleccionado = '';
  estadoFiltro: 'Todos' | EventoEstado = 'Todos';

  todoEventos: EventoListItem[] = [];
  eventosVisibles: EventoListItem[] = [];

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: ConfirmAction | null = null;
  selectedEvento: EventoListItem | null = null;

  successOpen = false;
  successTitle = '';
  successMessage = '';
  successEvento: EventoListItem | null = null;
  inscripcionesUsuario = new Set<number>();

  ngOnInit(): void {
	console.log('ENTRE A EVENTOS COMPONENT');
	this.cargarEventosDesdeBackend();
  }

cargarEventosDesdeBackend(): void {

  this.eventoService.getEventos().subscribe({

    next: (data: EventoBackend[]) => {

      console.log('EVENTOS DJANGO', data);

      this.todoEventos = data.map(e => {

        const ahora = new Date();
        const fin = new Date(e.endDate);

        const estadoCalculado: EventoEstado =
          fin < ahora
            ? 'Finalizado'
            : 'Activo';

        return {
          id: e.id,
          nombre: e.title,
          fecha: new Date(e.startDate).toLocaleString(),
          lugar: 'Ver descripción',
          tipo:
            e.eventType.charAt(0).toUpperCase() +
            e.eventType.slice(1),
          cupo: e.maxAttendees,
          estado: estadoCalculado
        };

      });

		this.eventosVisibles = [...this.todoEventos];

		this.aplicarFiltros();
		const userId =
		this.authSession.getCurrentUser()?.id;

		if (userId) {

			this.inscripcionService
				.misInscripciones(userId)
				.subscribe({

			next: (resp: any) => {
			    console.log('MIS INSCRIPCIONES', resp);

				this.inscripcionesUsuario.clear();

					resp.eventos.forEach((id: number) => {
					this.inscripcionesUsuario.add(id);
			});

		}

	});

}
	
		
    },

    error: (err) =>
      console.error(
        'Error estirando eventos de Django:',
        err
      )
  });
}

  const userId =
    this.authSession.getCurrentUser()?.id;

  if (!userId) {
    return;
  }

  this.inscripcionService
    .isInscrito(userId, eventoId)
    .subscribe({

      next: (resp: any) => {

        if (resp.inscrito) {
          this.inscripcionesUsuario.add(eventoId);
        } else {
          this.inscripcionesUsuario.delete(eventoId);
        }

        this.eventosVisibles = [...this.todoEventos];

      },

      error: () => {}
    });

}
  aplicarFiltros(): void {
    const nombre = this.buscarNombre.trim().toLowerCase();
    const tipo = this.tipoSeleccionado;
    const estado = this.estadoFiltro;

    this.eventosVisibles = this.todoEventos.filter((e) => {
      const matchNombre = !nombre || e.nombre.toLowerCase().includes(nombre);
      const matchTipo = !tipo || e.tipo === tipo;
      const matchEstado = estado === 'Todos' || e.estado === estado;
      return matchNombre && matchTipo && matchEstado;
    });
  }

  get isParticipante(): boolean {
    return this.authSession.getRole() === 'participante';
  }

  get canManageEvents(): boolean {
    const role = this.authSession.getRole();
    return role === 'admin' || role === 'organizador';
  }

  

puedeInscribirse(evento: EventoListItem): boolean {

  return this.isParticipante &&
         evento.estado === 'Activo' &&
         !this.inscripcionesUsuario.has(evento.id);

}

puedeDesinscribirse(evento: EventoListItem): boolean {

  return this.isParticipante &&
         evento.estado === 'Activo' &&
         this.inscripcionesUsuario.has(evento.id);

}

isInscrito(evento: EventoListItem): boolean {

  return this.inscripcionesUsuario.has(evento.id);

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
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente: ${evento.nombre}?`)) {
      this.eventoService.eliminarEvento(evento.id).subscribe({
        next: () => {
          // Refrescamos la lista directamente desde la base de datos para verificar el cambio
          this.cargarEventosDesdeBackend();
        },
        error: (err) => alert('No se pudo eliminar el evento: ' + err.message)
      });
    }
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

console.log(
  'Usuario actual:',
  this.authSession.getCurrentUser()
);

  const userId =
    this.authSession.getCurrentUser()?.id;

  if (!evento || !action || !userId) {
    this.cerrarConfirmacion();
    return;
  }

  if (action === 'inscribir') {

    this.inscripcionService
      .inscribirse(userId, evento.id)
      .subscribe({
        next: () => {

		this.successEvento = evento;

		this.successTitle =
			'Inscripción exitosa';

		this.successMessage =
			`Se envió confirmación al correo: ${this.authSession.getUserEmail()}`;

		this.successOpen = true;

		this.inscripcionesUsuario.clear();

		this.cargarEventosDesdeBackend();
		this.cerrarConfirmacion();
},

        error: (err) => {
          alert(
            err.error?.error ||
            'No se pudo realizar la inscripción'
          );
        }
      });

  } else {

    this.inscripcionService
      .desinscribirse(userId, evento.id)
      .subscribe({
        next: () => {

			this.inscripcionesUsuario.clear();

			this.cargarEventosDesdeBackend();

			alert('Inscripción cancelada');
			this.cerrarConfirmacion();
		},
		

        error: (err) => {
          alert(
            err.error?.error ||
            'No se pudo cancelar la inscripción'
          );
        }
      });
  }

  
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