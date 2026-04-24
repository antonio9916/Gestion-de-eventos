import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';
import { AuthSessionService } from '../../auth/auth-session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);

  isEventManagementOpen = false;
  isPeopleManagementOpen = false;
  isOperationsOpen = false;
  isSystemOpen = false;

  toggleEventManagement() {
    this.isEventManagementOpen = !this.isEventManagementOpen;
  }

  togglePeopleManagement() {
    this.isPeopleManagementOpen = !this.isPeopleManagementOpen;
  }

  toggleOperations() {
    this.isOperationsOpen = !this.isOperationsOpen;
  }

  toggleSystem() {
    this.isSystemOpen = !this.isSystemOpen;
  }
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit(): void {
    const syncEventSection = (url: string): void => {
      if (
        url.includes('/eventos') ||
        url.includes('/actividades') ||
        url.includes('/conferencistas')
      ) {
        this.isEventManagementOpen = true;
      }
    };

    syncEventSection(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => syncEventSection(e.urlAfterRedirects));
  }

  get isParticipante(): boolean {
    return this.authSession.getRole() === 'participante';
  }

  get isConferencista(): boolean {
    return this.authSession.getRole() === 'conferencista';
  }

  get canAccessAdminModules(): boolean {
    const role = this.authSession.getRole();
    return role === 'admin' || role === 'organizador';
  }
}
