import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAssistant } from '@foisit/react-wrapper';
import '../showcase.css';

const callDevAssistant = async (
  code: string,
  question: string
): Promise<string> => {
  try {
    const res = await fetch(import.meta.env.VITE_DEV_ASSISTANT_PROXY, {
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
  } catch (err) {
    console.error('callDevAssistant failed:', err);
    throw err;
  }
};

export function Playground() {
  const assistant = useAssistant();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('foisit-theme') as 'light' | 'dark';
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('foisit-theme', theme);
  }, [theme]);

  // Setup all demo commands
  useEffect(() => {
    // Help command
    assistant.addCommand({
      command: 'help',
      description: 'Show available commands and what I can do',
      action: async () => {
        return `I can help you with:
User Management (create user, update profile)
Scheduling (book appointment, schedule meeting)
Data Operations (delete records - requires confirmation)
Analytics (view stats)
UI Actions (change theme, toggle dark mode)

Just tell me what you'd like to do!`;
      },
    });

    // Create user command
    assistant.addCommand({
      command: 'create user',
      description: 'Create a new user account with name, email, and age',
      parameters: [
        {
          name: 'name',
          description: 'Full name',
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
        if (params.age < 18) {
          return {
            type: 'error',
            message: 'User must be at least 18 years old.',
          };
        }
        await new Promise((r) => setTimeout(r, 800));
        return {
          type: 'success',
          message: `User created successfully!\n\nName: ${params.name}\nEmail: ${params.email}\nAge: ${params.age}`,
        };
      },
    });

    // Change theme command
    assistant.addCommand({
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
        document.body.style.backgroundColor = themeColors[params.theme] || '';
        return {
          type: 'success',
          message: `Theme changed to ${params.theme}!`,
        };
      },
    });

    // Book appointment command
    assistant.addCommand({
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
        return {
          type: 'success',
          message: `Appointment booked!\n\nService: ${
            params.service
          }\nDate: ${new Date(params.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        };
      },
    });

    // Schedule meeting command
    assistant.addCommand({
      command: 'schedule meeting',
      description: 'Schedule a meeting with a team member',
      parameters: [
        {
          name: 'member',
          description: 'Team member to meet with',
          required: true,
          type: 'select',
          getOptions: async () => {
            await new Promise((r) => setTimeout(r, 500));
            return [
              { label: 'Alice Johnson (Engineering)', value: 'alice' },
              { label: 'Bob Smith (Design)', value: 'bob' },
              { label: 'Charlie Brown (Product)', value: 'charlie' },
              { label: 'Diana Prince (Marketing)', value: 'diana' },
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
        await new Promise((r) => setTimeout(r, 600));
        return {
          type: 'success',
          message: `Meeting scheduled with ${params.member} on ${new Date(
            params.date
          ).toLocaleDateString()}\nDuration: ${params.duration} minutes`,
        };
      },
    });

    // Delete all records command
    assistant.addCommand({
      command: 'delete all records',
      description: 'Permanently delete all user records',
      critical: true,
      action: async () => {
        await new Promise((r) => setTimeout(r, 1000));
        return {
          type: 'success',
          message:
            'All records have been deleted. This action cannot be undone.',
        };
      },
    });

    // Update profile command
    assistant.addCommand({
      command: 'update profile',
      description: 'Update your user profile',
      parameters: [
        {
          name: 'displayName',
          description: 'Your display name',
          required: false,
          type: 'string',
        },
        {
          name: 'bio',
          description: 'Short bio',
          required: false,
          type: 'string',
        },
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
        const updates = Object.entries(params || {})
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        return updates
          ? `Profile updated: ${updates}`
          : 'No changes made to profile.';
      },
    });

    // Reset theme command
    assistant.addCommand({
      command: 'reset theme',
      action: async () => {
        document.body.style.backgroundColor = '';
        return 'Theme reset to default.';
      },
    });

    // View stats command
    assistant.addCommand({
      command: 'view stats',
      description: 'View application statistics',
      action: async () => {
        return `Application Statistics:\n\nActive Users: 1,234\nTotal Commands: 42\nUptime: 99.9%\nVersion: 1.0.0`;
      },
    });

    // Upload file command
    assistant.addCommand({
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
        const v = params?.attachment as File | undefined;
        if (!v) {
          return { type: 'error', message: 'No file provided.' };
        }
        return {
          type: 'success',
          message: `File received.\n\nName: ${v.name}\nType: ${
            v.type || 'unknown'
          }\nSize: ${v.size} bytes`,
        };
      },
    });

    // Dev assistant command
    assistant.addCommand({
      command: 'dev assistant',
      description: 'Get help with Foisit development questions and code issues',
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
          const response = await callDevAssistant(
            params?.code || '',
            params?.question
          );
          return response;
        } catch (error) {
          return { type: 'error', message: `Dev assistant error: ${error}` };
        }
      },
    });

    // Escalate command
    assistant.addCommand({
      command: 'escalate',
      description: 'Escalate an incident (demo)',
      parameters: [
        {
          name: 'incidentId',
          description: 'Incident ID to escalate',
          required: true,
          type: 'number',
        },
      ],
      action: async (params: any) => {
        if (!params || params.incidentId == null) {
          return {
            type: 'form',
            message: 'Provide the Incident ID to escalate.',
            fields: [
              {
                name: 'incidentId',
                description: 'Incident ID',
                required: true,
                type: 'number',
              },
            ],
          };
        }
        await new Promise((r) => setTimeout(r, 600));
        return `Escalation recorded for incident ${params.incidentId}.`;
      },
    });

    // Cleanup
    return () => {
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
      commands.forEach((cmd) => assistant.removeCommand(cmd));
    };
  }, [assistant]);

  // Register escalate handler for programmatic demo
  useEffect(() => {
    const handler = async (params?: { incidentId?: number }) => {
      await new Promise((r) => setTimeout(r, 500));
      return `Escalation created for incident ${
        params?.incidentId ?? 'unknown'
      }.`;
    };
    assistant.registerCommandHandler('escalate', handler);
    return () => assistant.unregisterCommandHandler('escalate');
  }, [assistant]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="showcase-container">
        <header className="hero-section">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <span className="hero-badge">React Wrapper</span>
          <h1 className="hero-title">Interactive Playground</h1>
          <p className="hero-subtitle">
            Test all Foisit features live. Open the assistant and try the
            commands below.
          </p>
          <div className="hero-actions">
            <button className="demo-btn" onClick={() => assistant.toggle()}>
              Open Assistant
            </button>
            <button
              className="demo-btn secondary"
              onClick={() =>
                assistant.runCommand({
                  commandId: 'escalate',
                  params: { incidentId: null },
                  openOverlay: true,
                  showInvocation: true,
                })
              }
            >
              Escalate Demo
            </button>
          </div>
        </header>

        {/* Quick Start Guide */}
        <section className="glass-card">
          <h2 className="section-title">Get Started in 3 Steps</h2>
          <p>
            <strong>Step 1:</strong> Install the package
          </p>
          <div className="code-block">
            <div className="code-header">
              <span>Terminal</span>
              <span>NPM</span>
            </div>
            <pre>npm install @foisit/react-wrapper</pre>
          </div>

          <p style={{ marginTop: '20px' }}>
            <strong>Step 2:</strong> Wrap your app
          </p>
          <div className="code-block">
            <div className="code-header">
              <span>App.tsx</span>
            </div>
            <pre>{`import { AssistantProvider } from '@foisit/react-wrapper';

const config = {
  commands: [
    { command: 'greet', action: () => 'Hello!' }
  ]
};

export default () => (
  <AssistantProvider config={config}>
    <YourApp />
  </AssistantProvider>
);`}</pre>
          </div>

          <p style={{ marginTop: '20px' }}>
            <strong>Step 3:</strong> Triple-tap anywhere or click the floating
            button.
          </p>
        </section>

        {/* Live Examples with Code */}
        <section className="glass-card">
          <h2 className="section-title">Interactive Examples</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Open the assistant and try these commands live. Each shows the code
            powering it.
          </p>

          {/* Example 1: Basic Command */}
          <div className="example-section">
            <h3>Basic Command</h3>
            <p>Say "help" - no parameters, instant response.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'help',
  description: 'Show available commands',
  action: async () => {
    return 'I can help you with: User Management, Scheduling...';
  }
});`}</pre>
            </div>
          </div>

          {/* Example 2: Multi-Parameter */}
          <div className="example-section">
            <h3>Multi-Parameter with Validation</h3>
            <p>
              Say "create user" - collects name, email, age with validation.
            </p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
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
    return { type: 'success', message: \`User \${params.name} created!\` };
  }
});`}</pre>
            </div>
          </div>

          {/* Example 3: Select Dropdown */}
          <div className="example-section">
            <h3>Dropdown Selection</h3>
            <p>Say "change theme" - renders a dropdown picker.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'change theme',
  parameters: [{
    name: 'theme',
    type: 'select',
    options: [
      { label: 'Blue Ocean', value: 'blue' },
      { label: 'Forest Green', value: 'green' }
    ]
  }],
  action: (params) => \`Theme changed to \${params.theme}!\`
});`}</pre>
            </div>
          </div>

          {/* Example 4: Date Picker */}
          <div className="example-section">
            <h3>Date Picker</h3>
            <p>Say "book appointment" - native date picker UI.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'book appointment',
  parameters: [
    { name: 'service', type: 'string', required: true },
    { name: 'date', type: 'date', required: true }
  ],
  action: (params) => \`Booked \${params.service} on \${params.date}\`
});`}</pre>
            </div>
          </div>

          {/* Example 5: Async Select */}
          <div className="example-section">
            <h3>Dynamic API Options</h3>
            <p>Say "schedule meeting" - loads team members from API.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'schedule meeting',
  parameters: [{
    name: 'member',
    type: 'select',
    getOptions: async () => {
      const members = await api.getTeamMembers();
      return members.map(m => ({ label: m.name, value: m.id }));
    }
  }],
  action: (params) => \`Meeting scheduled with \${params.member}\`
});`}</pre>
            </div>
          </div>

          {/* Example 6: Critical Action */}
          <div className="example-section">
            <h3>Protected Actions</h3>
            <p>Say "delete all records" - requires confirmation.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'delete all records',
  critical: true, // Forces confirmation
  action: async () => {
    await database.deleteAll();
    return { type: 'success', message: 'All records deleted.' };
  }
});`}</pre>
            </div>
          </div>

          {/* Example 7: File Upload */}
          <div className="example-section">
            <h3>File Upload</h3>
            <p>Say "upload file" - file picker with type restrictions.</p>
            <div className="code-block">
              <div className="code-header">
                <span>TypeScript</span>
              </div>
              <pre>{`assistant.addCommand({
  command: 'upload file',
  parameters: [{
    name: 'attachment',
    type: 'file',
    accept: ['image/*', 'audio/*'],
    delivery: 'base64' // or 'file'
  }],
  action: (params) => \`Received \${params.attachment.name}\`
});`}</pre>
            </div>
          </div>
        </section>

        {/* Parameter Types Reference */}
        <section className="glass-card">
          <h2 className="section-title">Parameter Types</h2>
          <div className="code-block">
            <pre>{`// STRING - Text input
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
{ name: 'attachment', type: 'file', accept: ['image/*'], delivery: 'base64' }`}</pre>
          </div>
        </section>

        {/* Interactive Sandbox */}
        <section className="glass-card">
          <h2 className="section-title">Try It Now</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Open the assistant and test commands live:
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="demo-btn" onClick={() => assistant.toggle()}>
              Open Assistant
            </button>
            <button
              className="demo-btn secondary"
              onClick={() =>
                assistant.toggle(
                  (text) => console.log('User typed:', text),
                  () => console.log('Assistant closed')
                )
              }
            >
              Toggle with Callbacks
            </button>
          </div>
        </section>

        {/* Hook API */}
        <section className="glass-card">
          <h2 className="section-title">React Hook API</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Full control from your React components:
          </p>
          <div className="code-block">
            <pre>{`import { useAssistant } from '@foisit/react-wrapper';

function MyComponent() {
  const assistant = useAssistant();

  // Open/close the assistant
  assistant.toggle();

  // Add commands dynamically
  assistant.addCommand('search', async (params) => {
    const results = await api.search(params.query);
    return \`Found \${results.length} results\`;
  });

  // Remove commands
  assistant.removeCommand('search');
}`}</pre>
          </div>
        </section>

        {/* Gesture Activation */}
        <section className="glass-card">
          <h2 className="section-title">Gesture Activation</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Activate the assistant with gestures. Triple-click or triple-tap
            anywhere on the page to open it instantly.
          </p>
          <div className="code-block">
            <pre>{`// Gesture activation is enabled by default
const config = {
  enableGestureActivation: true, // Triple-tap/click to open
  // ... other config
};

<AssistantProvider config={config}>
  <YourApp />
</AssistantProvider>`}</pre>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Try it: Triple-click or triple-tap anywhere on this page (not the
            assistant itself) to open the overlay.
          </p>
        </section>

        {/* Smart Intent */}
        <section className="glass-card">
          <h2 className="section-title">Smart Intent Understanding</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Commands don't have to be exact. The assistant understands natural
            language and matches your intent.
          </p>
          <div className="code-block">
            <pre>{`// Register a command
assistant.addCommand({
  command: 'book appointment',
  // ... parameters and action
});

// User can say variations like:
// "schedule a meeting"
// "make an appointment"
// "book me a slot"
// The assistant intelligently matches to the closest command.`}</pre>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Try it: Open the assistant and say something like "I want to book an
            appt" or "schedule a meeting" — it should match the "book
            appointment" command.
          </p>
        </section>

        {/* Fallback Responses */}
        <section className="glass-card">
          <h2 className="section-title">Fallback Responses</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            When the assistant doesn't understand, it provides helpful fallback
            responses.
          </p>
          <div className="code-block">
            <pre>{`const config = {
  fallbackResponse: 'I didn\\'t catch that. Try "help" for available commands.',
  // ... other config
};

<AssistantProvider config={config}>
  <YourApp />
</AssistantProvider>`}</pre>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Try it: Open the assistant and type gibberish or an unrecognized
            command to see the fallback in action.
          </p>
        </section>

        {/* Programmatic Command Handlers */}
        <section className="glass-card">
          <h2 className="section-title">Programmatic Command Handlers</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Register custom handlers for programmatic execution, bypassing the
            normal command flow.
          </p>
          <div className="code-block">
            <pre>{`const assistant = useAssistant();

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
assistant.unregisterCommandHandler('customAction');`}</pre>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            The "Escalate Demo" button above uses this pattern — it runs a
            registered handler programmatically.
          </p>
        </section>

        {/* Features Summary */}
        <section className="glass-card">
          <h2 className="section-title">Everything You Need</h2>
          <ul>
            <li>AI-powered natural language understanding</li>
            <li>Automatic form generation for missing parameters</li>
            <li>5 parameter types: string, number, date, select, file</li>
            <li>Async data loading for dynamic dropdowns</li>
            <li>Confirmation dialogs for destructive actions</li>
            <li>Full validation and error handling</li>
            <li>Programmatic API for dynamic commands</li>
            <li>Gesture activation (triple-tap/click)</li>
            <li>Smart intent matching for natural input</li>
            <li>Fallback responses for unrecognized commands</li>
            <li>Custom command handlers for advanced workflows</li>
            <li>Light and dark mode built-in</li>
            <li>Zero external dependencies</li>
            <li>100% TypeScript with full type safety</li>
            <li>SSR-safe (voice features disabled for compatibility)</li>
          </ul>
        </section>
      </div>
    </>
  );
}

export default Playground;
