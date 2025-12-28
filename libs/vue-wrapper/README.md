# @foisit/vue-wrapper

[![npm version](https://img.shields.io/npm/v/@foisit/vue-wrapper.svg)](https://www.npmjs.com/package/@foisit/vue-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The AI-Powered Conversational Assistant for Vue Applications**

Transform your Vue app into an intelligent, voice-ready platform. Foisit provides a drop-in AI layer that understands natural language, manages multi-step workflows, and executes actions—all with zero backend required.

> [!NOTE]
> 🎙️ **Voice Support Status**: Voice recognition and responses are currently in development and will be released in a future update. The current version focuses on high-performance text-based interactions and AI intent matching.

---

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
- [API Reference](#-api-reference)
- [Advanced Usage](#-advanced-usage)
- [Examples](#-examples)
- [TypeScript Support](#-typescript-support)
- [Best Practices](#-best-practices)

---

## ✨ Features

- **🧠 Natural Language Understanding** - AI-powered intent matching using GPT-4o mini (proxied securely)
- **📝 Smart Slot Filling** - Auto-generates forms for missing parameters
- **⚠️ Critical Action Protection** - Built-in confirmation dialogs for dangerous operations
- **🎨 Premium UI** - Glassmorphic overlay with dark/light mode support
- **🔒 Zero Backend Required** - Secure proxy architecture keeps API keys server-side
- **⚡ Vue Native** - Uses Composition API, `provide/inject`, and Vue 3 patterns
- **🎯 Type-Safe** - Full TypeScript support with comprehensive types
- **📱 Responsive** - Works flawlessly on desktop and mobile

---

## 🚀 Installation

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

## 🏁 Quick Start

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

## 🎯 Core Concepts

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

**Supported Parameter Types:**

- `string` - Text input
- `number` - Numeric input
- `date` - Date picker
- `select` - Dropdown (static or async options)

### 3. Critical Actions

Protect dangerous operations with automatic confirmation dialogs:

```javascript
{
  command: 'delete all data',
  critical: true, // 🔒 Requires confirmation
  description: 'Permanently delete all application data',
  action: async () => {
    await dataService.deleteAll();
    return '✅ All data deleted successfully.';
  }
}
```

### 4. Select Parameters (Static)

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

### 5. Dynamic Select Parameters

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

## 📘 API Reference

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

Dynamically add a command at runtime.

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

---

## 🔧 Configuration Options

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

## 🎨 Advanced Usage

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
        message: `✅ Appointment booked for ${params.date}!`,
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

## 📝 TypeScript Support

### Full Type Definitions

```typescript
import type { AssistantCommand, InteractiveResponse } from '@foisit/core';

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

## 🎯 Best Practices

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

## 🧪 Testing

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

## 🔗 Related Packages

- **[@foisit/core](../core)** - Core engine (auto-installed)
- **[@foisit/angular-wrapper](../angular-wrapper)** - Angular integration
- **[@foisit/react-wrapper](../react-wrapper)** - React integration

---

## 🐛 Troubleshooting

### Assistant service is undefined

Make sure you're using `inject` after the component is mounted and within the `AssistantProvider`.

### Commands not executing

Check browser console for errors. Ensure `action` functions are returning values or promises.

### TypeScript errors

Make sure you're using Vue 3.3+ and have proper type definitions.

---

## 📄 License

MIT © [Foisit](https://github.com/boluwatifee4/foisit)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) first.

---

## 📬 Support

- 📧 Email: support@foisit.com
- 💬 Discord: [Join our community](https://discord.gg/foisit)
- 🐛 Issues: [GitHub Issues](https://github.com/boluwatifee4/foisit/issues)

---

**Made with ❤️ by the Foisit Team**
