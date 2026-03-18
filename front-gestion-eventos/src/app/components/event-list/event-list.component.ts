import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent, EventItem } from '../event-card/event-card.component';
export type { EventItem } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  template: `
    <div class="grid">
      <app-event-card *ngFor="let e of events" [event]="e"></app-event-card>
    </div>
  `,
  styles: [
    `.grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:1rem } @media (max-width:1000px){ .grid{ grid-template-columns: repeat(2,1fr) } } @media (max-width:700px){ .grid{ grid-template-columns: 1fr } }`
  ]
})
export class EventListComponent { @Input() events: EventItem[] = [] }
