# @foisit/react-wrapper

Power your React apps with an AI-driven voice and text assistant.

---

## 🚀 Installation

```bash
npm install @foisit/react-wrapper
```

---

## 🔧 Basic Setup

Wrap your application in the `AssistantProvider` to enable the assistant.

```tsx
import { AssistantProvider } from '@foisit/react-wrapper';

const config = {
  introMessage: 'Hi! How can I help?',
  enableSmartIntent: true,
  commands: [
    {
      command: 'home',
      action: () => navigate('/'),
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

## 🛡️ Critical Actions

Commands marked as `critical` will automatically trigger a confirmation flow in the UI.

```tsx
const config = {
  commands: [
    {
      command: 'delete order',
      critical: true,
      description: 'cancel and delete your current order',
      action: () => api.deleteOrder(),
    },
  ],
};
```

---

## 🧠 AI Intent Matching

Enable `enableSmartIntent: true` to allow the assistant to understand natural language.

**User says:** _"Make it dark"_  
**Matched Command:** `{ command: 'dark mode', keywords: ['lights out', 'dark', 'night'], ... }`

---

## 🛠️ Hook Usage: `useAssistant`

Interact with the assistant instance from any component.

```tsx
import { useAssistant } from '@foisit/react-wrapper';

function MyComponent() {
  const assistant = useAssistant();

  const addTempCommand = () => {
    assistant.addCommand('surprise me', () => alert('Surprise!'));
  };

  return <button onClick={addTempCommand}>Add Command</button>;
}
```

---

## 👋 Gesture Activation

Once integrated, a subtle **"Powered by Foisit"** watermark appears. **Double-click** it to open the chat overlay.
