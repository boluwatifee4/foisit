# 🎙️ Foisit: AI-Powered Voice & UI Assistant

<img src="https://github.com/user-attachments/assets/1075d88b-6ed5-42ce-b1ce-8c2dcddedb7e" alt="Foisit Logo" width="300" />

**Foisit** is an AI-powered assistant for web applications that combines natural language processing with a modern UI overlay.

> [!NOTE]
> 🎙️ **Voice Support Status**: Voice recognition and responses are currently in development and will be released in a future update. The current version focuses on high-performance text-based interactions and AI intent matching.

---

## ✅ Currently Supported

- **💬 Text-First Assistant**: A sleek, interactive chat overlay for all user queries.
- **🧠 Smart Intent (AI)**: Natural language understanding via GPT-4o mini (securely proxied).
- **🛡️ Critical Actions**: Automated confirmation flow for safe execution of sensitive commands.
- **🎯 Deterministic Matching**: Ultra-fast exact matching for predefined commands.
- **👋 Gesture Activation**: Trigger the overlay via a floating watermark (double-click/tap).
- **⚛️ Framework Wrappers**: Full support for Angular, React, and Vue.

---

## 📦 Framework Wrappers

Install the wrapper specifically for your framework. The core engine is included automatically.

| Package                                             | Framework | Installation                          |
| :-------------------------------------------------- | :-------- | :------------------------------------ |
| [`@foisit/angular-wrapper`](./libs/angular-wrapper) | Angular   | `npm install @foisit/angular-wrapper` |
| [`@foisit/react-wrapper`](./libs/react-wrapper)     | React     | `npm install @foisit/react-wrapper`   |
| [`@foisit/vue-wrapper`](./libs/vue-wrapper)         | Vue       | `npm install @foisit/vue-wrapper`     |

---

## 🚀 Quick Start (React Example)

```tsx
import { AssistantProvider } from '@foisit/react-wrapper';

const config = {
  enableSmartIntent: true,
  introMessage: 'How can I help you today?',
  commands: [
    {
      command: 'dark mode',
      action: () => setDarkMode(true),
      keywords: ['lights out', 'night'],
    },
    {
      command: 'delete order',
      critical: true,
      description: 'delete your last order',
      action: () => deleteOrder(),
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
```

---

## 🛡️ Critical Action Confirmation

Foisit automatically handles confirmation for commands marked as `critical: true`.

**User:** "Delete my order"  
**Assistant:** "Are you sure you want to delete your last order?"  
**Buttons:** [Yes] [No]

---

## 🛠️ Development (Nx Monorepo)

```bash
# Serve Angular Demo
npx nx serve foisit-ng

# Serve React Demo
npx nx serve foisit-react

# Serve Vue Demo
npx nx serve foisit-vue
```

---

## 📄 License

Licensed under the **MIT License**.
