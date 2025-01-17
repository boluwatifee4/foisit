
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { AssistantModule } from '@foisit/angular-wrapper'; // Update with the correct path

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    importProvidersFrom(AssistantModule.forRoot({
      activationCommand: 'bad bitch',
      fallbackResponse: 'Sorry, I didn’t understand that.',
      commands: [
        { command: 'show profile', action: () => console.log('Showing profile...') },
        { command: 'log out', action: () => console.log('Logging out...') },
      ],
    })),
  ],
};
