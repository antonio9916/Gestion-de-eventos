import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('front-gestion-eventos');
}