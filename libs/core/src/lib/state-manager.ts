type AssistantState = 'idle' | 'listening' | 'processing';

export class StateManager {
  private state: AssistantState = 'idle';
  private subscribers: Array<(state: AssistantState) => void> = [];

  getState(): AssistantState {
    return this.state;
  }

  setState(state: AssistantState): void {
    this.state = state;
    this.notifySubscribers();

    console.log('State updated:', state);

    // Dynamically update body class based on state
    if (state === 'listening') {
      this.addGradientAnimation();
    } else {
      this.removeGradientAnimation();
    }
  }

  subscribe(callback: (state: AssistantState) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }

  addGradientAnimation(): void {
    // Check if the gradient indicator already exists
    if (document.querySelector('#gradient-indicator')) {
      return; // Avoid duplicate indicators
    }

    // Create a new div element
    const gradientDiv = document.createElement('div');
    gradientDiv.id = 'gradient-indicator';

    // Inject styles dynamically
    this.injectStyles();

    // Add the gradient-indicator class to the div
    gradientDiv.classList.add('gradient-indicator');

    // Append the div to the body
    document.body.appendChild(gradientDiv);
    console.log('Gradient indicator added to the DOM');
  }

  removeGradientAnimation(): void {
    const gradientDiv = document.querySelector('#gradient-indicator');
    if (gradientDiv) {
      gradientDiv.remove();
      console.log('Gradient indicator removed from the DOM');
    }
  }

  private injectStyles(): void {
    // Check if the styles are already injected
    const existingStyle = document.querySelector('#assistant-styles');
    if (existingStyle) {
      console.log('Styles already injected');
      return; // Avoid duplicate injection
    }

    // Create and inject the style element
    const style = document.createElement('style');
    style.id = 'assistant-styles';
    style.innerHTML = `
      /* Rounded shape with gradient animation */
      .gradient-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6ec4, #7873f5, #5e8cff, #6ed0f6);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        animation: amoeba 5s infinite ease-in-out;
        z-index: 9999; /* Ensure it's above all other elements */
      }

      /* Amoeba effect for the borders */
      @keyframes amoeba {
        0% {
          border-radius: 50%;
        }
        25% {
          border-radius: 40% 60% 60% 40%;
        }
        50% {
          border-radius: 60% 40% 40% 60%;
        }
        75% {
          border-radius: 40% 60% 60% 40%;
        }
        100% {
          border-radius: 50%;
        }
      }
    `;
    document.head.appendChild(style);
    console.log('Gradient styles injected');
  }
}
