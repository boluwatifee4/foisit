# @foisit/react-wrapper

[![npm version](https://img.shields.io/npm/v/@foisit/react-wrapper.svg)](https://www.npmjs.com/package/@foisit/react-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The AI-Powered Conversational Assistant for React Applications**

Transform your React app into an intelligent, voice-ready platform. Foisit provides a drop-in AI layer that understands natural language, manages multi-step workflows, and executes actions—all with zero backend required.

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
- **React Native** - Uses Hooks, Context API, and modern React patterns
- **Type-Safe** - Full TypeScript support with comprehensive types
- **Responsive** - Works flawlessly on desktop and mobile

---

## Installation

```bash
npm install @foisit/react-wrapper
```

### Peer Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

---

## Quick Start

### Step 1: Wrap Your App

```tsx
import React from 'react';
import { AssistantProvider } from '@foisit/react-wrapper';

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

function App() {
  return (
    <AssistantProvider config={config}>
      <YourApp />
    </AssistantProvider>
  );
}

export default App;
```

### Step 2: Use the Hook

```tsx
import React from 'react';
import { useAssistant } from '@foisit/react-wrapper';

function MyComponent() {
  const assistant = useAssistant();

  return <button onClick={() => assistant.toggle()}>Open Assistant</button>;
}
```

---

## Core Concepts

### 1. Commands

Commands are the building blocks of your assistant. Each command represents an action users can trigger through natural language.

```tsx
{
  command: 'delete account',
  description: 'Permanently delete user account',
  action: () => accountService.delete()
}
```

### 2. Parameters (Slot Filling)

Define parameters and Foisit will automatically generate forms to collect them:

```tsx
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

- `collectRequiredViaForm` (default: true): force missing/invalid required params to be collected via a form instead of conversational guessing.
- `allowAiParamExtraction` (default: true): when false, ignore AI-extracted params and always prompt the user for required fields.

Example:

```tsx
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

```tsx
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
    const file = params?.attachment as File | undefined;
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

```tsx
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

```tsx
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

```tsx
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

### `useAssistant()` Hook

React hook for programmatic control:

#### Methods

##### `toggle(onSubmit?, onClose?)`

Opens or closes the assistant overlay.

```tsx
const assistant = useAssistant();

// Basic usage
assistant.toggle();

// With callbacks
assistant.toggle(
  (userInput) => console.log('User said:', userInput),
  () => console.log('Assistant closed')
);
```

##### `addCommand(command, action?)`

Dynamically add or update a command at runtime. Commands added via `addCommand` take effect immediately; they are stored in memory for the current session. Re-register commands on app initialization if you need them after a full page reload.

```tsx
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
```

### Dynamic Updates (Add / Remove / Update commands at runtime) ✅

- `addCommand` registers or can replace commands for the current session.
- `removeCommand(commandPhrase)` removes a registered command immediately.
- For one-off commands created inside components, unregister them in a cleanup effect (React's `useEffect` cleanup) to avoid leaking commands.

Example — add/remove a temporary command:

```tsx
useEffect(() => {
  assistant.addCommand('temp action', () => 'Temp action');
  return () => assistant.removeCommand('temp action');
}, [assistant]);
```

Notes:

- If a command has optional params and is invoked with no params, you may return a `form` InteractiveResponse to prompt for the values.
- Commands are not persisted across reloads by default; store and re-register them if needed.

##### `removeCommand(commandPhrase)`

Remove a registered command.

```tsx
assistant.removeCommand('delete account');
```

##### `getCommands()`

Get list of all registered command names.

```tsx
const commands = assistant.getCommands();
console.log('Available commands:', commands);
```

##### `runCommand(options)`

Programmatically trigger a command execution with optional parameters. This allows you to invoke commands directly from your code without user input.

```tsx
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

### Example 1: Multi-Step Booking System with State

```tsx
import React, { useState } from 'react';
import { useAssistant, AssistantProvider } from '@foisit/react-wrapper';

function BookingApp() {
  const [bookings, setBookings] = useState([]);
  const assistant = useAssistant();

  React.useEffect(() => {
    assistant.addCommand({
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
        {
          name: 'date',
          type: 'date',
          required: true,
        },
        {
          name: 'notes',
          type: 'string',
          required: false,
        },
      ],
      action: async (params) => {
        const booking = await fetch('/api/bookings', {
          method: 'POST',
          body: JSON.stringify(params),
        }).then((r) => r.json());

        setBookings((prev) => [...prev, booking]);
        return {
          type: 'success',
          message: `✅ Appointment booked for ${params.date}!`,
        };
      },
    });
  }, [assistant]);

  return (
    <div>
      <h1>My Bookings: {bookings.length}</h1>
      <button onClick={() => assistant.toggle()}>Book New Appointment</button>
    </div>
  );
}
```

### Example 2: E-Commerce with React Router

```tsx
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '@foisit/react-wrapper';

function ProductSearch() {
  const navigate = useNavigate();
  const assistant = useAssistant();

  React.useEffect(() => {
    assistant.addCommand({
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
        navigate(`/products?q=${params.query}`);
        return `Found ${results.length} products matching "${params.query}"`;
      },
    });
  }, [assistant, navigate]);

  return <div>Search component</div>;
}
```

### Example 3: Form Validation with State Management

```tsx
import { useState } from 'react';
import { useAssistant } from '@foisit/react-wrapper';

function AccountManager() {
  const [user, setUser] = useState(null);
  const assistant = useAssistant();

  React.useEffect(() => {
    assistant.addCommand({
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
          const newUser = await authService.register(params);
          setUser(newUser);
          return {
            type: 'success',
            message: '✅ Account created successfully! You can now log in.',
          };
        } catch (error) {
          return {
            type: 'error',
            message: `❌ Registration failed: ${error.message}`,
          };
        }
      },
    });
  }, [assistant]);

  return <div>{user ? `Welcome ${user.email}` : 'No user'}</div>;
}
```

---

## TypeScript Support

### Full Type Definitions

```tsx
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

### Hook Types

```tsx
import { useAssistant } from '@foisit/react-wrapper';

const assistant = useAssistant();
// assistant is typed as AssistantServiceType
```

---

## Best Practices

### 1. Cleanup Effects

Always clean up commands when components unmount:

```tsx
useEffect(() => {
  assistant.addCommand('temp command', () => 'Done');

  return () => {
    assistant.removeCommand('temp command');
  };
}, [assistant]);
```

### 2. Dependency Management

Include all dependencies in `useEffect`:

```tsx
useEffect(() => {
  assistant.addCommand('navigate', () => {
    navigate('/page'); // Uses navigate from React Router
  });
}, [assistant, navigate]); // ✅ Include navigate
```

### 3. State Updates

Use functional updates for state changes:

```tsx
action: async () => {
  setItems((prev) => [...prev, newItem]); // ✅ Functional update
  return 'Item added';
};
```

### 4. Error Boundaries

Wrap your app with error boundaries:

```tsx
<ErrorBoundary>
  <AssistantProvider config={config}>
    <App />
  </AssistantProvider>
</ErrorBoundary>
```

---

## Testing

### Unit Testing with React Testing Library

```tsx
import { render, screen } from '@testing-library/react';
import { AssistantProvider } from '@foisit/react-wrapper';

test('renders assistant', () => {
  render(
    <AssistantProvider config={{ commands: [] }}>
      <App />
    </AssistantProvider>
  );

  // Test your app with assistant
});
```

---

## Related Packages

- **[@foisit/angular-wrapper](../angular-wrapper)** - Angular integration
- **[@foisit/vue-wrapper](../vue-wrapper)** - Vue integration

---

## Troubleshooting

### Hook error: "useAssistant must be used within AssistantProvider"

Make sure your component is wrapped with `<AssistantProvider>`.

### Commands not executing

Check browser console for errors. Ensure `action` functions are returning values or promises.

### TypeScript errors

Make sure you're using React 18+ and have proper type definitions.

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
