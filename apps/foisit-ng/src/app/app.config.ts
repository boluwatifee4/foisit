import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { AssistantModule } from '@foisit/angular-wrapper'; // Update with the correct path

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    importProvidersFrom(
      AssistantModule.forRoot({
        activationCommand: 'bad',
        introMessage: 'Hello from Angular!',
        fallbackResponse: 'Sorry, I didn’t understand that.',
        enableSmartIntent: true,
        inputPlaceholder: 'Ask Foisit anything...',
        floatingButton: {
          visible: true,
          tooltip: 'Click to start chatting',
          // customHtml: undefined, // Uses default logo
          customHtml: '<span>Assistant</span>', // Example custom HTML
          position: { bottom: '30px', right: '30px' },
        },
        // openAIKey: '', // Removed from public config
        commands: [
          {
            command: 'show profile',
            action: () => alert('Showing profile...'),
          },
          { command: 'log out', action: () => console.log('Logging out...') },
          {
            command: 'delete account',
            description: 'delete your account permanently',
            critical: true,
            action: () => alert('Account deleted! (Demo)'),
          },
          // Example file upload handler: returns a data URL for demo purposes
          // (In production you'd upload to your backend or cloud storage and return a public URL)
        ],
      })
    ),
  ],
};
