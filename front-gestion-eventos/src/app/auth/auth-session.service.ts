import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Rol canónico en minúsculas para comprobaciones en el resto de la app.
 */
export type UserRole =
  | 'admin'
  | 'participante'
  | 'organizador'
  | 'conferencista';

export interface AuthenticatedUser {
  id?: number;
  username: string;
  role: UserRole;
  email?: string;
  /**
   * Opcional: útil para saludos o cabeceras sin volver a pedir datos.
   */
  name?: string;
}

interface JWTTokenResponse {
  access: string;
  refresh: string;
}

const STORAGE_KEY = 'gestion_eventos_current_user';
const JWT_ACCESS_TOKEN_KEY = 'jwt_access_token';
const JWT_REFRESH_TOKEN_KEY = 'jwt_refresh_token';

const CANONICAL_ROLES: readonly UserRole[] = [
  'admin',
  'participante',
  'organizador',
  'conferencista',
];

/**
 * Mapea textos del formulario / demo a roles canónicos;
 * acepta también valores ya canónicos.
 */
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

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api';

  saveAuthenticatedUser(account: {
    id?: number;
    username: string;
    role: string;
    email?: string;
    name?: string;
  }): void {

    const payload: AuthenticatedUser = {
      ...(typeof account.id === 'number' ? { id: account.id } : {}),
      username: account.username,
      role: normalizeRole(account.role),
      ...(account.email ? { email: account.email } : {}),
      ...(account.name ? { name: account.name } : {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  /**
   * Guarda los tokens JWT en localStorage
   */
  saveJWTTokens(access: string, refresh: string): void {
    localStorage.setItem(JWT_ACCESS_TOKEN_KEY, access);
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refresh);
  }

  /**
   * Obtiene el token de acceso JWT
   */
  getAccessToken(): string | null {
    return localStorage.getItem(JWT_ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el token de refresh JWT
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(JWT_REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene nuevo token de acceso usando el refresh token
   */
  refreshAccessToken(): Observable<JWTTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<JWTTokenResponse>(`${this.apiUrl}/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        this.saveJWTTokens(response.access, response.refresh);
      })
    );
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

      if (
        typeof obj['username'] !== 'string' ||
        typeof obj['role'] !== 'string'
      ) {
        return null;
      }

      return {
        ...(typeof obj['id'] === 'number' ? { id: obj['id'] } : {}),
        username: obj['username'],
        role: normalizeRole(obj['role']),
        ...(typeof obj['email'] === 'string' ? { email: obj['email'] } : {}),
        ...(typeof obj['name'] === 'string' ? { name: obj['name'] } : {}),
      };
    } catch {
      return null;
    }
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }

  getUserEmail(): string | null {
    const current = this.getCurrentUser();

    if (!current) {
      return null;
    }

    return current.email ?? current.username;
  }

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(JWT_ACCESS_TOKEN_KEY);
    localStorage.removeItem(JWT_REFRESH_TOKEN_KEY);
  }

  /**
   * Comprueba si el usuario actual tiene alguno de los roles indicados.
   */
  userHasAnyRole(allowed: readonly UserRole[]): boolean {
    const current = this.getRole();

    if (!current) {
      return false;
    }

    return allowed.includes(current);
  }

  /**
   * Comprueba si hay una sesión activa (usuario y token)
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getAccessToken() !== null;
  }
}
