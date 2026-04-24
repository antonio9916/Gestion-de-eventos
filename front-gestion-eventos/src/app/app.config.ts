import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <-- nuevo

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: 	[provideBrowserGlobalErrorListeners(), 
				provideRouter(routes),
				provideHttpClient()]  // <-- nuevo
};
