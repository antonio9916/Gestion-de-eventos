import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavActionsComponent } from '../nav-actions/nav-actions.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NavActionsComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {}
