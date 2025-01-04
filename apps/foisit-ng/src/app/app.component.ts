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
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'foisit-ng';
  color = signal('transparent');

  constructor(private assistantService: AssistantService) {
    this.assistantService.addCommand('background red', () => {
      console.log('Hello!');
      this.color.set('red');
      console.log('Color changed to red', this.color());
    });
    this.assistantService.startListening()
  }
}
