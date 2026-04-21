import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../auth/auth-session.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  get displayName(): string {
    const user = this.authSession.getCurrentUser();
    return user?.name ?? user?.username ?? 'Usuario';
  }

  logout(): void {
    this.authSession.clearSession();
    void this.router.navigate(['/login']);
  }
}
