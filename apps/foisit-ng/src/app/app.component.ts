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
import { environment } from '../environments/environment';

@Component({
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  theme = signal<'light' | 'dark'>('light');

  // Dev assistant system prompt is stored server-side in `libs/dev-assistant/prompt.txt`.

  // Endpoint that proxies requests to your LLM for dev assistance.
  // Adjust this to match your actual backend route.
  private readonly DEV_ASSISTANT_ENDPOINT = environment.devAssistantProxyUrl;

  private async callDevAssistant(code: string, question: string): Promise<string> {
    try {
      const res = await fetch(this.DEV_ASSISTANT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, question }),
      });

      if (!res.ok) {
        throw new Error(`Dev assistant HTTP error: ${res.status}`);
      }

      const data = (await res.json()) as { answer?: string; message?: string };
      return data.answer || data.message || 'Dev assistant did not return a response.';
    } catch (err) {
      console.error('callDevAssistant failed:', err);
      throw err;
    }
  }

  constructor(
    private assistantService: AssistantService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef
  ) {
    this.initTheme();
    this.setupCommands();
    // Voice is currently disabled (text-only mode)
    // this.assistantService.startListening();
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
      return `Theme switched to ${this.theme()} mode.`;
    });

    // ===== BASIC COMMAND (No parameters) =====
    this.assistantService.addCommand({
      command: 'help',
      description: 'Show available commands and what I can do',
      action: async () => {
        return `I can help you with:
User Management (create user, update profile)
Scheduling (book appointment, schedule meeting)
Data Operations (delete records - requires confirmation)
Analytics (view stats)
UI Actions (change theme)

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
            message: 'User must be at least 18 years old.',
          };
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        return {
          type: 'success',
          message: `User created successfully.\n\nName: ${params.name}\nEmail: ${params.email}\nAge: ${params.age}`,
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
            { label: 'Blue Ocean', value: 'blue' },
            { label: 'Forest Green', value: 'green' },
            { label: 'Purple Haze', value: 'purple' },
            { label: 'Ruby Red', value: 'red' },
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
        return `Theme changed to ${params.theme}.`;
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
        return `Appointment booked.\n\nService: ${params.service
          }\nDate: ${new Date(params.date).toLocaleDateString('en-US', {
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
              { label: 'John Doe (Engineering)', value: 'john_123' },
              { label: 'Jane Smith (Design)', value: 'jane_456' },
              { label: 'Mike Johnson (Product)', value: 'mike_789' },
              { label: 'Sarah Williams (Marketing)', value: 'sarah_012' },
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
          message: `Meeting scheduled.\n\nWith: ${params.member
            }\nDate: ${new Date(
              params.date
            ).toLocaleDateString()}\nDuration: ${params.duration} minutes`,
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
            'All records have been permanently deleted.\n\nThis action cannot be undone.',
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
        if (!params || Object.keys(params).length === 0) {
          return {
            type: 'form',
            message: 'Please provide the details to update your profile.',
            fields: [
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
          };
        }

        const updates: string[] = [];
        if (params.displayName) updates.push(`Name: ${params.displayName}`);
        if (params.bio) updates.push(`Bio: ${params.bio}`);
        if (params.role) updates.push(`Role: ${params.role}`);

        return updates.length > 0
          ? `Profile updated:\n\n${updates.join('\n')}`
          : 'No fields were updated.';
      },
    });

    // ===== SIMPLE UI ACTIONS =====
    this.assistantService.addCommand({
      command: 'reset theme',
      action: async () => {
        this.document.body.style.backgroundColor = '';
        return 'Theme reset to default.';
      },
    });

    this.assistantService.addCommand({
      command: 'view stats',
      description: 'View application statistics',
      action: async () => {
        return `Application Statistics:\n\nActive Users: 1,234\nTotal Commands: 42\nUptime: 99.9%\nVersion: 1.0.0`;
      },
    });

    // ===== FILE UPLOAD DEMO =====
    this.assistantService.addCommand({
      command: 'upload file',
      description: 'Pick a file and return it to the action (demo)',
      parameters: [
        {
          name: 'attachment',
          description: 'Select a file',
          required: true,
          type: 'file',
          accept: ['image/*', 'audio/*', 'video/*'],
          multiple: false,
          delivery: 'file',
        },
      ],
      action: async (params: any) => {
        const v = params.attachment as File | undefined;
        if (!v) {
          return { type: 'error', message: 'No file provided.' };
        }
        return {
          type: 'success',
          message: `File received.\n\nName: ${v.name}\nType: ${v.type || 'unknown'}\nSize: ${v.size} bytes`,
        };
      },
    });

    // ===== DEV ASSISTANT (for other developers) =====
    this.assistantService.addCommand({
      command: 'dev assistant',
      description:
        'Analyze Foisit command/wrapper code and suggest fixes or alternatives for developers.',
      parameters: [
        {
          name: 'code',
          description: 'Optional code snippet to analyze (command, config, or usage).',
          required: false,
          type: 'string',
        },
        {
          name: 'question',
          description: 'What you expect or what is wrong (e.g., "no options showing").',
          required: true,
          type: 'string',
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        try {
          const code = String(params?.['code'] ?? '');
          const question = String(params?.['question'] ?? '');

          if (!question.trim()) {
            return {
              type: 'error',
              message:
                'Please describe what you are trying to do or what is going wrong (question is required).',
            };
          }

          const explanation = await this.callDevAssistant(code, question);

          const prefix = code.trim()
            ? ''
            : 'Note: You did not include a code snippet, so this answer is based only on your description. For more precise help next time, paste the relevant command or wrapper code.\n\n';

          return {
            type: 'success',
            message: `${prefix}${explanation}`,
          };
        } catch {
          return {
            type: 'error',
            message:
              'Dev assistant is currently unavailable. Please try again later or check the dev assistant endpoint.',
          };
        }
      },
    });
  }
}
