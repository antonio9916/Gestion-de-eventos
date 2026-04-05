import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
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
}
