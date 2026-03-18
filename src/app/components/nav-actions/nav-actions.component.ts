import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="actions">
      <button class="btn ghost">Iniciar sesión</button>
      <button class="btn primary">Registrarse</button>
    </div>
  `,
  styles: [
    `:host{display:block}.actions{display:flex;gap:.5rem}`
  ]
})
export class NavActionsComponent {}
