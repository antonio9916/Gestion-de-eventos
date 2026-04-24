import { Injectable } from '@angular/core';

const STORAGE_KEY = 'gestion_eventos_inscripciones';

type InscripcionesPorUsuario = Record<string, number[]>;

@Injectable({ providedIn: 'root' })
export class EventoInscripcionService {
  isInscrito(username: string, eventoId: number): boolean {
    return this.getUserInscripciones(username).includes(eventoId);
  }

  inscribirse(username: string, eventoId: number): void {
    const current = this.readStorage();
    const userSet = new Set(this.getUserInscripciones(username));
    userSet.add(eventoId);
    current[username] = [...userSet];
    this.writeStorage(current);
  }

  desinscribirse(username: string, eventoId: number): void {
    const current = this.readStorage();
    current[username] = this.getUserInscripciones(username).filter((id) => id !== eventoId);
    this.writeStorage(current);
  }

  private getUserInscripciones(username: string): number[] {
    return this.readStorage()[username] ?? [];
  }

  private readStorage(): InscripcionesPorUsuario {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }
      return parsed as InscripcionesPorUsuario;
    } catch {
      return {};
    }
  }

  private writeStorage(payload: InscripcionesPorUsuario): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
}
