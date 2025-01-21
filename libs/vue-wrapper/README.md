# 🎙️ Foisit Vue Wrapper: Speak, and it’s Done.

The **Foisit Vue Wrapper** brings voice interactivity to your Vue apps with the power of the **Foisit Assistant**. From recognizing voice commands to responding with actions, this is your all-in-one assistant for Vue! 🧙‍♂️✨

## 🌟 Features

- 🧩 **Dynamic Commands**: Add or remove commands on the fly.
- 🎨 **Visual Feedback**: Show visual cues when the assistant is active.
- 🚀 **Effortless Integration**: Integrate the assistant with just a few lines of code.
- 🗣️ **Voice Feedback**: The assistant can respond with voice feedback.
- 🔄 **Double Activation**: Activate or put the assistant to sleep with a double-click.

### 🌐 **Live Demo**

🎉 [Test the Vue Assistant here!](https://foisit-vue-demo.netlify.app/)

---

## 🚀 Installation

Get started by installing the library:

```bash
npm install @foisit/vue-wrapper
```

or

```bash
yarn add @foisit/vue-wrapper
```

---

## 🔧 Setup

Here’s how you can integrate the Foisit Assistant into your Vue app.

### Step 1: Wrap Your App in the `AssistantProvider`

The `AssistantProvider` must be used as a wrapper to provide the assistant context.

#### `App.vue`

```vue
<script setup lang="ts">
import { AssistantProvider } from '@foisit/vue-wrapper';

const config = {
  activationCommand: 'John',
  fallbackResponse: 'Sorry, I didn’t understand that.',
  commands: [
    { command: 'show profile', action: () => console.log('Showing profile...') },
    { command: 'log out', action: () => console.log('Logging out...') },
  ],
};
</script>

<template>
  <AssistantProvider :config="config">
    <Content />
  </AssistantProvider>
</template>
```

---

### Step 2: Add Commands and Interact with the Assistant

Use the `useAssistant` composable **inside** components wrapped by the `AssistantProvider`. Define and use commands dynamically.

#### `Content.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAssistant } from '@foisit/vue-wrapper';

const assistant = useAssistant(); // This will now work because it's inside the provider
const color = ref('transparent');

// Add commands dynamically
assistant.addCommand('background red', () => {
  color.value = 'red';
});

assistant.addCommand('remove background', () => {
  color.value = 'transparent';
});

assistant.addCommand('sleep', () => {
  assistant.stopListening();
});

// Start listening immediately
assistant.startListening();
</script>

<template>
  <div :style="{ backgroundColor: color, padding: '20px' }" class="content-container">
    <h1>🧙‍♂️ Vue Assistant Demo</h1>
    <p>Say the magic words to see the assistant in action:</p>
    <ul>
      <li>🟥 Say <strong>"background red"</strong> to make the background red.</li>
      <li>🔄 Say <strong>"remove background"</strong> to reset the background.</li>
      <li>😴 Say <strong>"sleep"</strong> to put the assistant to rest.</li>
    </ul>
    <p>
      🎨 Current Background: <strong>{{ color }}</strong>
    </p>
  </div>
</template>

<style scoped>
.content-container {
  text-align: center;
  margin: 0 auto;
  max-width: 500px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

---

### Step 3: Run the App 🏃

Start your Vue app and watch the magic happen! ✨

```bash
npm run dev
```

or

```bash
yarn dev
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

### 🔑 Composable Methods

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
