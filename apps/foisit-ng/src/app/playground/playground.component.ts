import {
  Component,
  Renderer2,
  Inject,
  signal,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssistantService } from '@foisit/angular-wrapper';
import { environment } from '../../environments/environment';

type CreateUserParams = { name: string; email: string; age: number };
type ChangeThemeParams = { theme: string };
type BookAppointmentParams = { service: string; date: string | number | Date };
type ScheduleMeetingParams = {
  member: string;
  date: string | number | Date;
  duration: number;
};
type UpdateProfileParams = { displayName?: string; bio?: string; role?: string };
type UploadFileParams = { attachment?: File };
type DevAssistantParams = { question: string; code?: string };

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  theme = signal<'light' | 'dark'>('light');

  private readonly DEV_ASSISTANT_ENDPOINT = environment.devAssistantProxyUrl;

  readonly quickstartAppConfigCode = `import { importProvidersFrom } from '@angular/core';
import { AssistantModule } from '@foisit/angular-wrapper';

export const appConfig = {
  providers: [
    importProvidersFrom(
      AssistantModule.forRoot({
        commands: [
          { command: 'greet', action: () => 'Hello, World!' }
        ]
      })
    )
  ]
};`;

  readonly exampleHelpCode = `this.assistantService.addCommand({
  command: 'help',
  description: 'Show available commands',
  action: async () => {
    return 'I can help you with: User Management, Scheduling...';
  }
});`;

  readonly exampleCreateUserCode = `this.assistantService.addCommand({
  command: 'create user',
  parameters: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: true }
  ],
  action: async (params) => {
    if (params.age < 18) {
      return { type: 'error', message: 'Must be 18+' };
    }
    return { type: 'success', message: 'User ' + params.name + ' created!' };
  }
});`;

  readonly exampleChangeThemeCode = `this.assistantService.addCommand({
  command: 'change theme',
  parameters: [{
    name: 'theme',
    type: 'select',
    options: [
      { label: 'Blue Ocean', value: 'blue' },
      { label: 'Forest Green', value: 'green' },
      { label: 'Purple Haze', value: 'purple' },
      { label: 'Ruby Red', value: 'red' }
    ]
  }],
  action: (params) => 'Theme changed to ' + params.theme + '!'
});`;

  readonly exampleBookAppointmentCode = `this.assistantService.addCommand({
  command: 'book appointment',
  parameters: [
    { name: 'service', type: 'string', required: true },
    { name: 'date', type: 'date', required: true }
  ],
  action: (params) => 'Booked ' + params.service + ' on ' + params.date
});`;

  readonly exampleScheduleMeetingCode = `this.assistantService.addCommand({
  command: 'schedule meeting',
  parameters: [{
    name: 'member',
    type: 'select',
    getOptions: async () => {
      const members = await api.getTeamMembers();
      return members.map(m => ({ label: m.name, value: m.id }));
    }
  }],
  action: (params) => 'Meeting scheduled with ' + params.member
});`;

  readonly exampleDeleteAllRecordsCode = `this.assistantService.addCommand({
  command: 'delete all records',
  critical: true, // Forces confirmation
  action: async () => {
    await database.deleteAll();
    return { type: 'success', message: 'All records deleted.' };
  }
});`;

  readonly exampleUploadFileCode = `this.assistantService.addCommand({
  command: 'upload file',
  parameters: [{
    name: 'attachment',
    type: 'file',
    accept: ['image/*', 'audio/*'],
    delivery: 'base64' // or 'file'
  }],
  action: (params) => 'Received ' + params.attachment.name
});`;

  readonly parameterTypesCode = `// STRING - Text input
{ name: 'username', type: 'string', required: true }

// NUMBER - Numeric input with optional min/max
{ name: 'age', type: 'number', min: 0, max: 120 }

// DATE - Native date picker
{ name: 'appointmentDate', type: 'date' }

// SELECT - Static dropdown
{ name: 'role', type: 'select', options: [{ label: 'Admin', value: 'admin' }] }

// SELECT - Async dropdown from API
{ name: 'customer', type: 'select', getOptions: () => fetch('/api/customers').then(r => r.json()) }

// FILE - File upload with restrictions
{ name: 'attachment', type: 'file', accept: ['image/*'], delivery: 'base64' }`;

  readonly angularServiceApiCode = `// Inject the service
constructor(private assistant: AssistantService) {}

// Open/close the assistant
this.assistant.toggle();

// Add commands dynamically
this.assistant.addCommand('search', async (params) => {
  const results = await api.search(params.query);
  return 'Found ' + results.length + ' results';
});

// Remove commands
this.assistant.removeCommand('search');`;

  readonly gestureActivationCode = `// Gesture activation is enabled by default
const config = {
  enableGestureActivation: true, // Triple-tap/click to open
  // ... other config
};

<AssistantProvider [config]="config">
  <app-root />
</AssistantProvider>`;

  readonly smartIntentCode = `// Register a command
assistant.addCommand({
  command: 'book appointment',
  // ... parameters and action
});

// User can say variations like:
// "schedule a meeting"
// "make an appointment"
// "book me a slot"
// The assistant intelligently matches to the closest command.`;

  readonly fallbackCode = `const config = {
  fallbackResponse: "I didn't catch that. Try 'help' for available commands.",
  // ... other config
};

<AssistantProvider [config]="config">
  <app-root />
</AssistantProvider>`;

  readonly programmaticHandlersCode = `const assistant = inject(AssistantService);

// Register a handler
assistant.registerCommandHandler('customAction', async (params) => {
  // Your custom logic here
  return 'Custom action executed!';
});

// Execute programmatically
assistant.runCommand({
  commandId: 'customAction',
  params: { someParam: 'value' },
  openOverlay: true,
  showInvocation: true
});

// Cleanup
assistant.unregisterCommandHandler('customAction');`;

  private async callDevAssistant(code: string, question: string): Promise<string> {
    if (!this.DEV_ASSISTANT_ENDPOINT) {
      throw new Error('Dev assistant proxy is not configured.');
    }
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
  ) {}

  ngOnInit(): void {
    this.initTheme();
    this.setupCommands();

    // Register escalate handler for programmatic demo (mirrors React Playground)
    const handler = async (params?: { incidentId?: number }) => {
      await new Promise((r) => setTimeout(r, 500));
      return `Escalation created for incident ${params?.incidentId ?? 'unknown'}.`;
    };
    this.assistantService.registerCommandHandler('escalate', handler);
  }

  ngOnDestroy(): void {
    const commands = [
      'help',
      'create user',
      'change theme',
      'book appointment',
      'schedule meeting',
      'delete all records',
      'update profile',
      'reset theme',
      'view stats',
      'upload file',
      'dev assistant',
      'escalate',
    ];
    commands.forEach((cmd) => this.assistantService.removeCommand(cmd));

    this.assistantService.unregisterCommandHandler('escalate');
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
    this.cdr.markForCheck();
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

  runEscalateDemo(): void {
    this.assistantService.runCommand({
      commandId: 'escalate',
      params: { incidentId: null },
      openOverlay: true,
      showInvocation: true,
    });
  }

  private setupCommands(): void {
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
        { name: 'name', description: 'Full name of the user', required: true, type: 'string' },
        { name: 'email', description: 'Email address', required: true, type: 'string' },
        { name: 'age', description: 'User age (must be 18+)', required: true, type: 'number' },
      ],
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as Partial<CreateUserParams> | undefined;
        if (typeof p?.age !== 'number') {
          return { type: 'error', message: 'Missing or invalid age.' };
        }
        if (p.age < 18) {
          return { type: 'error', message: 'User must be at least 18 years old.' };
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          type: 'success',
          message: `User created successfully!\n\nName: ${String(
            p?.name ?? ''
          )}\nEmail: ${String(p?.email ?? '')}\nAge: ${p.age}`,
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
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as Partial<ChangeThemeParams> | undefined;
        const theme = String(p?.theme ?? '');
        const themeColors: Record<string, string> = {
          blue: 'rgba(59, 130, 246, 0.1)',
          green: 'rgba(34, 197, 94, 0.1)',
          purple: 'rgba(168, 85, 247, 0.1)',
          red: 'rgba(239, 68, 68, 0.1)',
        };
        this.document.body.style.backgroundColor = themeColors[theme] || '';
        return { type: 'success', message: `Theme changed to ${theme}!` };
      },
    });

    // ===== DATE PARAMETER =====
    this.assistantService.addCommand({
      command: 'book appointment',
      description: 'Book an appointment for a specific date',
      parameters: [
        { name: 'service', description: 'Type of service needed', required: true, type: 'string' },
        { name: 'date', description: 'Preferred appointment date', required: true, type: 'date' },
      ],
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as Partial<BookAppointmentParams> | undefined;
        return {
          type: 'success',
          message: `Appointment booked!\n\nService: ${
            String(p?.service ?? '')
          }\nDate: ${new Date(p?.date ?? '').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        };
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return [
              { label: 'Alice Johnson (Engineering)', value: 'alice' },
              { label: 'Bob Smith (Design)', value: 'bob' },
              { label: 'Charlie Brown (Product)', value: 'charlie' },
              { label: 'Diana Prince (Marketing)', value: 'diana' },
            ];
          },
        },
        { name: 'date', description: 'Meeting date', required: true, type: 'date' },
        { name: 'duration', description: 'Duration in minutes', required: true, type: 'number' },
      ],
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as Partial<ScheduleMeetingParams> | undefined;
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          type: 'success',
          message: `Meeting scheduled with ${String(p?.member ?? '')} on ${new Date(
            p?.date ?? ''
          ).toLocaleDateString()}\nDuration: ${Number(p?.duration ?? 0)} minutes`,
        };
      },
    });

    // ===== CRITICAL ACTION (Requires confirmation) =====
    this.assistantService.addCommand({
      command: 'delete all records',
      description: 'Permanently delete all user records from the database',
      critical: true,
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          type: 'success',
          message: 'All records have been permanently deleted.\n\nThis action cannot be undone.',
        };
      },
    });

    // ===== OPTIONAL PARAMETERS =====
    this.assistantService.addCommand({
      command: 'update profile',
      description: 'Update your user profile',
      parameters: [
        { name: 'displayName', description: 'Display name', required: false, type: 'string' },
        { name: 'bio', description: 'Short biography', required: false, type: 'string' },
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
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as UpdateProfileParams | undefined;
        const updates = Object.entries(p || {})
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        return updates ? `Profile updated: ${updates}` : 'No changes made to profile.';
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
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as UploadFileParams | undefined;
        const v = p?.attachment;
        if (!v) {
          return { type: 'error', message: 'No file provided.' };
        }
        return {
          type: 'success',
          message: `File received.\n\nName: ${v.name}\nType: ${v.type || 'unknown'}\nSize: ${v.size} bytes`,
        };
      },
    });

    // ===== DEV ASSISTANT =====
    this.assistantService.addCommand({
      command: 'dev assistant',
      description: 'Get help with Foisit development questions and code issues',
      parameters: [
        { name: 'question', description: 'Your question about Foisit', required: true, type: 'string' },
        { name: 'code', description: 'Optional code snippet to analyze', required: false, type: 'string' },
      ],
      action: async (params?: Record<string, unknown>) => {
        const p = params as unknown as Partial<DevAssistantParams> | undefined;
        try {
          const response = await this.callDevAssistant(
            String(p?.code ?? ''),
            String(p?.question ?? '')
          );
          return response;
        } catch (error) {
          return {
            type: 'error',
            message: `Dev assistant error: ${error}`,
          };
        }
      },
    });

    // ===== ESCALATE COMMAND =====
    this.assistantService.addCommand({
      command: 'escalate',
      description: 'Escalate an incident (demo).',
      parameters: [{ name: 'incidentId', description: 'Incident ID to escalate', required: true, type: 'number' }],
      action: async (params?: { incidentId?: number }) => {
        if (!params || params.incidentId == null) {
          return {
            type: 'form',
            message: 'Provide the Incident ID to escalate.',
            fields: [{ name: 'incidentId', description: 'Incident ID', required: true, type: 'number' }],
          };
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
        return `Escalation recorded for incident ${params.incidentId}.`;
      },
    });
  }
}
