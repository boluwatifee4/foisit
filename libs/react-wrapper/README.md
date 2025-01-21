# 🎙️ Foisit React Wrapper: Speak, and it’s Done.

The **Foisit React Wrapper** brings the power of voice interactivity to your React apps with the **Foisit Assistant**. Say "background red," and watch your app transform—your wish is its command! 🪄✨

---

## 🌟 Features

- 🧩 **Dynamic Commands**: Add or remove commands on the fly.
- 🎨 **Visual Feedback**: Show visual cues when the assistant is active.
- 🚀 **Effortless Integration**: Set up voice commands with minimal code.
- 🗣️ **Voice Feedback**: Make your app interactive and engaging with voice responses.
- 🔄 **Double Activation**: Activate or put the assistant to sleep with a double-click.

### 🌐 **Live Demo**

🎉 [Test the React Assistant here!](https://foisit-react-demo.netlify.app/)

---

## 🚀 Installation

Get started by installing the library:

```bash
npm install @foisit/react-wrapper
```

or

```bash
yarn add @foisit/react-wrapper
```

---

## 🔧 Setup

Here’s how you can integrate the Foisit Assistant into your React app.

---

### Step 1: Wrap Your App in the `AssistantProvider`

The `AssistantProvider` must be used to provide the assistant's context.

#### `App.tsx`

```tsx
import React from 'react';
import { AssistantProvider } from '@foisit/react-wrapper';

const config = {
  activationCommand: 'John',
  fallbackResponse: 'Sorry, I didn’t understand that.',
  commands: [
    { command: 'show profile', action: () => console.log('Showing profile...') },
    { command: 'log out', action: () => console.log('Logging out...') },
  ],
};

const App: React.FC = () => (
  <AssistantProvider config={config}>
    <Content />
  </AssistantProvider>
);

export default App;
```

---

### Step 2: Add Commands and Interact with the Assistant

Use the `useAssistant` hook to interact with the assistant **inside** the `AssistantProvider`.

#### `Content.tsx`

```tsx
import React, { useState } from 'react';
import { useAssistant } from '@foisit/react-wrapper';

const Content: React.FC = () => {
  const assistant = useAssistant();
  const [color, setColor] = useState('transparent');

  // Add commands dynamically
  assistant.addCommand('background red', () => setColor('red'));
  assistant.addCommand('remove background', () => setColor('transparent'));
  assistant.addCommand('sleep', () => assistant.stopListening());

  // Start listening immediately
  assistant.startListening();

  return (
    <div
      style={{
        backgroundColor: color,
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textAlign: 'center',
        margin: '0 auto',
        maxWidth: '500px',
      }}
    >
      <h1>🧙‍♂️ React Assistant Demo</h1>
      <p>Say the magic words to see the assistant in action:</p>
      <ul>
        <li>
          🟥 Say <strong>"background red"</strong> to make the background red.
        </li>
        <li>
          🔄 Say <strong>"remove background"</strong> to reset the background.
        </li>
        <li>
          😴 Say <strong>"sleep"</strong> to put the assistant to rest.
        </li>
      </ul>
      <p>
        🎨 Current Background: <strong>{color}</strong>
      </p>
    </div>
  );
};

export default Content;
```

---

### Step 3: Run the App 🏃

Start your React app and watch the magic happen! ✨

```bash
npm start
```

or

```bash
yarn start
```

---

## 🛠️ API Reference

### `AssistantConfig`

Configure your assistant's behavior with this object.

| Property            | Type     | Description                                       |
| ------------------- | -------- | ------------------------------------------------- |
| `activationCommand` | `string` | The keyword to wake the assistant.                |
| `fallbackResponse`  | `string` | The message when a command isn’t recognized.      |
| `commands`          | `Array`  | A list of `{ command: string, action: Function }` |

---

### 🔑 Hook Methods

| Method           | Description                             |
| ---------------- | --------------------------------------- |
| `addCommand`     | Dynamically add a new command.          |
| `removeCommand`  | Remove an existing command dynamically. |
| `startListening` | Start listening for voice commands.     |
| `stopListening`  | Stop listening for voice commands.      |

---

## 🤝 Contributing

Want to make the assistant even better? PRs are welcomed! 🙌

---

## 📄 License

This library is licensed under the MIT License.
