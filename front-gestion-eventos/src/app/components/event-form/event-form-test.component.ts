import { Component, signal } from '@angular/core';
import { EventFormComponent, EventFormData } from './event-form.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-form-test',
  template: `
    <div style="padding: 2rem; text-align: center;">
      <h1>Prueba del Componente Event Form</h1>

      <div style="margin: 2rem 0;">
        <label>
          <input type="checkbox" [checked]="showEditMode()" (change)="showEditMode.update(v => !v)" />
          Modo Edición (ID: 1)
        </label>
      </div>

      @if (showEditMode()) {
        <app-event-form
          [eventId]="1"
          (eventSaved)="onEventSaved($event)"
          (cancelled)="onCancelled()"
        />
      } @else {
        <app-event-form
          (eventSaved)="onEventSaved($event)"
          (cancelled)="onCancelled()"
        />
      }

      @if (lastEvent()) {
        <div style="margin-top: 2rem; text-align: left; background: #f0f0f0; padding: 1rem; border-radius: 8px;">
          <h3>Último evento guardado:</h3>
          <pre>{{ lastEvent() | json }}</pre>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [EventFormComponent, CommonModule, FormsModule],
})
export class EventFormTestComponent {
  showEditMode = signal(false);
  lastEvent = signal<EventFormData | null>(null);

  onEventSaved(event: EventFormData): void {
    this.lastEvent.set(event);
    console.log('Evento guardado:', event);
  }

  onCancelled(): void {
    console.log('Operación cancelada');
  }
}
