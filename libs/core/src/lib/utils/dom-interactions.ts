export class GestureHandler {
  private lastTap = 0 as number;
  private tapCount = 0;
  private tapTimeout?: number;
  private dblClickListener?: () => void;
  private touchEndListener?: () => void;
  private clickListener?: () => void;

  /**
   * Sets up triple-click and triple-tap listeners
   * @param onTripleClickOrTap Callback to execute when a triple-click or triple-tap is detected
   */
  setupTripleTapListener(onTripleClickOrTap: () => void): void {
    // Ensure we never stack multiple listeners for the same instance
    this.destroy();

    // Handle triple-click (desktop) - implement manually since no built-in triple-click event
    this.clickListener = () => {
      this.tapCount++;
      if (this.tapCount === 1) {
        // Start timeout for first click
        this.tapTimeout = window.setTimeout(() => {
          this.tapCount = 0;
        }, 500); // Reset after 500ms
      } else if (this.tapCount === 3) {
        // Triple click detected
        clearTimeout(this.tapTimeout);
        this.tapCount = 0;
        onTripleClickOrTap();
      }
    };
    document.addEventListener('click', this.clickListener);

    // Handle triple-tap (mobile)
    this.touchEndListener = () => {
      const currentTime = new Date().getTime();
      const tapInterval = currentTime - this.lastTap;

      if (tapInterval < 500 && tapInterval > 0) {
        this.tapCount++;
        if (this.tapCount === 3) {
          this.tapCount = 0;
          onTripleClickOrTap();
        }
      } else {
        this.tapCount = 1;
      }
      this.lastTap = currentTime;
    };
    document.addEventListener('touchend', this.touchEndListener);
  }

  destroy(): void {
    if (this.dblClickListener) {
      document.removeEventListener('dblclick', this.dblClickListener);
    }
    if (this.touchEndListener) {
      document.removeEventListener('touchend', this.touchEndListener);
    }
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
    }
    this.dblClickListener = undefined;
    this.touchEndListener = undefined;
    this.clickListener = undefined;
    this.tapTimeout = undefined;
    this.tapCount = 0;
  }
}


export function injectStyles(): void {
  // Check if the styles are already injected
  const existingStyle: HTMLStyleElement | null = document.querySelector('#assistant-styles');
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

export function addGradientAnimation(): void {
  // Check if the gradient indicator already exists
  if (document.querySelector('#gradient-indicator')) {
    return; // Avoid duplicate indicators
  }

  // Create a new div element
  const gradientDiv = document.createElement('div');
  gradientDiv.id = 'gradient-indicator';

  // Inject styles dynamically
  injectStyles();

  // Add the gradient-indicator class to the div
  gradientDiv.classList.add('gradient-indicator');

  // Append the div to the body
  document.body.appendChild(gradientDiv);
  console.log('Gradient indicator added to the DOM');
}

export function removeGradientAnimation(): void {
  const gradientDiv = document.querySelector('#gradient-indicator');
  if (gradientDiv) {
    gradientDiv.remove();
    console.log('Gradient indicator removed from the DOM');
  }
}

