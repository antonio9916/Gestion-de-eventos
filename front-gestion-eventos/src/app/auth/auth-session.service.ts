import { Injectable } from '@angular/core';

/** Rol canónico en minúsculas para comprobaciones en el resto de la app. */
export type UserRole = 'admin' | 'participante' | 'organizador' | 'conferencista';

export interface AuthenticatedUser {
  username: string;
  role: UserRole;
  /** Opcional: útil para saludos o cabeceras sin volver a pedir datos. */
  name?: string;
}

const STORAGE_KEY = 'gestion_eventos_current_user';

const CANONICAL_ROLES: readonly UserRole[] = ['admin', 'participante', 'organizador', 'conferencista'];

/** Mapea textos del formulario / demo a roles canónicos; acepta también valores ya canónicos. */
export function normalizeRole(displayOrCanonical: string): UserRole {
  const trimmed = displayOrCanonical.trim();
  if ((CANONICAL_ROLES as readonly string[]).includes(trimmed)) {
    return trimmed as UserRole;
  }
  const map: Record<string, UserRole> = {
    Administrador: 'admin',
    Participante: 'participante',
    Organizador: 'organizador',
    Conferencista: 'conferencista',
  };
  return map[trimmed] ?? 'participante';
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  saveAuthenticatedUser(account: { username: string; role: string; name?: string }): void {
    const payload: AuthenticatedUser = {
      username: account.username,
      role: normalizeRole(account.role),
      ...(account.name ? { name: account.name } : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  getCurrentUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      const obj = parsed as Record<string, unknown>;
      if (typeof obj['username'] !== 'string' || typeof obj['role'] !== 'string') {
        return null;
      }
      return {
        username: obj['username'],
        role: normalizeRole(obj['role']),
        ...(typeof obj['name'] === 'string' ? { name: obj['name'] } : {}),
      };
    } catch {
      return null;
    }
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Comprueba si el usuario actual tiene alguno de los roles indicados (base para vistas/acciones). */
  userHasAnyRole(allowed: readonly UserRole[]): boolean {
    const current = this.getRole();
    if (!current) {
      return false;
    }
    return allowed.includes(current);
  }
}
