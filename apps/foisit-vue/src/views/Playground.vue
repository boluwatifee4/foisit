<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import '../app/showcase.css';

const router = useRouter();
const theme = ref<'light' | 'dark'>('light');

// Get assistant service
let assistantService: any = null;

const callDevAssistant = async (code: string, question: string): Promise<string> => {
  try {
    const res = await fetch(import.meta.env.VITE_DEV_ASSISTANT_PROXY || '', {
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
};

onMounted(() => {
  // Load saved theme
  const savedTheme = localStorage.getItem('foisit-theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    theme.value = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Get assistant service
  assistantService = (window as any).__foisit__;

  // Setup demo commands
  if (assistantService) setupCommands();
});

onUnmounted(() => {
  if (assistantService) {
    const commands = [
      'help', 'create user', 'change theme', 'book appointment',
      'schedule meeting', 'delete all records', 'update profile',
      'reset theme', 'view stats', 'upload file', 'dev assistant',
      'escalate', 'transfer money', 'print shipping label',
    ];
    commands.forEach((cmd) => assistantService.removeCommand(cmd));
  }
});

const setupCommands = () => {
  // Help
  assistantService.addCommand({
    command: 'help',
    description: 'Show available commands and what I can do',
    action: async () => {
      return `I can help you with:\nUser Management (create user, update profile)\nScheduling (book appointment, schedule meeting)\nData Operations (delete records - requires confirmation)\nAnalytics (view stats)\nUI Actions (change theme, toggle dark mode)\nFinancial (transfer money - requires confirmation)\nLogistics (print shipping label)\n\nJust tell me what you'd like to do!`;
    },
  });

  // Create user
  assistantService.addCommand({
    command: 'create user',
    description: 'Create a new user account with name, email, and age',
    parameters: [
      { name: 'name', description: 'Full name', required: true, type: 'string' },
      { name: 'email', description: 'Email address', required: true, type: 'string' },
      { name: 'age', description: 'User age (must be 18+)', required: true, type: 'number' },
    ],
    action: async (params: any) => {
      if (params.age < 18) return { type: 'error', message: 'User must be at least 18 years old.' };
      await new Promise((r) => setTimeout(r, 800));
      return { type: 'success', message: `User created successfully!\n\nName: ${params.name}\nEmail: ${params.email}\nAge: ${params.age}` };
    },
  });

  // Change theme
  assistantService.addCommand({
    command: 'change theme',
    description: 'Switch between light and dark mode',
    action: async () => {
      const newTheme = theme.value === 'light' ? 'dark' : 'light';
      theme.value = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('foisit-theme', newTheme);
      return `Theme switched to ${newTheme} mode.`;
    },
  });

  // Book appointment
  assistantService.addCommand({
    command: 'book appointment',
    description: 'Schedule an appointment with date and time',
    parameters: [
      { name: 'patientName', description: 'Patient name', required: true, type: 'string' },
      { name: 'date', description: 'Appointment date', required: true, type: 'date' },
      { name: 'timeSlot', description: 'Time slot', required: true, type: 'string' },
    ],
    action: async (params: any) => {
      await new Promise((r) => setTimeout(r, 600));
      return `Appointment booked for ${params.patientName} on ${params.date} at ${params.timeSlot}.`;
    },
  });

  // Transfer money
  assistantService.addCommand({
    id: 'transfer_money',
    command: 'transfer money',
    description: 'Transfer money to an account (requires confirmation)',
    parameters: [
      { name: 'amount', type: 'number', required: true },
      { name: 'toAccount', type: 'string', required: true },
    ],
    critical: true,
    action: async (params: any) => `Demo: Would transfer $${params.amount} to ${params.toAccount} after confirmation.`,
  });

  // Print shipping label
  assistantService.addCommand({
    id: 'print_shipping_label',
    command: 'print shipping label',
    description: 'Print shipping label for an order (fast execution)',
    parameters: [{ name: 'orderId', type: 'string', required: true }],
    macro: true,
    action: async (params: any) => `Demo: Shipping label generated for order #${params.orderId}.`,
  });

  // Schedule meeting
  assistantService.addCommand({
    command: 'schedule meeting',
    description: 'Schedule a meeting with attendees',
    parameters: [
      {
        name: 'member',
        description: 'Team member to meet with',
        required: true,
        type: 'select',
        getOptions: async () => {
          await new Promise((r) => setTimeout(r, 300));
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
    action: async (params: any) => {
      await new Promise((r) => setTimeout(r, 500));
      return { type: 'success', message: `Meeting "${params.title || params.member}" scheduled for ${new Date(params.date).toLocaleDateString()}\nDuration: ${params.duration} minutes` };
    },
  });

  // Delete all records
  assistantService.addCommand({
    command: 'delete all records',
    description: 'Permanently delete all user records',
    critical: true,
    action: async () => {
      await new Promise((r) => setTimeout(r, 1000));
      return { type: 'success', message: 'All records have been deleted. This action cannot be undone.' };
    },
  });

  // Update profile
  assistantService.addCommand({
    command: 'update profile',
    description: 'Update your user profile',
    parameters: [
      { name: 'displayName', description: 'Your display name', required: false, type: 'string' },
      { name: 'bio', description: 'Short bio', required: false, type: 'string' },
      {
        name: 'role',
        description: 'Your role',
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
      const updates = Object.entries(params || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ');
      return updates ? `Profile updated: ${updates}` : 'No changes made to profile.';
    },
  });

  // View stats
  assistantService.addCommand({
    command: 'view stats',
    description: 'Show application statistics',
    action: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return `Application Stats:\n• Total Users: 1,247\n• Active Sessions: 89\n• Commands Executed: 5,632\n• Average Response Time: 245ms`;
    },
  });

  // Reset theme command
  assistantService.addCommand({
    command: 'reset theme',
    action: async () => {
      document.body.style.backgroundColor = '';
      return 'Theme reset to default.';
    },
  });

  // Upload file
  assistantService.addCommand({
    command: 'upload file',
    description: 'Upload a file with description',
    parameters: [
      { name: 'attachment', description: 'Select a file', required: true, type: 'file', accept: ['image/*', 'audio/*', 'video/*'], delivery: 'file' },
    ],
    action: async (params: any) => {
      const v = params?.attachment as File | undefined;
      if (!v) {
        return { type: 'error', message: 'No file provided.' };
      }
      return {
        type: 'success',
        message: `File received.\n\nName: ${v.name}\nType: ${v.type || 'unknown'}\nSize: ${v.size} bytes`,
      };
    },
  });

  // Dev assistant
  assistantService.addCommand({
    id: 'dev_assistant',
    command: 'dev assistant',
    description: 'Get help with Foisit development questions and code issues',
    parameters: [
      { name: 'question', description: 'Your question about Foisit', required: true, type: 'string' },
      { name: 'code', description: 'Optional code snippet to analyze', required: false, type: 'string' },
    ],
    action: async (params: any) => {
      try {
        const response = await callDevAssistant(params?.code || '', params?.question);
        return response;
      } catch (error) {
        return { type: 'error', message: `Dev assistant error: ${error}` };
      }
    },
  });

  // Escalate (programmatic handler demo)
  assistantService.addCommand({
    id: 'escalate',
    command: 'escalate',
    description: 'Escalate an issue to support team',
    action: async (params: any) => {
      if (!params || params.incidentId == null) {
        return { type: 'form', message: 'Provide the Incident ID to escalate.', fields: [{ name: 'incidentId', type: 'number', required: true }] };
      }
      await new Promise((r) => setTimeout(r, 600));
      return `Escalation recorded for incident ${params.incidentId}.`;
    },
  });
};

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  localStorage.setItem('foisit-theme', theme.value);
};

const openAssistant = () => {
  assistantService?.toggle();
};

const runEscalateDemo = () => {
  assistantService?.runCommand({ commandId: 'escalate', params: { incidentId: null }, openOverlay: true, showInvocation: true });
};

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div>
    <button class="theme-toggle" @click="toggleTheme">{{ theme === 'light' ? '🌙' : '☀️' }}</button>

    <div class="showcase-container">
      <header class="hero-section">
        <a class="back-link" @click.prevent="goBack" href="/">← Back to Home</a>
        <span class="hero-badge">Vue Wrapper</span>
        <h1 class="hero-title">Interactive Playground</h1>
        <p class="hero-subtitle">Explore Foisit’s features live — register commands, test forms, and run demos.</p>
        <div class="hero-actions">
          <button class="demo-btn" @click="openAssistant">Open Assistant</button>
          <button class="demo-btn secondary" @click="runEscalateDemo">Run Escalate Demo</button>
        </div>
      </header>

      <section class="glass-card">
        <h2 class="section-title">Get Started in 3 Steps</h2>
        <p><strong>Step 1:</strong> Install the package</p>
        <div class="code-block"><pre>npm install @foisit/vue-wrapper</pre></div>

        <p><strong>Step 2:</strong> Wrap your app with <code>AssistantProvider</code></p>
        <div class="code-block"><pre>&lt;AssistantProvider :config="config"&gt;...&lt;/AssistantProvider&gt;</pre></div>

        <p style="margin-top: 20px;"><strong>Step 3:</strong> Triple-tap anywhere or click the floating button to open the assistant.</p>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Interactive Examples</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          Open the assistant and try these commands live. Each shows the code powering it.
        </p>

        <div class="example-section">
          <h3>Basic Command</h3>
          <p>Say "help" — no parameters, instant response.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'help',
  description: 'Show available commands',
  action: async () => {
    return 'I can help you with: User Management, Scheduling...';
  }
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>Multi-Parameter with Validation</h3>
          <p>Say "create user" — collects name, email, age with validation.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'create user',
  parameters: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: true }
  ],
  action: async (params) => {
    if (params.age &lt; 18) {
      return { type: 'error', message: 'Must be 18+' };
    }
    return { type: 'success', message: `User ${params.name} created!` };
  }
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>Dropdown Selection</h3>
          <p>Say "change theme" — renders a dropdown picker.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
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
  action: (params) =&gt; `Theme changed to ${params.theme}!`
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>Date Picker</h3>
          <p>Say "book appointment" — native date picker UI.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'book appointment',
  parameters: [
    { name: 'service', type: 'string', required: true },
    { name: 'date', type: 'date', required: true }
  ],
  action: (params) =&gt; `Booked ${params.service} on ${params.date}`
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>Dynamic API Options</h3>
          <p>Say "schedule meeting" — loads team members from API.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'schedule meeting',
  parameters: [{
    name: 'member',
    type: 'select',
    getOptions: async () =&gt; {
      const members = await api.getTeamMembers();
      return members.map(m =&gt; ({ label: m.name, value: m.id }));
    }
  }],
  action: (params) =&gt; `Meeting scheduled with ${params.member}`
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>Protected Actions</h3>
          <p>Say "delete all records" — requires confirmation.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'delete all records',
  critical: true, // Forces confirmation
  action: async () =&gt; {
    await database.deleteAll();
    return { type: 'success', message: 'All records deleted.' };
  }
});</pre>
          </div>
        </div>

        <div class="example-section">
          <h3>File Upload</h3>
          <p>Say "upload file" — file picker with type restrictions.</p>
          <div class="code-block">
            <div class="code-header"><span>TypeScript</span></div>
            <pre>assistant.addCommand({
  command: 'upload file',
  parameters: [{
    name: 'attachment',
    type: 'file',
    accept: ['image/*', 'audio/*'],
    delivery: 'base64' // or 'file'
  }],
  action: (params) =&gt; `Received ${params.attachment.name}`
});</pre>
          </div>
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Parameter Types</h2>
        <div class="code-block">
          <pre>// STRING - Text input
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
{ name: 'attachment', type: 'file', accept: ['image/*'], delivery: 'base64' }</pre>
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Try It Now</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">
          Open the assistant and test the commands live on this page.
        </p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button class="demo-btn" @click="openAssistant">Open Assistant</button>
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Vue Composable API</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Full control from your Vue components using the <code>useAssistant</code> composable:
        </p>
        <div class="code-block">
          <pre>import { useAssistant } from '@foisit/vue-wrapper';

const assistant = useAssistant();

// Open/close the assistant
assistant.toggle();

// Add commands dynamically
assistant.addCommand({
  command: 'search',
  action: async (params) => {
    const results = await api.search(params.query);
    return `Found ${results.length} results`;
  }
});

// Remove commands
assistant.removeCommand('search');</pre>
        </div>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Gesture Activation</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Activate the assistant with gestures. Triple-click or triple-tap anywhere on the page to open it instantly.
        </p>
        <div class="code-block">
          <div class="code-header"><span>TypeScript</span></div>
          <pre>// Gesture activation is enabled by default
const config = {
  enableGestureActivation: true, // Triple-tap/click to open
  // ... other config
};

&lt;AssistantProvider :config="config"&gt;
  &lt;YourApp /&gt;
&lt;/AssistantProvider&gt;</pre>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Try it: Triple-click or triple-tap anywhere on this page (not the assistant itself) to open the overlay.
        </p>

        <h2 class="section-title">Smart Intent Understanding</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Commands don't have to be exact. The assistant understands natural language and matches your intent.
        </p>
        <div class="code-block">
          <div class="code-header"><span>TypeScript</span></div>
          <pre>// Register a command
assistant.addCommand({
  command: 'book appointment',
  // ... parameters and action
});

// User can say variations like:
// "schedule a meeting"
// "make an appointment"
// "book me a slot"
// The assistant intelligently matches to the closest command.</pre>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Try it: Open the assistant and say something like "I want to book an appt" — it should match the "book appointment" command.
        </p>

        <h2 class="section-title">Fallback Responses</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          When the assistant doesn't understand, it provides helpful fallback responses.
        </p>
        <div class="code-block">
          <div class="code-header"><span>TypeScript</span></div>
          <pre>const config = {
  fallbackResponse: "I didn't catch that. Try 'help' for available commands.",
  // ... other config
};

&lt;AssistantProvider :config="config"&gt;
  &lt;YourApp /&gt;
&lt;/AssistantProvider&gt;</pre>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Try it: Open the assistant and type gibberish to see the fallback in action.
        </p>

        <h2 class="section-title">Programmatic Command Handlers</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">
          Register custom handlers for programmatic execution, bypassing the normal command flow.
        </p>
        <div class="code-block">
          <div class="code-header"><span>TypeScript</span></div>
          <pre>// Register a handler
assistant.registerCommandHandler('customAction', async (params) =&gt; {
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
assistant.unregisterCommandHandler('customAction');</pre>
        </div>
        <p style="color: var(--text-secondary)">The “Escalate Demo” button above uses this pattern — it runs a registered handler programmatically.</p>
      </section>

      <section class="glass-card">
        <h2 class="section-title">Everything You Need</h2>
        <ul>
          <li>AI-powered natural language understanding</li>
          <li>Automatic form generation for missing parameters</li>
          <li>Parameter types: string, number, date, select, file</li>
          <li>Async data loading for dynamic dropdowns</li>
          <li>Confirmation dialogs for destructive actions</li>
          <li>Full validation and error handling</li>
          <li>Programmatic API for dynamic commands</li>
          <li>Gesture activation (triple-tap/click)</li>
          <li>Smart intent matching</li>
          <li>Fallback responses</li>
          <li>Light and dark mode built-in</li>
          <li>Zero external dependencies</li>
          <li>TypeScript-first</li>
          <li>SSR-safe (voice disabled where appropriate)</li>
        </ul>
      </section>
    </div>
  </div>
</template>
