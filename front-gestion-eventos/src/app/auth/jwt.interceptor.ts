import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthSessionService } from './auth-session.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token JWT si existe
    const token = localStorage.getItem('jwt_access_token');
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si recibimos 401 Unauthorized, limpiar sesión y redirigir a login
        if (error.status === 401) {
          this.authSession.clearSession();
          localStorage.removeItem('jwt_access_token');
          localStorage.removeItem('jwt_refresh_token');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
