import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { AssistantService } from '@foisit/angular-wrapper';
import { CommonModule } from '@angular/common';

@Component({
  imports: [
    NxWelcomeComponent,
    RouterModule,
    CommonModule
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
      this.addLog('Background color removed.');
    });

    this.assistantService.addCommand('sleep', () => {
      console.log('Assistant is sleeping...');
      this.assistantService.stopListening();
      this.addLog('Assistant is now idle.');
    });
  }

  /** Add entry to the log */
  private addLog(message: string): void {
    this.logs.unshift(message);
  }

  /** Manually reactivate assistant */
  reactivateAssistant(): void {
    console.log('Reactivating Assistant...');
    this.assistantService.startListening();
    this.addLog('Assistant reactivated.');
  }

  /** Clear all logs */
  clearLogs(): void {
    console.log('Clearing logs...');
    this.logs = [];
  }
}
