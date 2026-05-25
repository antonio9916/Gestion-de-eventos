import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EventoEstado = 'Activo' | 'Finalizado' | 'Cancelado';

// Mapeo idéntico a lo que responde Django
export interface EventoBackend {
  id: number;
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  inscriptionPolicy: string;
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/App/eventos/'; // Ajusta si tu ruta base cambia

  getEventos(): Observable<EventoBackend[]> {
    return this.http.get<EventoBackend[]>(this.apiUrl);
  }

  getEvento(id: number): Observable<EventoBackend> {
    return this.http.get<EventoBackend>(`${this.apiUrl}${id}/`);
  }

  crearEvento(evento: Partial<EventoBackend>): Observable<any> {
    return this.http.post(this.apiUrl, evento);
  }

  actualizarEvento(id: number, evento: Partial<EventoBackend>): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, evento);
  }

  eliminarEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}