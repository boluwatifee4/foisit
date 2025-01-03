import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  imports: [
    NxWelcomeComponent,
    RouterModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'foisit-ng';

  constructor(private assistantService: AssistantService) {
    this.assistantService.addCommand('say hello', () => console.log('Hello!'));
  }
}
