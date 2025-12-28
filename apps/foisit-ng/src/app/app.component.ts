import {
  Component,
  Renderer2,
  Inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor(
    private assistantService: AssistantService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.initTheme();
    this.setupCommands();
    this.assistantService.startListening();
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('foisit-theme') as 'light' | 'dark';
    if (savedTheme) {
      this.theme.set(savedTheme);
    }
    this.renderer.setAttribute(
      this.document.documentElement,
      'data-theme',
      this.theme()
    );
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    this.renderer.setAttribute(
      this.document.documentElement,
      'data-theme',
      this.theme()
    );
    localStorage.setItem('foisit-theme', this.theme());
    this.cdr.markForCheck(); // Ensure Angular detects the change
  }

  openAssistant(): void {
    this.assistantService.toggle();
  }

  toggleAssistant(): void {
    this.assistantService.toggle(
      (text) => console.log('User typed:', text),
      () => console.log('Assistant closed')
    );
  }

  demoCritical(): void {
    this.assistantService.toggle();
  }

  private setupCommands(): void {
    // ===== THEME TOGGLE COMMAND =====
    this.assistantService.addCommand('toggle theme', async () => {
      this.toggleTheme();
      return `🎨 Theme switched to ${this.theme()} mode!`;
    });

    // ===== BASIC COMMAND (No parameters) =====
    this.assistantService.addCommand({
      command: 'help',
      description: 'Show available commands and what I can do',
      action: async () => {
        return `I can help you with:
✅ User Management (create user, update profile)
📅 Scheduling (book appointment, schedule meeting)
🗑️ Data Operations (delete records - requires confirmation)
📊 Analytics (view stats)
🎨 UI Actions (change theme)

Just tell me what you'd like to do!`;
      },
    });

    // ===== STRING + NUMBER PARAMETERS =====
    this.assistantService.addCommand({
      command: 'create user',
      description: 'Create a new user account with name, email, and age',
      parameters: [
        {
          name: 'name',
          description: 'Full name of the user',
          required: true,
          type: 'string',
        },
        {
          name: 'email',
          description: 'Email address',
          required: true,
          type: 'string',
        },
        {
          name: 'age',
          description: 'User age (must be 18+)',
          required: true,
          type: 'number',
        },
      ],
      action: async (params: any) => {
        // Simulate validation
        if (params.age < 18) {
          return {
            type: 'error',
            message: '❌ User must be at least 18 years old.',
          };
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        return {
          type: 'success',
          message: `✅ User created successfully!\n\n👤 Name: ${params.name}\n📧 Email: ${params.email}\n🎂 Age: ${params.age}`,
        };
      },
    });

    // ===== SELECT PARAMETER (Static options) =====
    this.assistantService.addCommand({
      command: 'change theme',
      description: 'Change the application color theme',
      parameters: [
        {
          name: 'theme',
          description: 'Choose a color theme',
          required: true,
          type: 'select',
          options: [
            { label: '🔵 Blue Ocean', value: 'blue' },
            { label: '🟢 Forest Green', value: 'green' },
            { label: '🟣 Purple Haze', value: 'purple' },
            { label: '🔴 Ruby Red', value: 'red' },
          ],
        },
      ],
      action: async (params: any) => {
        const themeColors: Record<string, string> = {
          blue: 'rgba(59, 130, 246, 0.1)',
          green: 'rgba(34, 197, 94, 0.1)',
          purple: 'rgba(168, 85, 247, 0.1)',
          red: 'rgba(239, 68, 68, 0.1)',
        };
        this.document.body.style.backgroundColor =
          themeColors[params.theme] || '';
        return `🎨 Theme changed to ${params.theme}!`;
      },
    });

    // ===== DATE PARAMETER =====
    this.assistantService.addCommand({
      command: 'book appointment',
      description: 'Book an appointment for a specific date',
      parameters: [
        {
          name: 'service',
          description: 'Type of service needed',
          required: true,
          type: 'string',
        },
        {
          name: 'date',
          description: 'Preferred appointment date',
          required: true,
          type: 'date',
        },
      ],
      action: async (params: any) => {
        return `📅 Appointment booked!\n\n🔧 Service: ${
          params.service
        }\n📆 Date: ${new Date(params.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`;
      },
    });

    // ===== ASYNC SELECT (Dynamic options from API) =====
    this.assistantService.addCommand({
      command: 'schedule meeting',
      description: 'Schedule a meeting with a team member',
      parameters: [
        {
          name: 'member',
          description: 'Select a team member',
          required: true,
          type: 'select',
          getOptions: async () => {
            // Simulate API call to get team members
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return [
              { label: '👨‍💼 John Doe (Engineering)', value: 'john_123' },
              { label: '👩‍💼 Jane Smith (Design)', value: 'jane_456' },
              { label: '👨‍💼 Mike Johnson (Product)', value: 'mike_789' },
              { label: '👩‍💼 Sarah Williams (Marketing)', value: 'sarah_012' },
            ];
          },
        },
        {
          name: 'date',
          description: 'Meeting date',
          required: true,
          type: 'date',
        },
        {
          name: 'duration',
          description: 'Duration in minutes',
          required: true,
          type: 'number',
        },
      ],
      action: async (params: any) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          type: 'success',
          message: `✅ Meeting scheduled!\n\n👥 With: ${
            params.member
          }\n📆 Date: ${new Date(
            params.date
          ).toLocaleDateString()}\n⏱️ Duration: ${params.duration} minutes`,
        };
      },
    });

    // ===== CRITICAL ACTION (Requires confirmation) =====
    this.assistantService.addCommand({
      command: 'delete all records',
      description: 'Permanently delete all user records from the database',
      critical: true,
      action: async () => {
        // Simulate deletion process
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          type: 'success',
          message:
            '🗑️ All records have been permanently deleted.\n\n⚠️ This action cannot be undone.',
        };
      },
    });

    // ===== OPTIONAL PARAMETERS =====
    this.assistantService.addCommand({
      command: 'update profile',
      description: 'Update user profile information (all fields optional)',
      parameters: [
        {
          name: 'displayName',
          description: 'Display name',
          required: false,
          type: 'string',
        },
        {
          name: 'bio',
          description: 'Short biography',
          required: false,
          type: 'string',
        },
        {
          name: 'role',
          description: 'User role',
          required: false,
          type: 'select',
          options: [
            { label: 'Developer', value: 'dev' },
            { label: 'Designer', value: 'design' },
            { label: 'Manager', value: 'manager' },
          ],
        },
      ],
      action: async (params: any) => {
        const updates: string[] = [];
        if (params.displayName) updates.push(`Name: ${params.displayName}`);
        if (params.bio) updates.push(`Bio: ${params.bio}`);
        if (params.role) updates.push(`Role: ${params.role}`);

        return updates.length > 0
          ? `✅ Profile updated:\n\n${updates.join('\n')}`
          : '⚠️ No fields were updated.';
      },
    });

    // ===== SIMPLE UI ACTIONS =====
    this.assistantService.addCommand({
      command: 'reset theme',
      action: async () => {
        this.document.body.style.backgroundColor = '';
        return '✨ Theme reset to default.';
      },
    });

    this.assistantService.addCommand({
      command: 'view stats',
      description: 'View application statistics',
      action: async () => {
        return `📊 Application Statistics:\n\n👥 Active Users: 1,234\n📝 Total Commands: 42\n⚡ Uptime: 99.9%\n🚀 Version: 1.0.0`;
      },
    });
  }
}
