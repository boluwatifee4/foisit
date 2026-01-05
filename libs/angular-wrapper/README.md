# @foisit/angular-wrapper

[![npm version](https://img.shields.io/npm/v/@foisit/angular-wrapper.svg)](https://www.npmjs.com/package/@foisit/angular-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The AI-Powered Conversational Assistant for Angular Applications**

Transform your Angular app into an intelligent, voice-ready platform. Foisit provides a drop-in AI layer that understands natural language, manages multi-step workflows, and executes actions—all with zero backend required.

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

- **Natural Language Understanding** - AI-powered intent matching using GPT-4o mini (proxied securely)
- **Smart Slot Filling** - Auto-generates forms for missing parameters
- **Critical Action Protection** - Built-in confirmation dialogs for dangerous operations
- **Premium UI** - Glassmorphic overlay with dark/light mode support
- **Zero Backend Required** - Secure proxy architecture keeps API keys server-side
- **Angular Native** - Uses Dependency Injection, Signals, and RxJS
- **Type-Safe** - Full TypeScript support with comprehensive types
- **Responsive** - Works flawlessly on desktop and mobile

---

## Installation

```bash
npm install @foisit/angular-wrapper
```

### Peer Dependencies

```json
{
  "@angular/core": "^17.0.0 || ^18.0.0",
  "@angular/common": "^17.0.0 || ^18.0.0"
}
```

---

## Quick Start

### Step 1: Import the Module

#### For Standalone Apps (Recommended)

```typescript
// app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { AssistantModule } from '@foisit/angular-wrapper';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      AssistantModule.forRoot({
        introMessage: 'Welcome! How can I assist you today?',
        enableSmartIntent: true,
        commands: [
          {
            command: 'navigate to profile',
            action: () => console.log('Navigating to profile...'),
          },
        ],
      })
    ),
  ],
};
```

#### For Module-Based Apps

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { AssistantModule } from '@foisit/angular-wrapper';

@NgModule({
  imports: [
    AssistantModule.forRoot({
      introMessage: 'Welcome! How can I assist you today?',
      commands: [
        /* your commands */
      ],
    }),
  ],
})
export class AppModule {}
```

### Step 2: Use the Service

```typescript
// my-component.ts
import { Component } from '@angular/core';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  selector: 'app-my-component',
  template: ` <button (click)="openAssistant()">Open Assistant</button> `,
})
export class MyComponent {
  constructor(private assistant: AssistantService) {}

  openAssistant() {
    this.assistant.toggle();
  }
}
```

---

## Core Concepts

### 1. Commands

Commands are the building blocks of your assistant. Each command represents an action users can trigger through natural language.

```typescript
{
  command: 'delete account',
  description: 'Permanently delete user account',
  action: () => this.accountService.delete()
}
```

### 2. Parameters (Slot Filling)

Define parameters and Foisit will automatically generate forms to collect them:

```typescript
{
  command: 'create user',
  description: 'Create a new user account',
  parameters: [
    { name: 'username', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'age', type: 'number', required: false }
  ],
  action: (params) => this.userService.create(params)
}
```

**Enterprise-safe param collection controls**

- `collectRequiredViaForm` (default: true): when enabled, any missing/invalid required params are collected via a form—no conversational guessing.
- `allowAiParamExtraction` (default: true): when false, AI-extracted params are ignored; the assistant will always prompt the user for required fields.

Example:

```typescript
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
  action: (params) => this.userService.create(params),
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

```typescript
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

`FileParameter` supports validations like `maxFiles`, `maxSizeBytes`, `maxTotalBytes`, and media/image constraints like `maxDurationSec`, `maxWidth`, and `maxHeight`.

### 4. Critical Actions

Protect dangerous operations with automatic confirmation dialogs:

```typescript
{
  command: 'delete all data',
  critical: true, // Requires confirmation
  description: 'Permanently delete all application data',
  action: async () => {
    await this.dataService.deleteAll();
    return 'All data deleted successfully.';
  }
}
```

### 5. Select Parameters (Static)

Provide predefined options:

```typescript
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
  action: (params) => this.themeService.set(params.theme)
}
```

### 6. Dynamic Select Parameters

Load options from APIs:

```typescript
{
  command: 'assign to user',
  parameters: [{
    name: 'userId',
    type: 'select',
    getOptions: async () => {
      const users = await this.userService.getAll();
      return users.map(u => ({
        label: `${u.name} (${u.email})`,
        value: u.id
      }));
    }
  }],
  action: (params) => this.taskService.assign(params.userId)
}
```

---

## API Reference

### `AssistantService`

Injectable service for programmatic control:

#### Methods

##### `toggle(onSubmit?, onClose?)`

Opens or closes the assistant overlay.

```typescript
// Basic usage
this.assistant.toggle();

// With callbacks
this.assistant.toggle(
  (userInput) => console.log('User said:', userInput),
  () => console.log('Assistant closed')
);
```

##### `addCommand(command, action?)`

Dynamically add or update a command at runtime. Commands added via `addCommand` take effect immediately in the running application; they are stored in memory for the current session (they are not persisted after a page reload unless you re-register them during app startup).

```typescript
// Add a simple command
this.assistant.addCommand('refresh data', () => {
  this.dataService.refresh();
  return 'Data refreshed!';
});

// Add a command with full config
this.assistant.addCommand({
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
    await this.reportService.export(params.format);
    return `Report exported as ${params.format}`;
  },
});
```

### Dynamic Updates (Add / Remove / Update commands at runtime) ✅

- Use `addCommand` to register a new command or to replace an existing command's behavior (remove first if you want a clean replacement).
- Use `removeCommand(commandPhrase)` to unregister a command. This is useful for temporary or context-specific commands.
- Commands are in-memory only; to persist them across reloads, re-register on app startup (e.g., in an initialization hook).

Example — register a temporary command and clean it up in `ngOnDestroy`:

```typescript
// component.ts
import { OnDestroy } from '@angular/core';

export class MyComponent implements OnDestroy {
  constructor(private assistant: AssistantService) {
    this.assistant.addCommand('temp action', () => 'Temporary action executed');
  }

  ngOnDestroy() {
    // Remove the temporary command when component unmounts
    this.assistant.removeCommand('temp action');
  }
}
```

Notes:

- If a command has only optional params, consider returning a `form` InteractiveResponse to prompt the user when no params are provided.
- Always remove transient commands in your cleanup lifecycle to avoid leaks and confusing UX.

##### `removeCommand(commandPhrase)`

Remove a registered command.

```typescript
this.assistant.removeCommand('delete account');
```

##### `getCommands()`

Get list of all registered command names.

```typescript
const commands = this.assistant.getCommands();
console.log('Available commands:', commands);
```

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

### Example 1: Multi-Step Booking System

```typescript
import { Component } from '@angular/core';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  selector: 'app-booking',
  template: `<button (click)="setupBooking()">Enable Booking</button>`,
})
export class BookingComponent {
  constructor(private assistant: AssistantService, private bookingService: BookingService) {}

  setupBooking() {
    this.assistant.addCommand({
      command: 'book appointment',
      description: 'Schedule a new appointment',
      parameters: [
        {
          name: 'service',
          description: 'Type of service',
          type: 'select',
          required: true,
          getOptions: async () => {
            const services = await this.bookingService.getServices();
            return services.map((s) => ({
              label: s.name,
              value: s.id,
            }));
          },
        },
        {
          name: 'date',
          description: 'Preferred date',
          type: 'date',
          required: true,
        },
        {
          name: 'notes',
          description: 'Additional notes',
          type: 'string',
          required: false,
        },
      ],
      action: async (params) => {
        const booking = await this.bookingService.create(params);
        return {
          type: 'success',
          message: `✅ Appointment booked for ${params.date}!`,
        };
      },
    });
  }
}
```

### Example 2: E-Commerce Product Search

```typescript
this.assistant.addCommand({
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
    {
      name: 'minPrice',
      type: 'number',
      required: false,
    },
  ],
  action: async (params) => {
    const results = await this.productService.search(params);
    this.router.navigate(['/products'], {
      queryParams: { q: params.query },
    });
    return `Found ${results.length} products matching "${params.query}"`;
  },
});
```

### Example 3: Form Validation with Error Handling

```typescript
this.assistant.addCommand({
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
      await this.authService.register(params);
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
    await this.settingsService.update(params.theme);
    return {
      type: 'success',
      message: `Theme updated to ${params.theme}`,
    };
  },
};
```

---

## Best Practices

### 1. Command Naming

✅ **Good:**

- "create user"
- "delete account"
- "export report"

❌ **Avoid:**

- "CreateUser" (not natural)
- "usr_del" (not descriptive)
- "do the thing" (too vague)

### 2. Descriptions

Always provide clear descriptions for AI matching:

```typescript
{
  command: 'reset password',
  description: 'Reset the user password and send recovery email',
  // AI can match: "forgot my password", "can't log in", etc.
}
```

### 3. Error Handling

Return user-friendly error messages:

```typescript
action: async (params) => {
  try {
    await this.api.call(params);
    return { type: 'success', message: '✅ Done!' };
  } catch (error) {
    return {
      type: 'error',
      message: `❌ Something went wrong: ${error.message}`,
    };
  }
};
```

### 4. Use Signals for Reactive State

```typescript
import { signal } from '@angular/core';

export class MyComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor(private assistant: AssistantService) {
    this.assistant.addCommand('toggle theme', () => {
      const newTheme = this.theme() === 'light' ? 'dark' : 'light';
      this.theme.set(newTheme);
      return `Theme switched to ${newTheme}`;
    });
  }
}
```

---

## Testing

### Unit Testing Commands

```typescript
import { TestBed } from '@angular/core/testing';
import { AssistantService } from '@foisit/angular-wrapper';

describe('AssistantService', () => {
  let service: AssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssistantModule.forRoot({ commands: [] })],
    });
    service = TestBed.inject(AssistantService);
  });

  it('should add and execute command', () => {
    let executed = false;
    service.addCommand('test', () => {
      executed = true;
    });

    // Trigger command execution
    service.toggle();
    // Test execution...

    expect(executed).toBe(true);
  });
});
```

---

## Related Packages

- **[@foisit/react-wrapper](../react-wrapper)** - React integration
- **[@foisit/vue-wrapper](../vue-wrapper)** - Vue integration

---

## Troubleshooting

### Assistant not appearing

Ensure `AssistantModule.forRoot()` is imported in your app configuration and double-tap the floating button.

### Commands not executing

Check browser console for errors. Ensure `action` functions are returning values or promises.

### TypeScript errors

Make sure you're using Angular 17+ and have `@angular/core` installed.

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

**Made by the Foisit Team**
