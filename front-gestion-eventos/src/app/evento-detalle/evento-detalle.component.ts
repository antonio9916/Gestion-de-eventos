import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AuthSessionService } from '../auth/auth-session.service';
import { EventoInscripcionService } from '../eventos/evento-inscripcion.service';
export type EventoEstado = 'Activo' | 'Finalizado' | 'Cancelado';

export interface ActividadItem {
  id: number;
  nombre: string;
  horario: string;
  conferencista: string;
  estado: EventoEstado;
}

export interface ParticipanteItem {
  nombre: string;
  correo: string;
}

export interface EventoDetalle {
  id: number;
  nombre: string;
  fecha: string;
  lugar: string;
  tipo: string;
  inscritos: number;
  cupoMax: number;
  estado: EventoEstado;
  actividades: ActividadItem[];
  participantes: ParticipanteItem[];
}

const MOCK_DETALLE: Record<number, EventoDetalle> = {
  1: {
    id: 1,
    nombre: 'Cumbre de Innovación 2026',
    fecha: '15 abr 2026, 09:00',
    lugar: 'Centro de Convenciones Norte',
    tipo: 'Conferencia',
    inscritos: 210,
    cupoMax: 350,
    estado: 'Activo',
    actividades: [
      {
        id: 101,
        nombre: 'Apertura y bienvenida',
        horario: '09:00 – 09:30',
        conferencista: 'María González',
        estado: 'Finalizado',
      },
      {
        id: 102,
        nombre: 'Panel: IA y producto',
        horario: '10:00 – 11:30',
        conferencista: 'Dr. Luis Paredes',
        estado: 'Activo',
      },
      {
        id: 103,
        nombre: 'Taller práctico de prototipado',
        horario: '12:00 – 14:00',
        conferencista: 'Ana Ruiz',
        estado: 'Activo',
      },
    ],
    participantes: [
      { nombre: 'Carla Méndez', correo: 'carla.mendez@example.com' },
      { nombre: 'Jorge Ibáñez', correo: 'jorge.ibanez@example.com' },
      { nombre: 'Lucía Ferrer', correo: 'lucia.ferrer@example.com' },
    ],
  },
  2: {
    id: 2,
    nombre: 'Taller UX para equipos',
    fecha: '22 abr 2026, 14:00',
    lugar: 'Aula Magna — Campus Central',
    tipo: 'Taller',
    inscritos: 28,
    cupoMax: 40,
    estado: 'Activo',
    actividades: [
      {
        id: 201,
        nombre: 'Mapas de empatía',
        horario: '14:00 – 15:30',
        conferencista: 'Paula Soto',
        estado: 'Activo',
      },
      {
        id: 202,
        nombre: 'Pruebas de usabilidad express',
        horario: '16:00 – 18:00',
        conferencista: 'Diego Mora',
        estado: 'Activo',
      },
    ],
    participantes: [
      { nombre: 'Natalia Costa', correo: 'natalia.costa@example.com' },
      { nombre: 'Martín Vega', correo: 'martin.vega@example.com' },
    ],
  },
  3: {
    id: 3,
    nombre: 'Meetup Desarrolladores',
    fecha: '3 mar 2026, 18:30',
    lugar: 'Hub Coworking',
    tipo: 'Networking',
    inscritos: 80,
    cupoMax: 80,
    estado: 'Finalizado',
    actividades: [
      {
        id: 301,
        nombre: 'Lightning talks',
        horario: '18:30 – 19:30',
        conferencista: 'Varios',
        estado: 'Finalizado',
      },
      {
        id: 302,
        nombre: 'Networking libre',
        horario: '19:30 – 21:00',
        conferencista: '—',
        estado: 'Finalizado',
      },
    ],
    participantes: [
      { nombre: 'Sofía Herrera', correo: 'sofia.herrera@example.com' },
      { nombre: 'Tomás Núñez', correo: 'tomas.nunez@example.com' },
    ],
  },
  4: {
    id: 4,
    nombre: 'Feria de Empleo Tech',
    fecha: '10 may 2026, 10:00',
    lugar: 'Pabellón Sur',
    tipo: 'Feria',
    inscritos: 0,
    cupoMax: 500,
    estado: 'Cancelado',
    actividades: [
      {
        id: 401,
        nombre: 'Stands empresas',
        horario: '10:00 – 14:00',
        conferencista: '—',
        estado: 'Cancelado',
      },
    ],
    participantes: [],
  },
  5: {
    id: 5,
    nombre: 'Webinar seguridad en la nube',
    fecha: '28 abr 2026, 11:00',
    lugar: 'Online',
    tipo: 'Webinar',
    inscritos: 142,
    cupoMax: 200,
    estado: 'Activo',
    actividades: [
      {
        id: 501,
        nombre: 'Buenas prácticas IAM',
        horario: '11:00 – 11:45',
        conferencista: 'Ing. Roberto Paz',
        estado: 'Activo',
      },
      {
        id: 502,
        nombre: 'Q&A en vivo',
        horario: '11:45 – 12:15',
        conferencista: 'Equipo seguridad',
        estado: 'Activo',
      },
    ],
    participantes: [
      { nombre: 'Elena Vidal', correo: 'elena.vidal@example.com' },
      { nombre: 'Pablo Duarte', correo: 'pablo.duarte@example.com' },
    ],
  },
  6: {
    id: 6,
    nombre: 'Hackathon 48h',
    fecha: '1 feb 2026, 08:00',
    lugar: 'Laboratorio de Software',
    tipo: 'Taller',
    inscritos: 120,
    cupoMax: 120,
    estado: 'Finalizado',
    actividades: [
      {
        id: 601,
        nombre: 'Kickoff y formación de equipos',
        horario: '08:00 – 09:00',
        conferencista: 'Comité organizador',
        estado: 'Finalizado',
      },
      {
        id: 602,
        nombre: 'Desarrollo y mentorías',
        horario: '09:00 – 20:00',
        conferencista: 'Mentores',
        estado: 'Finalizado',
      },
      {
        id: 603,
        nombre: 'Demo day',
        horario: '10:00 – 12:00 (día 2)',
        conferencista: 'Jurado',
        estado: 'Finalizado',
      },
    ],
    participantes: [
      { nombre: 'Andrés Campos', correo: 'andres.campos@example.com' },
      { nombre: 'Valeria Prieto', correo: 'valeria.prieto@example.com' },
    ],
  },
};

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './evento-detalle.component.html',
  styleUrls: ['./evento-detalle.component.scss'],
})
export class EventoDetalleComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly inscripcionService = inject(EventoInscripcionService);
  private sub?: Subscription;

  evento: EventoDetalle | null = null;

  ngOnInit(): void {
    this.applyRouteId(this.route.snapshot.paramMap.get('id'));
    this.sub = this.route.paramMap.subscribe((params) => this.applyRouteId(params.get('id')));
  }

  private applyRouteId(raw: string | null): void {
    const id = raw !== null ? Number(raw) : NaN;
    const found = Number.isFinite(id) ? MOCK_DETALLE[id] : undefined;
    this.evento =
      found ??
      ({
        id: Number.isFinite(id) ? id : 0,
        nombre: 'Evento no encontrado',
        fecha: '—',
        lugar: '—',
        tipo: '—',
        inscritos: 0,
        cupoMax: 0,
        estado: 'Cancelado',
        actividades: [],
        participantes: [],
      } satisfies EventoDetalle);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get isParticipante(): boolean {
    return this.authSession.getRole() === 'participante';
  }

  get estadoInscripcionUsuario(): string {
    if (!this.evento || this.evento.estado === 'Cancelado') {
      return 'Inscripción no disponible';
    }
    const username = this.authSession.getCurrentUser()?.username;
    if (!username) {
      return 'No autenticado';
    }
    return this.inscripcionService.isInscrito(username, this.evento.id)
      ? 'Ya estás inscrito en este evento'
      : 'Todavía no estás inscrito en este evento';
  }

  editarEvento(): void {
    window.alert('Editar evento (demo sin backend).');
  }

  eliminarEvento(): void {
    window.alert('Eliminar evento (demo sin backend).');
  }

  agregarActividad(): void {
    window.alert('Agregar actividad (demo sin backend).');
  }

  editarActividad(a: ActividadItem): void {
    window.alert(`Editar actividad: ${a.nombre}`);
  }

  eliminarActividad(a: ActividadItem): void {
    window.alert(`Eliminar actividad: ${a.nombre}`);
  }
}
