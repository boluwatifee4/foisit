# @foisit/angular-wrapper

Power your Angular apps with an AI-driven text assistant.

> [!NOTE]
> 🎙️ **Coming Soon**: Voice recognition and responses are planned for a future release. Current support is focused on text-based interactions and AI intent matching.

---

## 🚀 Installation

```bash
npm install @foisit/angular-wrapper
```

---

## 🔧 Basic Setup

### 1. Import `AssistantModule`

Add `AssistantModule.forRoot()` to your `app.config.ts` (for Standalone) or `app.module.ts`.

#### `app.config.ts` (Standalone)

```typescript
import { AssistantModule } from '@foisit/angular-wrapper';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      AssistantModule.forRoot({
        enableSmartIntent: true,
        introMessage: 'Welcome! How can I help?',
        commands: [
          {
            command: 'profile',
            action: () => router.navigate(['/profile']),
          },
        ],
      })
    ),
  ],
};
```

---

## 🛡️ Critical Actions

Commands marked as `critical` will automatically trigger a confirmation flow in the UI.

```typescript
const config = {
  commands: [
    {
      command: 'delete post',
      critical: true,
      description: 'permanently delete this post',
      action: () => this.postService.delete(),
    },
  ],
};
```

---

## 🧠 AI Intent Matching

Enable `enableSmartIntent: true` to allow the assistant to understand natural language.

**User says:** _"Go to my profile"_  
**Matched Command:** `{ command: 'profile', keywords: ['account', 'user settings'], ... }`

---

## 🛠️ Service Usage: `AssistantService`

Interact with the assistant dynamically from your components.

```typescript
import { AssistantService } from '@foisit/angular-wrapper';

@Component({...})
export class MyComponent {
  constructor(private assistant: AssistantService) {}

  addCommand() {
    this.assistant.addCommand('clear', () => this.clearAll());
  }
}
```

---

## 👋 Gesture Activation

Once integrated, a subtle **"Powered by Foisit"** watermark appears. **Double-click** it to open the chat overlay.
