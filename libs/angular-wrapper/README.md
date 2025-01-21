# 🎙️ Foisit Angular Wrapper: Speak, and it’s Done.

The **Foisit Angular Wrapper** brings voice interactivity to your Angular apps with the power of the **Foisit Assistant**. Imagine saying "background red" and watching your app come alive—now that's ✨magic✨!

### **Why Foisit Angular Wrapper?**

- 🧩 **Dynamic Commands**: Add or remove commands on the fly.
- 🎨 **Visual Feedback**: Show visual cues when the assistant is active.
- 🚀 **Effortless Integration**: Set up voice commands in minutes with minimal code.
- 🗣️ **Voice Feedback**: Interactive voice responses make the assistant engaging.
- 🔄 **Double Activation**: Activate or put the assistant to sleep with a double-tap.

### 🌐 **Live Demo**

🎉 [Test the Angular Assistant here!](https://ng-foisit-demo.netlify.app/)

---

## 🚀 Installation

Get started by installing the library:

```bash
npm install @foisit/angular-wrapper
```

or

```bash
yarn add @foisit/angular-wrapper
```

---

## 🔧 Setup

Here's how you can integrate the Foisit Assistant into your Angular app in just a few steps:

### Step 1: Import the `AssistantModule`

#### Using `forRoot` in `app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AssistantModule } from '@foisit/angular-wrapper';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AssistantModule.forRoot({
      activationCommand: 'John',
      fallbackResponse: 'Sorry, I didn’t understand that.',
      commands: [
        { command: 'show profile', action: () => console.log('Showing profile...') },
        { command: 'log out', action: () => console.log('Logging out...') },
      ],
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

#### Or Using `app.config.ts` (Latest Versions)

```typescript
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { AssistantModule } from '@foisit/angular-wrapper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    importProvidersFrom(
      AssistantModule.forRoot({
        activationCommand: 'John',
        fallbackResponse: 'Sorry, I didn’t understand that.',
        commands: [
          { command: 'show profile', action: () => console.log('Showing profile...') },
          { command: 'log out', action: () => console.log('Logging out...') },
        ],
      })
    ),
  ],
};
```

---

### Step 2: Interact with the Service 🗣️

Define and remove voice commands and inject the `AssistantService` into your components, start the party by calling `startListening()`.

#### `app.component.ts`

```typescript
import { Component, signal } from '@angular/core';
import { AssistantService } from '@foisit/angular-wrapper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Angular Assistant Demo';
  color = signal('transparent'); // Reactive color signal

  constructor(private assistantService: AssistantService) {
    // Define voice commands
    this.assistantService.addCommand('background red', () => {
      this.color.set('red');
    });

    this.assistantService.addCommand('remove background', () => {
      this.color.set('transparent');
    });

    this.assistantService.addCommand('sleep', () => {
      this.assistantService.stopListening();
    });

    // Start listening immediately
    this.assistantService.startListening();
  }
}
```

---

### Step 3: Craft the UI 🎨

Create a clean UI to showcase your assistant's magic.

#### `app.component.html`

```html
<div
  class="content-container"
  [ngStyle]="{
    'background-color': color(),
    'padding': '20px'
  }"
>
  <h1>🧙‍♂️ Angular Assistant Demo</h1>
  <p>Say the magic words to see the assistant in action:</p>
  <ul>
    <li>🟥 Say <strong>"background red"</strong> to make the background red.</li>
    <li>🔄 Say <strong>"remove background"</strong> to reset the background.</li>
    <li>😴 Say <strong>"sleep"</strong> to put the assistant to rest.</li>
  </ul>
  <p>🎨 Current Background: <strong>{{ color() }}</strong></p>
</div>
```

---

### Step 4: Run the App 🏃

Start your Angular app and watch the magic happen! ✨

```bash
ng serve
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

### 🔑 Service Methods

| Method           | Description                             |
| ---------------- | --------------------------------------- |
| `addCommand`     | Dynamically add a new command.          |
| `removeCommand`  | Remove an existing command dynamically. |
| `startListening` | Start listening for voice commands.     |
| `stopListening`  | Stop listening for voice commands.      |

---

## 🌟 Features

- 🧩 **Dynamic Commands**: Add or remove commands on the fly.
- 🎨 **Visual Feedback**: Show visual cues when the assistant is active.
- 🚀 **Easy Integration**: Integrate the assistant with just a few lines of code.
- 🗣️ **Voice Feedback**: The assistant can respond with voice feedback.
- 🔄 **Double Activation**: The assistant can be activated with a double-click and also put to sleep with a double-click when active.

---

## 🤝 Contributing

Want to make the assistant even better? PRs are welcomed! 🙌

---

## 📄 License

This library is licensed under the MIT License.
