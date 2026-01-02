import { addGradientAnimation, removeGradientAnimation } from "./utils";

type AssistantState = 'idle' | 'listening' | 'processing';

export class StateManager {
  private state: AssistantState = 'idle';
  // eslint-disable-next-line no-unused-vars
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
      addGradientAnimation();
    } else {
      removeGradientAnimation();
    }
  }

  // eslint-disable-next-line no-unused-vars
  subscribe(callback: (state: AssistantState) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}
