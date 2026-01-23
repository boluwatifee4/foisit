# @foisit/vue-wrapper

[![npm version](https://img.shields.io/npm/v/@foisit/vue-wrapper.svg)](https://www.npmjs.com/package/@foisit/vue-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The AI-Powered Conversational Assistant for Vue Applications**

Transform your Vue app into an intelligent, voice-ready platform. Foisit provides a drop-in AI layer that understands natural language, manages multi-step workflows, and executes actions—all with zero backend required.

> [!NOTE] > **Voice Support Status**: Voice recognition and responses are currently in development and will be released in a future update. The current version focuses on high-performance text-based interactions and AI intent matching.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [TypeScript Support](#typescript-support)
- [Best Practices](#best-practices)

---

## Features

- **Natural Language Understanding** - AI-powered intent matching (proxied securely)
- **Smart Slot Filling** - Auto-generates forms for missing parameters
- **Critical Action Protection** - Built-in confirmation dialogs for dangerous operations
- **Programmatic UI Triggers** - Direct command execution via `runCommand()`
- **Rich Markdown Rendering** - Enhanced response formatting with headings, code, and links
- **Advanced File Validations** - Comprehensive client-side file validation with size, type, and dimension checks
- **Premium UI** - Glassmorphic overlay with dark/light mode support
- **Zero Backend Required** - Secure proxy architecture keeps API keys server-side
- **Vue Native** - Uses Composition API, `provide/inject`, and Vue 3 patterns
- **Type-Safe** - Full TypeScript support with comprehensive types
- **Responsive** - Works flawlessly on desktop and mobile

---

## Installation

```bash
npm install @foisit/vue-wrapper
```

### Peer Dependencies

```json
{
  "vue": "^3.3.0"
}
```

---

## Quick Start

### Step 1: Wrap Your App

```vue
<script setup lang="ts">
import { AssistantProvider } from '@foisit/vue-wrapper';

const config = {
  introMessage: 'Welcome! How can I assist you today?',
  enableSmartIntent: true,
  commands: [
    {
      command: 'navigate to profile',
      action: () => {
        window.location.href = '/profile';
        return 'Navigating to profile...';
      },
    },
  ],
};
</script>

<template>
  <AssistantProvider :config="config">
    <YourApp />
  </AssistantProvider>
</template>
```

### Step 2: Use the Service

```vue
<script setup lang="ts">
import { inject } from 'vue';
import type { AssistantService } from '@foisit/vue-wrapper';

const assistant = inject<AssistantService>('assistantService');

const openAssistant = () => {
  assistant?.toggle();
};
</script>

<template>
  <button @click="openAssistant">Open Assistant</button>
</template>
```

---

## Core Concepts

### 1. Commands

Commands are the building blocks of your assistant. Each command represents an action users can trigger through natural language.

```javascript
{
  command: 'delete account',
  description: 'Permanently delete user account',
  action: () => accountService.delete()
}
```

### 2. Parameters (Slot Filling)

Define parameters and Foisit will automatically generate forms to collect them:

```javascript
{
  command: 'create user',
  description: 'Create a new user account',
  parameters: [
    { name: 'username', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: false }
  ],
  action: (params) => userService.create(params)
}
```

**Enterprise-safe param collection controls**

- `collectRequiredViaForm` (default: true): when true, any missing/invalid required params are collected via a form (no conversational guessing).
- `allowAiParamExtraction` (default: true): when false, AI-extracted params are ignored and the assistant always asks the user for required fields.

Example:

```javascript
{
  command: 'secure create user',
  description: 'No AI guessing, form-only',
  collectRequiredViaForm: true,
  allowAiParamExtraction: false,
  parameters: [
    { name: 'fullName', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: true, min: 18 },
  ],
  action: (params) => userService.create(params),
}
```

**Supported Parameter Types:**

- `string` - Text input
- `number` - Numeric input
- `date` - Date picker
- `select` - Dropdown (static or async options)
- `file` - File upload input

### 3. File Parameters

Collect files via the built-in form UI and receive them in your command `action`.

```javascript
{
  command: 'upload file',
  description: 'Pick a file and return it to the action',
  parameters: [
    {
      name: 'attachment',
      type: 'file',
      required: true,
      accept: ['image/*', 'audio/*', 'video/*'],
      multiple: false,
      // delivery: 'file' | 'base64' (default: 'file')
      delivery: 'file',
    },
  ],
  action: async (params) => {
    const file = params?.attachment;
    if (!file) return { type: 'error', message: 'No file provided.' };
    return {
      type: 'success',
      message: `File received. Name: ${file.name}, Type: ${file.type || 'unknown'}, Size: ${file.size} bytes`,
    };
  },
}
```

`FileParameter` supports advanced validations:

- `maxFiles`: Maximum number of files allowed (default: 1 for single, 10 for multiple)
- `maxSizeBytes`: Maximum size per file in bytes
- `maxTotalBytes`: Maximum total size for all files combined
- `maxDurationSec`: Maximum duration for media files (audio/video) in seconds
- `maxWidth` / `maxHeight`: Maximum dimensions for images in pixels
- `accept`: Allowed MIME types or file extensions (e.g., `['image/*', '.pdf']`)
- `multiple`: Allow selecting multiple files
- `capture`: Hint for mobile devices (`'camera'` or `'microphone'`)
- `delivery`: How files are delivered to your action (`'file'` or `'base64'`)

Files are validated client-side before submission, with clear error messages for violations.

### 4. Rich Markdown Rendering

Assistant responses support rich markdown formatting for enhanced readability:

- **Headings**: `# H1` through `###### H6`
- **Text Formatting**: `**bold**`, `*italic*`, `~~strikethrough~~`
- **Code**: Inline `code` and code blocks with syntax highlighting
- **Links**: `[text](url)` with safe external linking
- **Lists**: Ordered and unordered lists
- **Line breaks** and paragraphs

Markdown is automatically rendered in AI responses, while user messages remain plain text.

### 5. Critical Actions

Protect dangerous operations with automatic confirmation dialogs:

```javascript
{
  command: 'delete all data',
  critical: true, // Requires confirmation
  description: 'Permanently delete all application data',
  action: async () => {
    await dataService.deleteAll();
    return 'All data deleted successfully.';
  }
}
```

### 6. Select Parameters (Static)

Provide predefined options:

```javascript
{
  command: 'set theme',
  parameters: [{
    name: 'theme',
    type: 'select',
    options: [
      { label: 'Light Mode', value: 'light' },
      { label: 'Dark Mode', value: 'dark' },
      { label: 'Auto', value: 'auto' }
    ]
  }],
  action: (params) => setTheme(params.theme)
}
```

### 7. Dynamic Select Parameters

Load options from APIs:

```javascript
{
  command: 'assign to user',
  parameters: [{
    name: 'userId',
    type: 'select',
    getOptions: async () => {
      const users = await userService.getAll();
      return users.map(u => ({
        label: `${u.name} (${u.email})`,
        value: u.id
      }));
    }
  }],
  action: (params) => taskService.assign(params.userId)
}
```

---

## API Reference

### `AssistantService` (via `inject`)

Injectable service for programmatic control:

#### Methods

##### `toggle(onSubmit?, onClose?)`

Opens or closes the assistant overlay.

```vue
<script setup>
import { inject } from 'vue';

const assistant = inject('assistantService');

// Basic usage
const open = () => assistant.toggle();

// With callbacks
const openWithCallbacks = () => {
  assistant.toggle(
    (userInput) => console.log('User said:', userInput),
    () => console.log('Assistant closed')
  );
};
</script>
```

##### `addCommand(command, action?)`

Dynamically add or update a command at runtime. Commands registered with `addCommand` apply immediately for the running session; they are stored in memory and are not automatically persisted across page reloads.

```vue
<script setup>
import { inject, onMounted } from 'vue';

const assistant = inject('assistantService');

onMounted(() => {
  // Add a simple command
  assistant.addCommand('refresh data', async () => {
    await dataService.refresh();
    return 'Data refreshed!';
  });

  // Add a command with full config
  assistant.addCommand({
    command: 'export report',
    description: 'Export data as PDF',
    parameters: [
      {
        name: 'format',
        type: 'select',
        options: [
          { label: 'PDF', value: 'pdf' },
          { label: 'Excel', value: 'xlsx' },
        ],
      },
    ],
    action: async (params) => {
      await reportService.export(params.format);
      return `Report exported as ${params.format}`;
    },
  });
});
</script>
```

### Dynamic Updates (Add / Remove / Update commands at runtime) ✅

- Use `addCommand` to add or replace a command for the current runtime.
- Use `removeCommand(commandPhrase)` to unregister a command immediately.
- When adding temporary commands inside components, remove them in `onUnmounted` (or equivalent) to avoid leaving stale commands behind.

Example — register and remove a temporary command:

```vue
import { onMounted, onUnmounted, inject } from 'vue'; const assistant = inject('assistantService'); onMounted(() => { assistant?.addCommand('temp action', () => 'Temporary action'); }); onUnmounted(() => { assistant?.removeCommand('temp action'); });
```

Notes:

- Commands with optional parameters can return a `form` InteractiveResponse to prompt the user when no params are provided.
- Commands are not persisted by default; to persist them, re-register at app startup.

##### `removeCommand(commandPhrase)`

Remove a registered command.

```javascript
assistant.removeCommand('delete account');
```

##### `getCommands()`

Get list of all registered command names.

```javascript
const commands = assistant.getCommands();
console.log('Available commands:', commands);
```

##### `runCommand(options)`

Programmatically trigger a command execution with optional parameters. This allows you to invoke commands directly from your code without user input.

```javascript
// Basic usage - trigger a command by ID
assistant.runCommand({ commandId: 'refresh-data' });

// With parameters
assistant.runCommand({
  commandId: 'create-user',
  params: { name: 'John', email: 'john@example.com' },
});

// Open overlay and show the command invocation
assistant.runCommand({
  commandId: 'export-report',
  params: { format: 'pdf' },
  openOverlay: true,
  showInvocation: true,
});
```

**Options:**

- `commandId` (required): The ID of the command to run
- `params` (optional): Parameters to pass to the command action
- `openOverlay` (optional): Whether to open the assistant overlay (default: false)
- `showInvocation` (optional): Whether to display the command invocation in the chat (default: false)

---

## Configuration Options

### `AssistantConfig`

```typescript
interface AssistantConfig {
  // Activation keyword (optional)
  activationCommand?: string;

  // Welcome message shown when assistant opens
  introMessage?: string;

  // Response for unrecognized inputs
  fallbackResponse?: string;

  // Enable AI-powered natural language understanding
  enableSmartIntent?: boolean;

  // Input field placeholder text
  inputPlaceholder?: string;

  // List of commands
  commands: AssistantCommand[];

  // Floating button configuration
  floatingButton?: {
    visible?: boolean;
    tooltip?: string;
    customHtml?: string;
    position?: { bottom: string; right: string };
  };
}
```

---

## Advanced Usage

### Example 1: Multi-Step Booking System with Reactive State

```vue
<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import type { AssistantService } from '@foisit/vue-wrapper';

const bookings = ref([]);
const assistant = inject<AssistantService>('assistantService');

onMounted(() => {
  assistant?.addCommand({
    command: 'book appointment',
    description: 'Schedule a new appointment',
    parameters: [
      {
        name: 'service',
        type: 'select',
        required: true,
        getOptions: async () => {
          const services = await fetch('/api/services').then((r) => r.json());
          return services.map((s) => ({
            label: s.name,
            value: s.id,
          }));
        },
      },
      { name: 'date', type: 'date', required: true },
      { name: 'notes', type: 'string', required: false },
    ],
    action: async (params) => {
      const booking = await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(params),
      }).then((r) => r.json());

      bookings.value.push(booking);
      return {
        type: 'success',
        message: `Appointment booked for ${params.date}!`,
      };
    },
  });
});
</script>

<template>
  <div>
    <h1>My Bookings: {{ bookings.length }}</h1>
    <button @click="assistant?.toggle()">Book New Appointment</button>
  </div>
</template>
```

### Example 2: E-Commerce with Vue Router

```vue
<script setup lang="ts">
import { inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { AssistantService } from '@foisit/vue-wrapper';

const router = useRouter();
const assistant = inject<AssistantService>('assistantService');

onMounted(() => {
  assistant?.addCommand({
    command: 'search products',
    parameters: [
      { name: 'query', type: 'string', required: true },
      {
        name: 'category',
        type: 'select',
        required: false,
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Books', value: 'books' },
        ],
      },
      { name: 'minPrice', type: 'number', required: false },
    ],
    action: async (params) => {
      const results = await searchProducts(params);
      router.push(`/products?q=${params.query}`);
      return `Found ${results.length} products matching "${params.query}"`;
    },
  });
});
</script>
```

### Example 3: Form Validation with Composables

```vue
<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import type { AssistantService } from '@foisit/vue-wrapper';

const { register } = useAuth();
const user = ref(null);
const assistant = inject<AssistantService>('assistantService');

onMounted(() => {
  assistant?.addCommand({
    command: 'create account',
    parameters: [
      { name: 'email', type: 'string', required: true },
      { name: 'password', type: 'string', required: true },
      { name: 'age', type: 'number', required: true },
    ],
    action: async (params) => {
      // Validation
      if (params.age < 18) {
        return {
          type: 'error',
          message: '❌ You must be 18 or older to create an account.',
        };
      }

      if (!params.email.includes('@')) {
        return {
          type: 'error',
          message: '❌ Please provide a valid email address.',
        };
      }

      // Create account
      try {
        const newUser = await register(params);
        user.value = newUser;
        return {
          type: 'success',
          message: '✅ Account created successfully!',
        };
      } catch (error) {
        return {
          type: 'error',
          message: `❌ Registration failed: ${error.message}`,
        };
      }
    },
  });
});
</script>

<template>
  <div>{{ user ? `Welcome ${user.email}` : 'No user' }}</div>
</template>
```

---

## TypeScript Support

### Full Type Definitions

```typescript
// Type-safe command definition
const myCommand: AssistantCommand = {
  command: 'update settings',
  description: 'Update user preferences',
  parameters: [
    {
      name: 'theme',
      type: 'select',
      required: true,
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
  action: async (params: { theme: string }): Promise<InteractiveResponse> => {
    await settingsService.update(params.theme);
    return {
      type: 'success',
      message: `Theme updated to ${params.theme}`,
    };
  },
};
```

---

## Best Practices

### 1. Use `onMounted` for Commands

Register commands in `onMounted` to ensure the assistant is ready:

```vue
<script setup>
import { inject, onMounted } from 'vue';

const assistant = inject('assistantService');

onMounted(() => {
  assistant?.addCommand('my command', () => 'Done');
});
</script>
```

### 2. Type Safety with TypeScript

Use proper type imports for better IDE support:

```typescript
import type { AssistantService } from '@foisit/vue-wrapper';

const assistant = inject<AssistantService>('assistantService');
```

### 3. Reactive State Updates

Use Vue's reactivity for state changes:

```javascript
action: async () => {
  items.value.push(newItem); // ✅ Reactive update
  return 'Item added';
};
```

### 4. Error Handling

Always handle errors gracefully:

```javascript
action: async (params) => {
  try {
    await apiCall(params);
    return { type: 'success', message: '✅ Success!' };
  } catch (error) {
    return { type: 'error', message: `❌ ${error.message}` };
  }
};
```

---

## Testing

### Unit Testing with Vitest

```typescript
import { mount } from '@vue/test-utils';
import { AssistantProvider } from '@foisit/vue-wrapper';
import App from './App.vue';

test('renders assistant', () => {
  const wrapper = mount(App, {
    global: {
      components: { AssistantProvider },
      provide: {
        assistantConfig: { commands: [] },
      },
    },
  });

  // Test your app with assistant
});
```

---

## Related Packages

- **[@foisit/angular-wrapper](../angular-wrapper)** - Angular integration
- **[@foisit/react-wrapper](../react-wrapper)** - React integration

---

## Troubleshooting

### Assistant service is undefined

Make sure you're using `inject` after the component is mounted and within the `AssistantProvider`.

### Commands not executing

Check browser console for errors. Ensure `action` functions are returning values or promises.

### TypeScript errors

Make sure you're using Vue 3.3+ and have proper type definitions.

---

## License

MIT © [Foisit](https://github.com/boluwatifee4/foisit)

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) first.

---

## Support

- Email: support@foisit.com
- Discord: [Join our community](https://discord.gg/foisit)
- Issues: [GitHub Issues](https://github.com/boluwatifee4/foisit/issues)

---

**Made with ❤️ by the Foisit Team**
