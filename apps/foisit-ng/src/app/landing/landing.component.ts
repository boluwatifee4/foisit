import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssistantService } from '@foisit/angular-wrapper';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit, OnDestroy {
  theme = 'light';

  private readonly DEV_ASSISTANT_ENDPOINT = environment.devAssistantProxyUrl;

  // FinTech code example (Angular Syntax)
  fintechCode = `// Add a transfer command with built-in safety guardrails
this.assistant.addCommand({
  // The phrase users will say to trigger this command
  command: 'transfer money',

  // Define required parameters with type validation
  parameters: [
    { name: 'amount', type: 'number', required: true },
    { name: 'toAccount', type: 'string', required: true }
  ],

  // Critical flag halts execution and shows confirmation UI
  critical: true,

  // Your business logic executes only after user confirms
  action: async (params) => {
    await this.bankingAPI.transfer(params.amount, params.toAccount);
    return \`Transferred $\${params.amount} to \${params.toAccount}\`;
  }
});`;

  // HealthTech code example (Angular Syntax)
  healthtechCode = `// Add an appointment booking command with auto-forms
this.assistant.addCommand({
  // Natural language trigger phrase
  command: 'book appointment',

  // When required params are missing, Foisit auto-renders a form
  parameters: [
    { name: 'patientName', type: 'string', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'timeSlot', type: 'string', required: true }
  ],

  // Action runs once all parameters are collected
  action: async (params) => {
    const appt = await this.scheduler.book(params);
    return \`Appointment booked for \${params.patientName} on \${params.date}\`;
  }
});`;

  // E-Commerce code example (Angular Syntax)
  ecommerceCode = `// Add a fast-path command that bypasses AI processing
this.assistant.addCommand({
  // Exact match triggers instant execution (no LLM call)
  command: 'print shipping label',

  // Parameters extracted via regex for O(1) latency
  parameters: [
    { name: 'orderId', type: 'string', required: true }
  ],

  // Macro mode: bypasses AI for high-frequency actions
  macro: true,

  // Executes immediately without AI interpretation delay
  action: async (params) => {
    const label = await this.fulfillment.generateLabel(params.orderId);
    window.open(label.pdfUrl, '_blank');
    return \`Label generated for order #\${params.orderId}\`;
  }
});`;

  // Escalation code example (Angular Syntax)
  escalationCode = `// Example: Escalate to human support
this.assistant.addCommand({
  command: 'speak to human',
  description: 'Connect user with a live support agent',
  action: async () => {
    await this.supportAPI.createTicket({ priority: 'high' });
    return 'Connecting you with a support agent now...';
  }
});`;

  constructor(public assistant: AssistantService, private router: Router) {}

  ngOnInit() {
    // Check local storage for theme
    const savedTheme = localStorage.getItem('foisit-theme');
    if (savedTheme) {
      this.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    this.registerLandingCommands();
  }

  ngOnDestroy(): void {
    this.assistant.removeCommand('change theme');
    this.assistant.removeCommand('go to playground');
    this.assistant.removeCommand('dev assistant');
    this.assistant.removeCommand('transfer money');
    this.assistant.removeCommand('book appointment');
    this.assistant.removeCommand('print shipping label');
  }

  private async callDevAssistant(code: string, question: string): Promise<string> {
    if (!this.DEV_ASSISTANT_ENDPOINT) {
      throw new Error(
        'Dev assistant proxy is not configured. Set environment.devAssistantProxyUrl.'
      );
    }

    const res = await fetch(this.DEV_ASSISTANT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, question }),
    });

    if (!res.ok) {
      throw new Error(`Dev assistant HTTP error: ${res.status}`);
    }

    const data = (await res.json()) as { answer?: string; message?: string };
    return (
      data.answer || data.message || 'Dev assistant did not return a response.'
    );
  }

  private registerLandingCommands(): void {
    this.assistant.addCommand({
      command: 'change theme',
      description: 'Switch between light and dark mode',
      action: async () => {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.theme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('foisit-theme', newTheme);
        return `Theme switched to ${newTheme} mode.`;
      },
    });

    this.assistant.addCommand({
      command: 'go to playground',
      description: 'Navigate to the interactive playground',
      action: async () => {
        await this.router.navigate(['/playground']);
        window.scrollTo(0, 0);
        return 'Navigating to playground...';
      },
    });

    this.assistant.addCommand({
      id: 'dev_assistant',
      command: 'dev assistant',
      description:
        'Get help with Foisit development questions and code issues (demo only on this site)',
      parameters: [
        {
          name: 'question',
          description: 'Your question about Foisit',
          required: true,
          type: 'string',
        },
        {
          name: 'code',
          description: 'Optional code snippet to analyze',
          required: false,
          type: 'string',
        },
      ],
      action: async (params: any) => {
        try {
          const response = await this.callDevAssistant(
            params?.code || '',
            params?.question
          );
          return response;
        } catch (error) {
          return { type: 'error', message: `Dev assistant error: ${error}` };
        }
      },
    });

    // Demo commands for use cases
    this.assistant.addCommand({
      id: 'transfer_money',
      command: 'transfer money',
      description: 'Demo: Transfer money to an account',
      parameters: [
        { name: 'amount', type: 'number', required: true },
        { name: 'toAccount', type: 'string', required: true },
      ],
      critical: true,
      action: async (params: any) => {
        return `Demo: Would transfer $${params.amount} to ${params.toAccount} after confirmation.`;
      },
    });

    this.assistant.addCommand({
      id: 'book_appointment',
      command: 'book appointment',
      description: 'Demo: Book an appointment',
      parameters: [
        { name: 'patientName', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'timeSlot', type: 'string', required: true },
      ],
      action: async (params: any) => {
        return `Demo: Appointment booked for ${params.patientName} on ${params.date} at ${params.timeSlot}.`;
      },
    });

    this.assistant.addCommand({
      id: 'print_shipping_label',
      command: 'print shipping label',
      description: 'Demo: Print shipping label for an order',
      parameters: [{ name: 'orderId', type: 'string', required: true }],
      action: async (params: any) => {
        return `Demo: Shipping label generated for order #${params.orderId}.`;
      },
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('foisit-theme', this.theme);
  }

  goToPlayground() {
    this.router.navigate(['/playground']);
    window.scrollTo(0, 0);
  }

  triggerTransfer() {
    this.assistant.runCommand({
      commandId: 'transfer_money',
      params: { amount: null, toAccount: null },
      openOverlay: true,
      showInvocation: true,
    });
  }

  triggerBook() {
    this.assistant.runCommand({
      commandId: 'book_appointment',
      params: { patientName: null, date: null, timeSlot: null },
      openOverlay: true,
      showInvocation: true,
    });
  }

  triggerLabel() {
    this.assistant.runCommand({
      commandId: 'print_shipping_label',
      params: { orderId: null },
      openOverlay: true,
      showInvocation: true,
    });
  }

  triggerDevAssistant() {
    this.assistant.runCommand({
      commandId: 'dev_assistant',
      params: { question: null, code: null },
      openOverlay: true,
      showInvocation: true,
    });
  }
}
