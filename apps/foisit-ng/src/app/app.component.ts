import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { NxWelcomeComponent } from './nx-welcome.component';
import { AssistantService } from '@foisit/angular-wrapper';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    // NxWelcomeComponent,
    RouterModule,
    CommonModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Fixed typo from 'styleUrl' to 'styleUrls'
})
export class AppComponent {
  title = 'foisit-ng';
  color = signal('transparent');
  logs: string[] = []; // Log entries to display in the UI

  constructor(private assistantService: AssistantService) {
    this.setupCommands();
    this.assistantService.startListening();
  }

  /** Setup voice commands */
  private setupCommands(): void {
    this.assistantService.addCommand('red', () => {
      console.log('Changing background to red...');
      this.color.set('red');
      this.addLog('Background color changed to red.');
    });

    this.assistantService.addCommand('remove background', () => {
      console.log('Removing background color...');
      this.color.set('transparent');
      this.color.set('transparent');
      this.addLog('Background color removed.');
    });

    // Example of a critical command added dynamically
    this.assistantService.addCommand({
      command: 'nuke database',
      description: 'delete all records',
      critical: true,
      action: () => {
        console.log('Nuking database...');
        this.addLog('Database nuked (simulated).');
        alert('BOOM! Database nuked.');
      },
    });
  }

  /** Add entry to the log */
  private addLog(message: string): void {
    this.logs.unshift(message);
  }

  /** Clear all logs */
  clearLogs(): void {
    console.log('Clearing logs...');
    this.logs = [];
  }
}
