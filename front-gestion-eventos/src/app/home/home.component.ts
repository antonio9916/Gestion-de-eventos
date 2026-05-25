import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../components/hero/hero.component';
import { FeaturesComponent } from '../components/features/features.component';
import { FooterComponent } from '../components/footer/footer.component';
import { EventListComponent, EventItem } from '../components/event-list/event-list.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, EventListComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  events: EventItem[] = [
    { id: 1, name: 'Feria Tecnológica 2026', date: '10 Abr 2026', location: 'Centro de Convenciones', spots: 120 },
    { id: 2, name: 'Conferencia Salud Digital', date: '22 May 2026', location: 'Auditorio Central', spots: 80 },
    { id: 3, name: 'Taller de Fotografía', date: '5 Jun 2026', location: 'Espacio Cultural', spots: 25 },
    { id: 4, name: 'Hackathon Universitario', date: '18 Jul 2026', location: 'Campus Norte', spots: 200 },
  ];
}
