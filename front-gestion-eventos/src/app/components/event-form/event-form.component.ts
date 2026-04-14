import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  inscriptionPolicy: string;
}

export interface Event extends EventFormData {
  id: number;
}

const MOCK_EVENTS: Record<number, Event> = {
  1: {
    id: 1,
    title: 'Conferencia de Angular',
    description:
      'Aprende las mejores prácticas en Angular 21 con expertos de la industria',
    eventType: 'conferencia',
    startDate: '2025-05-15T09:00',
    endDate: '2025-05-15T17:00',
    maxAttendees: 200,
    inscriptionPolicy:
      'Inscripción abierta para todos. Requiere confirmación de asistencia 24 horas antes.',
  },
  2: {
    id: 2,
    title: 'Taller de TypeScript',
    description: 'Taller práctico de TypeScript avanzado',
    eventType: 'taller',
    startDate: '2025-05-20T14:00',
    endDate: '2025-05-20T18:00',
    maxAttendees: 50,
    inscriptionPolicy: 'Plazas limitadas. Se requiere experiencia previa en JS.',
  },
};

const EVENT_TYPES = [
  { value: 'conferencia', label: 'Conferencia' },
  { value: 'taller', label: 'Taller' },
  { value: 'seminario', label: 'Seminario' },
  { value: 'networking', label: 'Networking' },
  { value: 'otro', label: 'Otro' },
];

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class EventFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  // Input signal para recibir el ID del evento (modo edición)
  eventId = input<number | null>(null);

  // Output events
  eventSaved = output<EventFormData>();
  cancelled = output<void>();

  // Propiedades del componente
  form!: FormGroup;
  isEditMode = false;
  eventTypes = EVENT_TYPES;
  isSubmitting = false;

  ngOnInit(): void {
    this.initializeForm();
    
    // Intentar obtener ID de dos fuentes:
    // 1. Del input signal (si se pasa directamente)
    // 2. De los parámetros de ruta (si se navega desde eventos)
    let id = this.eventId();
    
    if (!id) {
      // Intentar obtener de los parámetros de ruta
      this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
        const routeId = params.get('id');
        if (routeId) {
          const parsedId = parseInt(routeId, 10);
          if (!isNaN(parsedId)) {
            this.loadEventData(parsedId);
          }
        }
      });
    } else {
      this.loadEventData(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      eventType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      maxAttendees: [
        '',
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      inscriptionPolicy: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  private loadEventData(id: number): void {
    const event = MOCK_EVENTS[id];
    if (event) {
      this.isEditMode = true;
      this.form.patchValue({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        maxAttendees: event.maxAttendees,
        inscriptionPolicy: event.inscriptionPolicy,
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Simular envío al backend
      setTimeout(() => {
        const formData = this.form.value as EventFormData;
        this.eventSaved.emit(formData);
        this.isSubmitting = false;

        // Mostrar retroalimentación visual
        console.log(
          this.isEditMode ? 'Evento actualizado:' : 'Evento creado:',
          formData
        );
      }, 800);
    }
  }

  onCancel(): void {
    if (this.form.dirty) {
      const confirm = window.confirm(
        '¿Descartar cambios? Los datos no guardados se perderán.'
      );
      if (!confirm) {
        return;
      }
    }
    this.cancelled.emit();
    void this.router.navigate(['/eventos']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Evento' : 'Crear Evento';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Guardar cambios' : 'Crear evento';
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (field.errors['minLength']) {
      const minLength = field.errors['minLength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (field.errors['min']) {
      const min = field.errors['min'].min;
      return `El valor mínimo es ${min}`;
    }
    if (field.errors['pattern']) {
      return 'Ingrese un número válido';
    }

    return null;
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.getFieldError(fieldName);
  }
}
