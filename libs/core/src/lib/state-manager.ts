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
  }

  subscribe(callback: (state: AssistantState) => void): void {
    this.subscribers.push(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}
