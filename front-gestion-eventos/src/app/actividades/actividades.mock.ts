export interface ActividadItem {
  id: number;
  titulo: string;
  eventoId: number;
  eventoNombre: string;
  categoria: string;
  inicio: string;
  fin: string;
  lugar: string;
  idUsuarioConferencista: number | null;
  conferencistas: string[];
  descripcion: string;
}

export const ACTIVIDADES_MOCK: ActividadItem[] = [
  {
    id: 101,
    titulo: 'Panel: IA aplicada al producto',
    eventoId: 1,
    eventoNombre: 'Cumbre de Innovación 2026',
    categoria: 'Panel',
    inicio: '2026-04-15T10:00:00',
    fin: '2026-04-15T11:30:00',
    lugar: 'Auditorio A',
    idUsuarioConferencista: 4,
    conferencistas: ['Dr. Luis Paredes', 'Ana Ruiz'],
    descripcion: 'Conversación sobre adopción de IA en productos digitales y métricas de impacto.',
  },
  {
    id: 102,
    titulo: 'Workshop de prototipado rápido',
    eventoId: 1,
    eventoNombre: 'Cumbre de Innovación 2026',
    categoria: 'Taller',
    inicio: '2026-04-15T12:00:00',
    fin: '2026-04-15T14:00:00',
    lugar: 'Sala Creativa 2',
    idUsuarioConferencista: 4,
    conferencistas: ['Ana Ruiz'],
    descripcion: 'Sesión práctica para construir prototipos y validarlos con usuarios en menos de una hora.',
  },
  {
    id: 201,
    titulo: 'Mapa de empatía en equipos',
    eventoId: 2,
    eventoNombre: 'Taller UX para equipos',
    categoria: 'Laboratorio',
    inicio: '2026-04-22T14:00:00',
    fin: '2026-04-22T15:30:00',
    lugar: 'Aula Magna - Piso 1',
    idUsuarioConferencista: 3,
    conferencistas: ['Paula Soto'],
    descripcion: 'Construcción guiada de mapas de empatía para mejorar decisiones de diseño.',
  },
  {
    id: 501,
    titulo: 'Buenas prácticas de IAM',
    eventoId: 5,
    eventoNombre: 'Webinar seguridad en la nube',
    categoria: 'Charla',
    inicio: '2026-04-28T11:00:00',
    fin: '2026-04-28T11:45:00',
    lugar: 'Online',
    idUsuarioConferencista: 4,
    conferencistas: ['Ing. Roberto Paz'],
    descripcion: 'Revisión de patrones de seguridad para identidad y acceso en cloud.',
  },
  {
    id: 502,
    titulo: 'Q&A en vivo',
    eventoId: 5,
    eventoNombre: 'Webinar seguridad en la nube',
    categoria: 'Q&A',
    inicio: '2026-04-28T11:45:00',
    fin: '2026-04-28T12:15:00',
    lugar: 'Online',
    idUsuarioConferencista: null,
    conferencistas: [],
    descripcion: 'Espacio abierto de preguntas y respuestas con el equipo de seguridad.',
  },
];
