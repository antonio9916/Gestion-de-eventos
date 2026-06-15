import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoInscripcionService {

  private http = inject(HttpClient);

  private api =
    'http://localhost:8000/api';

  inscribirse(
    usuarioId: number,
    eventoId: number
  ): Observable<any> {

    return this.http.post(
      `${this.api}/inscripciones/`,
      {
        usuario_id: usuarioId,
        evento_id: eventoId
      }
    );
  }

  desinscribirse(
    usuarioId: number,
    eventoId: number
  ): Observable<any> {

    return this.http.post(
      `${this.api}/inscripciones/cancelar/`,
      {
        usuario_id: usuarioId,
        evento_id: eventoId
      }
    );
  }

  isInscrito(
    usuarioId: number,
    eventoId: number
  ): Observable<any> {

    return this.http.get(
      `${this.api}/inscripciones/verificar/${eventoId}/${usuarioId}/`
    );
  }

  participantes(
    eventoId: number
  ): Observable<any> {

    return this.http.get(
      `${this.api}/eventos/${eventoId}/participantes/`
    );
  }
}