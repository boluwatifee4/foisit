import { Injectable, Inject } from '@angular/core';
import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
} from '@foisit/core';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;
  private idleTimeoutId: any;
  private isActivated = false; // Tracks activation status

  constructor(@Inject('ASSISTANT_CONFIG') private config: AssistantConfig) {
    this.commandHandler = new CommandHandler();
    this.fallbackHandler = new FallbackHandler();
    this.voiceProcessor = new VoiceProcessor();
    this.textToSpeech = new TextToSpeech();
    this.stateManager = new StateManager();

    // Setup commands from config
    this.config.commands.forEach((cmd) =>
      this.commandHandler.addCommand(cmd.command, cmd.action)
    );

    // Setup fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }

    // Setup reactivation listeners
    this.setupReactivationListeners();
  }

  /** Start listening for activation commands */
  startListening(): void {
    console.log('Assistant is now listening for activation...');
    this.stateManager.setState('listening'); // Update state to listening
    this.stateManager.removeGradientAnimation();

    this.voiceProcessor.startListening((transcript: string) => {
      const normalizedTranscript = transcript.toLowerCase();

      if (!this.isActivated && normalizedTranscript === this.config.activationCommand.toLowerCase()) {
        console.log('Activation command matched.');
        this.isActivated = true; // Mark as activated
        this.textToSpeech.speak(this.config.introMessage || 'How can I assist you?');
      } else if (!this.isActivated) {
        console.log('Activation command not recognized.');
      }
      if (this.isActivated) {
        this.listenForCommands(normalizedTranscript);
      }
    });

    this.startIdleTimeout(); // Automatically transition to idle after timeout
  }

  /** Listen for commands after activation */
  private listenForCommands(normalizedTranscript: string): void {
    console.log('Assistant is now in command mode...');
    // this.voiceProcessor.startListening((transcript: string) => {
    //   const normalizedTranscript = transcript.toLowerCase();
    console.log('Processing command:', normalizedTranscript);
    this.stateManager.addGradientAnimation();

    if (normalizedTranscript !== this.config.activationCommand.toLowerCase()) {
      // Attempt to execute the command
      const commandExecuted = this.commandHandler.executeCommand(normalizedTranscript);

      if (!commandExecuted) {
        console.log('Command not recognized. Triggering fallback...');
        this.handleFallback(normalizedTranscript);
      } else {
        console.log(`Command "${normalizedTranscript}" executed successfully.`);
      }
    }
    // });
  }

  /** Stop listening and go idle */
  stopListening(): void {
    console.log('Assistant is now idle.');
    this.isActivated = false; // Reset activation status
    this.voiceProcessor.stopListening();
    this.stateManager.setState('idle'); // Transition to idle state
    this.stateManager.removeGradientAnimation();
  }


  /** Handle fallback responses */
  private handleFallback(input: string): void {
    this.fallbackHandler.handleFallback(input);
    console.log('Fallback response provided.');
  }

  /** Reactivate the assistant manually */
  reactivate(): void {
    console.log('Assistant reactivated.');
    this.clearIdleTimeout();
    this.startListening();
  }

  /** Setup reactivation listeners */
  private setupReactivationListeners(): void {
    const reactivationHandler = () => {
      if (this.stateManager.getState() === 'idle') {
        this.reactivate();
      }
    };

    document.addEventListener('dblclick', reactivationHandler);

    let lastTap = 0;
    document.addEventListener('touchend', (event) => {
      const currentTime = new Date().getTime();
      const tapInterval = currentTime - lastTap;
      if (tapInterval < 300 && tapInterval > 0) {
        reactivationHandler();
      }
      lastTap = currentTime;
    });
  }

  private startIdleTimeout(): void {
    this.clearIdleTimeout();
    this.idleTimeoutId = setTimeout(() => {
      this.goIdle();
    }, 2 * 60 * 1000); // 2 minutes
  }

  private clearIdleTimeout(): void {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }

  private goIdle(): void {
    console.log('Assistant is now idle.');
    this.stopListening();
  }

  /** Add commands dynamically */
  addCommand(command: string, action: () => void): void {
    this.commandHandler.addCommand(command, action);
  }

  /** Remove commands dynamically */
  removeCommand(command: string): void {
    this.commandHandler.removeCommand(command);
  }
}

