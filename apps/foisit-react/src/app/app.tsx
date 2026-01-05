import React, { useState, useEffect } from 'react';
import { AssistantProvider, useAssistant } from '@foisit/react-wrapper';
import './showcase.css';

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

const config = {
  activationCommand: 'hey foisit',
  introMessage:
    'Welcome to Foisit! I can help you with various tasks. Try saying "help" to see what I can do.',
  fallbackResponse:
    'I didn\'t quite understand that. Try saying "help" or "show commands" to see what I can assist with.',
  enableSmartIntent: true,
  inputPlaceholder: 'Type a command or describe what you need...',
  floatingButton: {
    visible: true,
    tooltip: 'Open Foisit Assistant',
    position: { bottom: '30px', right: '30px' },
  },
  commands: [
    {
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
    },

    {
      command: 'create user',
      description: 'Create a new user account with name, email, and age',
      parameters: [
        {
          name: 'name',
          description: 'Full name of the user',
          required: true,
          type: 'string' as const,
        },
        {
          name: 'email',
          description: 'Email address',
          required: true,
          type: 'string' as const,
        },
        {
          name: 'age',
          description: 'User age (must be 18+)',
          required: true,
          type: 'number' as const,
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { name: string; email: string; age: number };

        if (typed.age < 18) {
          return {
            type: 'error' as const,
            message: 'User must be at least 18 years old.',
          };
        }

        await new Promise((resolve) => setTimeout(resolve, 800));

        return {
          type: 'success' as const,
          message: `User created successfully!\n\nName: ${typed.name}\nEmail: ${typed.email}\nAge: ${typed.age}`,
        };
      },
    },

    {
      command: 'change theme',
      description: 'Change the application color theme',
      parameters: [
        {
          name: 'theme',
          description: 'Choose a color theme',
          required: true,
          type: 'select' as const,
          options: [
            { label: 'Blue Ocean', value: 'blue' },
            { label: 'Forest Green', value: 'green' },
            { label: 'Purple Haze', value: 'purple' },
            { label: 'Ruby Red', value: 'red' },
          ],
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { theme: string };

        const themeColors: Record<string, string> = {
          blue: 'rgba(59, 130, 246, 0.1)',
          green: 'rgba(34, 197, 94, 0.1)',
          purple: 'rgba(168, 85, 247, 0.1)',
          red: 'rgba(239, 68, 68, 0.1)',
        };
        document.body.style.backgroundColor = themeColors[typed.theme] || '';
        return {
          type: 'success' as const,
          message: `Theme changed to ${typed.theme}!`,
        };
      },
    },

    {
      command: 'book appointment',
      description: 'Book an appointment for a specific date',
      parameters: [
        {
          name: 'service',
          description: 'Type of service needed',
          required: true,
          type: 'string' as const,
        },
        {
          name: 'date',
          description: 'Preferred appointment date',
          required: true,
          type: 'date' as const,
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { service: string; date: string };

        return {
          type: 'success' as const,
          message: `Appointment booked!\n\nService: ${
            typed.service
          }\nDate: ${new Date(typed.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
        };
      },
    },

    {
      command: 'schedule meeting',
      description: 'Schedule a meeting with a team member',
      parameters: [
        {
          name: 'member',
          description: 'Team member to meet with',
          required: true,
          type: 'select' as const,
          getOptions: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
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
          type: 'date' as const,
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { member: string; date: string };

        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          type: 'success' as const,
          message: `Meeting scheduled with ${typed.member} on ${new Date(
            typed.date
          ).toLocaleDateString()}`,
        };
      },
    },

    {
      command: 'delete all records',
      description: 'Permanently delete all user records',
      critical: true,
      action: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          type: 'success' as const,
          message:
            'All records have been deleted. This action cannot be undone.',
        };
      },
    },

    {
      command: 'upload file',
      description: 'Pick a file and return it to the action (demo)',
      parameters: [
        {
          name: 'attachment',
          description: 'Select a file',
          required: true,
          type: 'file' as const,
          accept: ['image/*', 'audio/*', 'video/*'],
          multiple: false,
          delivery: 'file' as const,
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { attachment?: File };
        const v = typed?.attachment as File | undefined;
        if (!v) {
          return { type: 'error' as const, message: 'No file provided.' };
        }

        return {
          type: 'success' as const,
          message: `File received.\n\nName: ${v.name}\nType: ${
            v.type || 'unknown'
          }\nSize: ${v.size} bytes`,
        };
      },
    },

    {
      command: 'update profile',
      description: 'Update your user profile',
      parameters: [
        {
          name: 'displayName',
          description: 'Your display name',
          required: false,
          type: 'string' as const,
        },
        {
          name: 'bio',
          description: 'Short bio',
          required: false,
          type: 'string' as const,
        },
        {
          name: 'role',
          description: 'Your role',
          required: false,
          type: 'select' as const,
          options: [
            { label: 'Developer', value: 'dev' },
            { label: 'Designer', value: 'design' },
            { label: 'Manager', value: 'manager' },
          ],
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as {
          displayName?: string;
          bio?: string;
          role?: string;
        };

        const updates = Object.entries(typed)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        return updates
          ? `Profile updated: ${updates}`
          : 'No changes made to profile.';
      },
    },

    {
      command: 'dev assistant',
      description: 'Get help with Foisit development questions and code issues',
      parameters: [
        {
          name: 'question',
          description: 'Your question about Foisit or code issue',
          required: true,
          type: 'string' as const,
        },
        {
          name: 'code',
          description: 'Optional code snippet to analyze',
          required: false,
          type: 'string' as const,
        },
      ],
      action: async (params?: Record<string, unknown>) => {
        const typed = params as { question: string; code?: string };

        try {
          const response = await callDevAssistant(
            typed.code || '',
            typed.question
          );
          return response;
        } catch (error) {
          return {
            type: 'error' as const,
            message: `Dev assistant error: ${error}`,
          };
        }
      },
    },
  ],
};

function ShowcaseContent() {
  const assistant = useAssistant();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>

      <div className="showcase-container">
        <header className="hero-section">
          <span className="hero-badge">React Wrapper</span>
          <h1 className="hero-title">Build Conversational UIs in Minutes</h1>
          <p className="hero-subtitle">
            Transform your React apps with natural language commands.
            Intelligent slot filling, async data loading, and beautiful UI—all
            out of the box.
          </p>
          <div className="hero-actions">
            <button className="demo-btn" onClick={() => assistant.toggle()}>
              Try Demo
            </button>
            <a
              href="https://www.npmjs.com/package/@foisit/react-wrapper"
              target="_blank"
              rel="noopener noreferrer"
              className="demo-btn secondary"
            >
              View on NPM
            </a>
          </div>
        </header>

        {/* Why Foisit */}
        <section className="glass-card">
          <h2 className="section-title">Why Foisit?</h2>
          <div className="feature-grid">
            <div className="feature-item">
              <h3>Natural Language</h3>
              <p>
                Users speak naturally. Foisit understands intent and extracts
                parameters automatically.
              </p>
            </div>
            <div className="feature-item">
              <h3>Smart Forms</h3>
              <p>
                Missing data? Auto-generated forms collect what you need with
                zero config.
              </p>
            </div>
            <div className="feature-item">
              <h3>Async Ready</h3>
              <p>
                Load dropdown options from APIs. Handle async actions with
                built-in loading states.
              </p>
            </div>
            <div className="feature-item">
              <h3>File Uploads</h3>
              <p>
                Accept files with type restrictions, size limits, and base64 or
                File delivery.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="glass-card">
          <h2 className="section-title">Get Started in 3 Steps</h2>
          <p>
            <strong>1.</strong> Install the package
          </p>
          <div className="code-block">
            <div className="code-header">
              <span>Terminal</span>
            </div>
            <pre>npm install @foisit/react-wrapper</pre>
          </div>

          <p style={{ marginTop: '20px' }}>
            <strong>2.</strong> Wrap your app
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
            <strong>3.</strong> Double-tap anywhere to open the assistant
          </p>
        </section>

        {/* Interactive Examples */}
        <section className="glass-card">
          <h2 className="section-title">Interactive Examples</h2>
          <p>
            Try these commands live—double-tap or click the floating button:
          </p>

          <div className="example-section">
            <h3>Basic Command</h3>
            <p>Simple action, no parameters needed.</p>
            <div className="code-block">
              <pre>{`{ command: 'help', action: () => 'Available: create user, book appointment...' }`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>Multi-Parameter Form</h3>
            <p>Collects multiple inputs with validation.</p>
            <div className="code-block">
              <pre>{`{
  command: 'create user',
  parameters: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: true }
  ],
  action: async (params) => {
    if (params.age < 18) return { type: 'error', message: 'Must be 18+' };
    return \`User \${params.name} created!\`;
  }
}`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>Select Dropdown</h3>
            <p>Static options for quick selection.</p>
            <div className="code-block">
              <pre>{`{
  command: 'change theme',
  parameters: [{
    name: 'theme',
    type: 'select',
    options: [
      { label: 'Blue Ocean', value: 'blue' },
      { label: 'Forest Green', value: 'green' }
    ]
  }]
}`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>Async Options</h3>
            <p>Load dropdown data from APIs dynamically.</p>
            <div className="code-block">
              <pre>{`{
  command: 'schedule meeting',
  parameters: [{
    name: 'member',
    type: 'select',
    getOptions: async () => {
      const members = await api.getTeamMembers();
      return members.map(m => ({ label: m.name, value: m.id }));
    }
  }]
}`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>Date Picker</h3>
            <p>Native date selection for scheduling.</p>
            <div className="code-block">
              <pre>{`{
  command: 'book appointment',
  parameters: [
    { name: 'service', type: 'string', required: true },
    { name: 'date', type: 'date', required: true }
  ]
}`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>Critical Action</h3>
            <p>Requires confirmation before executing.</p>
            <div className="code-block">
              <pre>{`{
  command: 'delete all records',
  critical: true,
  action: async () => {
    await database.deleteAll();
    return 'All records deleted.';
  }
}`}</pre>
            </div>
          </div>

          <div className="example-section">
            <h3>File Upload</h3>
            <p>Accept files with type and size restrictions.</p>
            <div className="code-block">
              <pre>{`{
  command: 'upload file',
  parameters: [{
    name: 'attachment',
    type: 'file',
    accept: ['image/*', 'audio/*'],
    delivery: 'file' // or 'base64'
  }],
  action: (params) => \`Received \${params.attachment.name}\`
}`}</pre>
            </div>
          </div>
        </section>

        {/* Parameter Types */}
        <section className="glass-card">
          <h2 className="section-title">Parameter Types</h2>
          <div className="code-block">
            <pre>{`// Text input
{ name: 'username', type: 'string', required: true }

// Numeric input
{ name: 'age', type: 'number', required: true }

// Date picker
{ name: 'date', type: 'date', required: true }

// Dropdown (static)
{ name: 'role', type: 'select', options: [{ label: 'Admin', value: 'admin' }] }

// Dropdown (async)
{ name: 'user', type: 'select', getOptions: async () => await fetchUsers() }

// File upload
{ name: 'file', type: 'file', accept: ['image/*'], delivery: 'file' }`}</pre>
          </div>
        </section>

        {/* Try It */}
        <section className="glass-card">
          <h2 className="section-title">Try It Now</h2>
          <p>Test the assistant with programmatic controls:</p>
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button className="demo-btn" onClick={() => assistant.toggle()}>
              Open Assistant
            </button>
          </div>
        </section>

        {/* Hook API */}
        <section className="glass-card">
          <h2 className="section-title">React Hook API</h2>
          <p>Control the assistant programmatically:</p>
          <div className="code-block">
            <pre>{`import { useAssistant } from '@foisit/react-wrapper';

function MyComponent() {
  const assistant = useAssistant();

  return <button onClick={() => assistant.toggle()}>Open Assistant</button>;
}`}</pre>
          </div>
        </section>

        {/* Features */}
        <section className="glass-card">
          <h2 className="section-title">Everything You Need</h2>
          <ul
            style={{ margin: '10px 0', paddingLeft: '20px', lineHeight: 1.8 }}
          >
            <li>Natural language command matching</li>
            <li>Automatic parameter collection</li>
            <li>Multiple input types (string, number, date, select, file)</li>
            <li>Async dropdown options from APIs</li>
            <li>Critical action confirmations</li>
            <li>Full TypeScript support</li>
            <li>Dark mode built-in</li>
          </ul>
        </section>
      </div>
    </>
  );
}

export function App() {
  return (
    <AssistantProvider config={config}>
      <ShowcaseContent />
    </AssistantProvider>
  );
}

export default App;
