import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface EventItem {
  id: number;
  name: string;
  date: string;
  location: string;
  spots: number;
}

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent {
  @Input() event!: EventItem;

  enroll() {
    alert(`Inscripción realizada para: ${this.event.name}`);
  }
}
