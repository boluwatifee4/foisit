# @foisit/vue-wrapper

Power your Vue apps with an AI-driven text assistant.

> [!NOTE]
> 🎙️ **Coming Soon**: Voice recognition and responses are planned for a future release. Current support is focused on text-based interactions and AI intent matching.

---

## 🚀 Installation

```bash
npm install @foisit/vue-wrapper
```

---

## 🔧 Basic Setup

Wrap your application (or a specific layout) in the `AssistantProvider` to enable the assistant.

```vue
<script setup lang="ts">
import { AssistantProvider } from '@foisit/vue-wrapper';

const config = {
  introMessage: 'Hi! How can I help?',
  enableSmartIntent: true,
  commands: [
    {
      command: 'home',
      action: () => router.push('/'),
    },
  ],
};
</script>

<template>
  <AssistantProvider :config="config">
    <RouterView />
  </AssistantProvider>
</template>
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
      action: () => api.deletePost(),
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

## 🛠️ Composable Usage: `useAssistant`

Interact with the assistant instance from any component within the provider.

```vue
<script setup lang="ts">
import { useAssistant } from '@foisit/vue-wrapper';

const assistant = useAssistant();

const addTempCommand = () => {
  assistant.addCommand('clear', () => clearAll());
};
</script>

<template>
  <button @click="addTempCommand">Add Command</button>
</template>
```

---

## 👋 Gesture Activation

Once integrated, a subtle **"Powered by Foisit"** watermark appears. **Double-click** it to open the chat overlay.
