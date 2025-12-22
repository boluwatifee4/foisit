# 🎙️ Foisit: AI-Powered Voice & UI Assistant

<img src="https://github.com/user-attachments/assets/1075d88b-6ed5-42ce-b1ce-8c2dcddedb7e" alt="Foisit Logo" width="300" />

**Foisit** is an AI-powered assistant for web applications that combines voice recognition, natural language processing, and a modern UI overlay. It allows users to control your app via voice or text, with built-in safety for critical actions.

---

## 🌟 Key Features

- **🧠 Smart Intent (AI)**: Understands natural language using GPT-4o mini (via a secure proxy). No client-side API keys required.
- **🛡️ Critical Actions**: Built-in confirmation flow for sensitive operations (e.g., "Delete Account").
- **💬 Modern UI Overlay**: A sleek, text-first chat interface with loading states and interactive options.
- **👋 Gesture Activation**: Trigger the assistant via a floating "Powered by Foisit" watermark (double-click/tap).
- **🌐 Framework Agnostic Core**: A shared engine powers the logic across Angular, React, and Vue.
- **🚀 Zero Config AI**: Enable AI features with a single toggle.

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
