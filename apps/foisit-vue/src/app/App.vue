<script setup lang="ts">
import { ref, watch, inject, onMounted } from 'vue';
import { AssistantProvider, AssistantService } from '@foisit/vue-wrapper';

/**
 * COMPREHENSIVE CONFIGURATION
 * This demonstrates 100% of Foisit's capabilities
 */
const assistantConfig = {
  activationCommand: 'hey foisit',
  introMessage: '👋 Welcome to Foisit! I can help you with various tasks. Try saying "help" to see what I can do.',
  fallbackResponse: 'I didn\'t quite understand that. Try saying "help" or "show commands" to see what I can assist with.',
  enableSmartIntent: true,
  inputPlaceholder: 'Type a command or describe what you need...',
  floatingButton: {
    visible: true,
    tooltip: 'Open Foisit Assistant',
    customHtml: '<span style="font-size: 24px;">💚</span>',
    position: { bottom: '30px', right: '30px' },
  },
  commands: [
    // ===== BASIC COMMAND (No parameters) =====
    {
      command: 'help',
      description: 'Show available commands and what I can do',
      action: () => {
        return `I can help you with:
✅ User Management (create user, update profile)
📅 Scheduling (book appointment, schedule meeting)
🗑️ Data Operations (delete records - requires confirmation)
📊 Analytics (view stats)
🎨 UI Actions (change theme)

Just tell me what you'd like to do!`;
      }
    },

    // ===== STRING + NUMBER PARAMETERS =====
    {
      command: 'create user',
      description: 'Create a new user account with name, email, and age',
      parameters: [
        { name: 'name', description: 'Full name of the user', required: true, type: 'string' as const },
        { name: 'email', description: 'Email address', required: true, type: 'string' as const },
        { name: 'age', description: 'User age (must be 18+)', required: true, type: 'number' as const },
      ],
      action: async (params: any) => {
        // Simulate validation
        if (params.age < 18) {
          return {
            type: 'error' as const,
            message: '❌ User must be at least 18 years old.'
          };
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return {
          type: 'success' as const,
          message: `✅ User created successfully!\n\n👤 Name: ${params.name}\n📧 Email: ${params.email}\n🎂 Age: ${params.age}`
        };
      }
    },

    // ===== SELECT PARAMETER (Static options) =====
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
            { label: '🔵 Blue Ocean', value: 'blue' },
            { label: '🟢 Forest Green', value: 'green' },
            { label: '🟣 Purple Haze', value: 'purple' },
            { label: '🔴 Ruby Red', value: 'red' },
          ]
        }
      ],
      action: (params: any) => {
        const themeColors: Record<string, string> = {
          blue: 'rgba(59, 130, 246, 0.1)',
          green: 'rgba(34, 197, 94, 0.1)',
          purple: 'rgba(168, 85, 247, 0.1)',
          red: 'rgba(239, 68, 68, 0.1)',
        };
        document.body.style.backgroundColor = themeColors[params.theme] || '';
        return `🎨 Theme changed to ${params.theme}!`;
      }
    },

    // ===== DATE PARAMETER =====
    {
      command: 'book appointment',
      description: 'Book an appointment for a specific date',
      parameters: [
        { name: 'service', description: 'Type of service needed', required: true, type: 'string' as const },
        { name: 'date', description: 'Preferred appointment date', required: true, type: 'date' as const },
      ],
      action: (params: any) => {
        return `📅 Appointment booked!\n\n🔧 Service: ${params.service}\n📆 Date: ${new Date(params.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      }
    },

    // ===== ASYNC SELECT (Dynamic options from API) =====
    {
      command: 'schedule meeting',
      description: 'Schedule a meeting with a team member',
      parameters: [
        {
          name: 'member',
          description: 'Select a team member',
          required: true,
          type: 'select' as const,
          getOptions: async () => {
            // Simulate API call to get team members
            await new Promise(resolve => setTimeout(resolve, 1000));
            return [
              { label: '👨‍💼 John Doe (Engineering)', value: 'john_123' },
              { label: '👩‍💼 Jane Smith (Design)', value: 'jane_456' },
              { label: '👨‍💼 Mike Johnson (Product)', value: 'mike_789' },
              { label: '👩‍💼 Sarah Williams (Marketing)', value: 'sarah_012' },
            ];
          }
        },
        { name: 'date', description: 'Meeting date', required: true, type: 'date' as const },
        { name: 'duration', description: 'Duration in minutes', required: true, type: 'number' as const },
      ],
      action: async (params: any) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
          type: 'success' as const,
          message: `✅ Meeting scheduled!\n\n👥 With: ${params.member}\n📆 Date: ${new Date(params.date).toLocaleDateString()}\n⏱️ Duration: ${params.duration} minutes`
        };
      }
    },

    // ===== CRITICAL ACTION (Requires confirmation) =====
    {
      command: 'delete all records',
      description: 'Permanently delete all user records from the database',
      critical: true,
      action: async () => {
        // Simulate deletion process
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          type: 'success' as const,
          message: '🗑️ All records have been permanently deleted.\n\n⚠️ This action cannot be undone.'
        };
      }
    },

    // ===== OPTIONAL PARAMETERS =====
    {
      command: 'update profile',
      description: 'Update user profile information (all fields optional)',
      parameters: [
        { name: 'displayName', description: 'Display name', required: false, type: 'string' as const },
        { name: 'bio', description: 'Short biography', required: false, type: 'string' as const },
        { name: 'role', description: 'User role', required: false, type: 'select' as const, options: [
          { label: 'Developer', value: 'dev' },
          { label: 'Designer', value: 'design' },
          { label: 'Manager', value: 'manager' },
        ]},
      ],
      action: (params: any) => {
        const updates: string[] = [];
        if (params.displayName) updates.push(`Name: ${params.displayName}`);
        if (params.bio) updates.push(`Bio: ${params.bio}`);
        if (params.role) updates.push(`Role: ${params.role}`);
        
        return updates.length > 0 
          ? `✅ Profile updated:\n\n${updates.join('\n')}`
          : '⚠️ No fields were updated.';
      }
    },

    // ===== SIMPLE UI ACTIONS =====
    {
      command: 'reset theme',
      action: () => {
        document.body.style.backgroundColor = '';
        return '✨ Theme reset to default.';
      }
    },
    {
      command: 'view stats',
      description: 'View application statistics',
      action: () => {
        return `📊 Application Statistics:\n\n👥 Active Users: 1,234\n📝 Total Commands: 42\n⚡ Uptime: 99.9%\n🚀 Version: 1.0.0`;
      }
    },
  ],
};

const theme = ref<'light' | 'dark'>(
  (localStorage.getItem('foisit-theme') as 'light' | 'dark') || 'light'
);

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('foisit-theme', newTheme);
}, { immediate: true });

// Add theme toggle command dynamically
onMounted(() => {
  const assistant = inject<AssistantService>('assistantService');
  if (assistant) {
    assistant.addCommand('toggle theme', async () => {
      toggleTheme();
      return `🎨 Theme switched to ${theme.value} mode!`;
    });
  }
});
</script>

<template>
  <AssistantProvider :config="assistantConfig">
    <button class="theme-toggle" @click="toggleTheme">
      {{ theme === 'light' ? '🌙' : '☀️' }}
    </button>

    <div class="showcase-container">
      <header class="hero-section">
        <h1 class="hero-title">Foisit Vue</h1>
        <p class="hero-subtitle">
          The most powerful, AI-driven conversational assistant for Vue applications.
          Build natural language interfaces in minutes, not days.
        </p>
      </header>

      <!-- Quick Start Guide -->
      <section class="glass-card">
        <h2 class="section-title">🚀 Quick Start Guide</h2>
        <p><strong>Step 1:</strong> Install the package</p>
        <div class="code-block">
          <div class="code-header">
            <span>Terminal</span>
            <span>NPM</span>
          </div>
          <pre>npm install @foisit/vue-wrapper</pre>
        </div>

        <p style="margin-top: 20px;"><strong>Step 2:</strong> Use the component</p>
        <div class="code-block">
          <div class="code-header">
            <span>App.vue</span>
          </div>
          <pre>&lt;script setup&gt;
import { AssistantProvider } from '@foisit/vue-wrapper';

const config = {
  commands: [
    { 
      command: 'greet',
      action: () => 'Hello, World!' 
    }
  ]
};
&lt;/script&gt;

&lt;template&gt;
  &lt;AssistantProvider :config="config"&gt;
    &lt;YourApp /&gt;
  &lt;/AssistantProvider&gt;
&lt;/template&gt;</pre>
        </div>

        <p style="margin-top: 20px;"><strong>Step 3:</strong> Try it! Double-tap anywhere or click the floating button.</p>
      </section>

      <!-- Core Concepts -->
      <section class="glass-card">
        <h2 class="section-title">📚 Core Concepts</h2>
        <div class="feature-grid">
          <div class="feature-item">
            <h3>🎯 Commands</h3>
            <p>Define actions users can trigger through natural language. Simple commands execute immediately.</p>
          </div>
          <div class="feature-item">
            <h3>📝 Slot Filling</h3>
            <p>Add parameters to commands. Foisit automatically creates forms to collect missing information.</p>
          </div>
          <div class="feature-item">
            <h3>⚠️ Critical Actions</h3>
            <p>Mark destructive actions as critical. Users must confirm before execution.</p>
          </div>
          <div class="feature-item">
            <h3>🔄 Dynamic Options</h3>
            <p>Load options from APIs using getOptions(). Perfect for dropdowns with live data.</p>
          </div>
        </div>
      </section>

      <!-- Live Examples with Code -->
      <section class="glass-card">
        <h2 class="section-title">💡 Live Examples</h2>
        <p>Open the assistant (double-tap or click the 💚 button) and try these commands. Each example shows the code powering it:</p>

        <!-- Example 1: Basic Command -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">1. Basic Command - "help"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            No parameters required. Returns a simple message.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'help',
  description: 'Show available commands',
  action: () => {
    return 'I can help you with: User Management, Scheduling...';
  }
}</pre>
          </div>
        </div>

        <!-- Example 2: String + Number Parameters with Validation -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">2. Multi-Parameter with Validation - "create user"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            Collects string and number inputs, performs validation, simulates API call.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
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
    await simulateAPICall();
    return { 
      type: 'success', 
      message: `User ${params.name} created!` 
    };
  }
}</pre>
          </div>
        </div>

        <!-- Example 3: Select Parameter -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">3. Select Parameter - "change theme"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            Shows a dropdown with predefined options.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'change theme',
  parameters: [{
    name: 'theme',
    type: 'select',
    options: [
      { label: '🔵 Blue Ocean', value: 'blue' },
      { label: '🟢 Forest Green', value: 'green' }
    ]
  }],
  action: (params) => {
    document.body.style.backgroundColor = colors[params.theme];
    return `Theme changed to ${params.theme}!`;
  }
}</pre>
          </div>
        </div>

        <!-- Example 4: Date Parameter -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">4. Date Picker - "book appointment"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            Renders a date picker for user selection.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'book appointment',
  parameters: [
    { name: 'service', type: 'string', required: true },
    { name: 'date', type: 'date', required: true }
  ],
  action: (params) => {
    return `📅 Booked ${params.service} on ${params.date}`;
  }
}</pre>
          </div>
        </div>

        <!-- Example 5: Async Select -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">5. Async/Dynamic Select - "schedule meeting"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            Loads options dynamically from an API or service.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'schedule meeting',
  parameters: [{
    name: 'member',
    type: 'select',
    getOptions: async () => {
      const members = await api.getTeamMembers();
      return members.map(m => ({
        label: `${m.name} (${m.dept})`,
        value: m.id
      }));
    }
  }],
  action: async (params) => {
    return `Meeting scheduled with ${params.member}`;
  }
}</pre>
          </div>
        </div>

        <!-- Example 6: Critical Action -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">6. Critical Action - "delete all records"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            Requires user confirmation before executing dangerous operations.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'delete all records',
  critical: true, // ⚠️ Forces confirmation dialog
  description: 'Permanently delete all data',
  action: async () => {
    await database.deleteAll();
    return {
      type: 'success',
      message: '🗑️ All records deleted. Cannot be undone.'
    };
  }
}</pre>
          </div>
        </div>

        <!-- Example 7: Optional Parameters -->
        <div style="margin-top: 30px;">
          <h3 style="color: var(--accent-color); margin-bottom: 10px;">7. Optional Parameters - "update profile"</h3>
          <p style="font-size: 0.95rem; color: var(--secondary-text); margin-bottom: 15px;">
            All parameters are optional. Users can skip fields they don't want to update.
          </p>
          <div class="code-block">
            <div class="code-header">
              <span>JavaScript</span>
            </div>
            <pre>{
  command: 'update profile',
  parameters: [
    { name: 'displayName', type: 'string', required: false },
    { name: 'bio', type: 'string', required: false },
    { name: 'role', type: 'select', required: false, options: [...] }
  ],
  action: (params) => {
    const updates = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}: ${v}`);
    return `Updated: ${updates.join(', ')}`;
  }
}</pre>
          </div>
        </div>
      </section>

      <!-- Parameter Types Reference -->
      <section class="glass-card">
        <h2 class="section-title">🔧 Parameter Types Reference</h2>
        <div class="code-block">
          <pre>// STRING
{ name: 'username', type: 'string', required: true }

// NUMBER
{ name: 'age', type: 'number', required: true }

// DATE
{ name: 'appointmentDate', type: 'date', required: true }

// SELECT (Static)
{
  name: 'role',
  type: 'select',
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ]
}

// SELECT (Dynamic/Async)
{
  name: 'customer',
  type: 'select',
  getOptions: async () => {
    const res = await fetch('/api/customers');
    return res.json();
  }
}</pre>
        </div>
      </section>

      <!-- Programmatic Control -->
      <section class="glass-card">
        <h2 class="section-title">🎮 Programmatic Control</h2>
        <p>Control the assistant using Vue's Composition API:</p>
        <div class="code-block">
          <pre>&lt;script setup&gt;
import { inject } from 'vue';
import { AssistantService } from '@foisit/vue-wrapper';

const assistant = inject('assistantService');

const openAssistant = () => {
  assistant?.toggle();
};

const addCommand = () => {
  assistant?.addCommand('my command', async () => {
    return 'Command executed!';
  });
};
&lt;/script&gt;</pre>
        </div>
      </section>

      <!-- Features Summary -->
      <section class="glass-card">
        <h2 class="section-title">✨ Feature Checklist</h2>
        <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
          <li>✅ Natural language command matching</li>
          <li>✅ Multi-step slot filling with auto-generated forms</li>
          <li>✅ All parameter types (string, number, date, select)</li>
          <li>✅ Static and async/dynamic select options</li>
          <li>✅ Required and optional parameters</li>
          <li>✅ Critical action confirmations</li>
          <li>✅ Interactive response handling (success/error)</li>
          <li>✅ Floating button trigger</li>
          <li>✅ Double-tap activation</li>
          <li>✅ Programmatic API (toggle, addCommand, removeCommand)</li>
          <li>✅ Dark/Light mode support</li>
          <li>✅ Custom styling and theming</li>
          <li>✅ TypeScript support</li>
          <li>✅ Vue Composition API integration</li>
          <li>✅ Zero backend required</li>
        </ul>
      </section>
    </div>
  </AssistantProvider>
</template>

<style>
@import './showcase.css';
</style>
