import { Injectable, Inject } from '@angular/core';
import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
  GestureHandler,
  OverlayManager,
  AssistantCommand,
  AssistantCommandParams,
  InteractiveResponse,
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
  private lastProcessedInput = '';
  private processingLock = false;
  private isActivated = false; // Tracks activation status
  private gestureHandler: GestureHandler;
  private overlayManager: OverlayManager;
  private defaultIntroMessage = 'How can I help you?';

  constructor(@Inject('ASSISTANT_CONFIG') private config: AssistantConfig) {
    // Pass enableSmartIntent (default true) and potential apiKey (if we add it to config later)
    this.commandHandler = new CommandHandler({
      enableSmartIntent: this.config.enableSmartIntent !== false,
      intentEndpoint: this.config.intentEndpoint,
    });
    this.fallbackHandler = new FallbackHandler();

    // Browser-only features are lazily created to remain SSR-safe
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.voiceProcessor = new VoiceProcessor();
      this.textToSpeech = new TextToSpeech();
      this.gestureHandler = new GestureHandler();
      this.overlayManager = new OverlayManager({
        floatingButton: this.config.floatingButton,
        inputPlaceholder: this.config.inputPlaceholder,
        enableGestureActivation: this.config.enableGestureActivation,
      });

      // Let the overlay delegate command execution to our CommandHandler when
      // a programmatic handler isn't registered on the overlay.
      this.overlayManager.setExternalCommandExecutor(async (payload: any) => {
        return this.commandHandler.executeCommand(payload);
      });

      // Register global callbacks for floating button when overlay exists
      this.overlayManager.registerCallbacks(
        async (input) => {
          if (typeof input === 'string') {
            this.overlayManager.addMessage(input, 'user');
          } else if (input && typeof input === 'object') {
            const label = this.extractUserLabel(input as Record<string, unknown>);
            if (label) {
              this.overlayManager.addMessage(label, 'user');
            }
          }

          await this.handleCommand(input);
        },
        () => console.log('AssistantService: Overlay closed.')
      );

      this.stateManager = new StateManager();
    } else {
      // Server environment: keep browser-specific properties null
      this.stateManager = undefined as any;
      this.voiceProcessor = undefined as any;
      this.textToSpeech = undefined as any;
      this.gestureHandler = undefined as any;
      this.overlayManager = undefined as any;
    }

    // Setup commands from config
    this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd));

    // Setup fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }

    // Voice disabled for text-first pivot
    // this.startListening();

    // (moved into the browser-only block)
  }

  /** Start listening for activation and commands */
  startListening(): void {
    // No-op on server or when voice features are unavailable
    if (typeof window === 'undefined' || !this.voiceProcessor) {
      console.log('AssistantService: Voice is disabled or unavailable; startListening() is a no-op.');
      return;
    }

    /*
    this.voiceProcessor.startListening(async (transcript: string) => {
      if (this.processingLock) return;

      const normalizedTranscript = transcript.toLowerCase().trim();

      // Skip repeated or irrelevant inputs
      if (
        !normalizedTranscript ||
        normalizedTranscript.length < 3 ||
        normalizedTranscript === this.lastProcessedInput
      ) {
        console.log('AssistantService: Ignoring irrelevant input.');
        return;
      }

      this.lastProcessedInput = normalizedTranscript;

      if (!this.isActivated) {
        await this.processActivation(normalizedTranscript);
        return;
      }

      const isFallbackOrIntroMessage =
        normalizedTranscript === this.config.fallbackResponse?.toLowerCase() ||
        normalizedTranscript === this.config.introMessage?.toLowerCase() ||
        normalizedTranscript === this.defaultIntroMessage.toLowerCase();

      if (!isFallbackOrIntroMessage) {
        await this.handleCommand(normalizedTranscript);
      } else {
        console.log('AssistantService: Ignoring fallback or intro message.');
      }

      // Throttle input processing to prevent rapid feedback
      this.processingLock = true;
      setTimeout(() => (this.processingLock = false), 1000);
    });
    */
  }

  /** Stop listening for voice input */
  stopListening(): void {
    if (typeof window === 'undefined' || !this.voiceProcessor) {
      console.log('AssistantService: Voice unavailable; stopListening() is a no-op.');
      this.isActivated = false;
      return;
    }
    this.voiceProcessor.stopListening();
    this.isActivated = false;
  }

  /** Reset activation state so the next activation flow can occur. */
  reactivate(): void {
    console.log('AssistantService: Reactivating assistant...');
    this.isActivated = false;
    try {
      this.startListening();
    } catch {
      // no-op
    }
  }

  /** Process activation command */
  private async processActivation(transcript: string): Promise<void> {
    const activationCmd = this.config.activationCommand?.toLowerCase();

    // If no activation command is set, we can't activate via voice
    if (!activationCmd) return;

    if (transcript === activationCmd) {
      console.log('AssistantService: Activation matched.');
      this.isActivated = true;
      this.textToSpeech.speak(
        this.config.introMessage || this.defaultIntroMessage
      );
      // this.stateManager.setState('listening'); // DISABLED - no gradient animation
    } else {
      console.log('AssistantService: Activation command not recognized.');
    }
  }

  /** Handle recognized commands */
  private async handleCommand(
    input: string | Record<string, unknown>
  ): Promise<void> {
    this.overlayManager.showLoading();
    let response: InteractiveResponse;
    try {
      response = await this.commandHandler.executeCommand(input);
    } finally {
      this.overlayManager.hideLoading();
    }

    const originalText = typeof input === 'string' ? input : undefined;
    this.processResponse(response, originalText);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.voiceProcessor?.stopListening();
    this.gestureHandler?.destroy();
    this.overlayManager?.destroy();
  }

  /** Unified response processing */
  private processResponse(
    response: InteractiveResponse,
    originalText?: string
  ): void {
    if (response.type === 'error' && originalText) {
      this.fallbackHandler.handleFallback(originalText);
      this.overlayManager.addMessage(this.fallbackHandler.getFallbackMessage(), 'system');
      return;
    }

    if (response.type === 'form' && response.fields) {
      this.overlayManager.addForm(
        response.message,
        response.fields,
        async (data: Record<string, unknown>) => {
          this.overlayManager.showLoading();
          let nextReponse: InteractiveResponse;
          try {
            nextReponse = await this.commandHandler.executeCommand(data);
          } finally {
            this.overlayManager.hideLoading();
          }
          this.processResponse(nextReponse);
        }
      );
      return;
    }

    if ((response.type === 'ambiguous' || response.type === 'confirm') && response.options) {
      if (response.message) {
        this.overlayManager.addMessage(response.message, 'system');
      }
      this.overlayManager.addOptions(response.options);
      return;
    }

    if (response.message) {
      this.overlayManager.addMessage(response.message, 'system');
    }
  }

  /** Expose programmatic command handler registration to host apps */
  registerCommandHandler(commandId: string, handler: (params?: any) => Promise<any> | any) {
    if (this.overlayManager) this.overlayManager.registerCommandHandler(commandId, handler);
  }

  unregisterCommandHandler(commandId: string) {
    if (this.overlayManager) this.overlayManager.unregisterCommandHandler(commandId);
  }

  /** Programmatically run a registered command (proxies to OverlayManager) */
  async runCommand(options: { commandId: string; params?: any; openOverlay?: boolean; showInvocation?: boolean; }) {
    if (!this.overlayManager) throw new Error('Overlay manager not available.');
    const res = await this.overlayManager.runCommand(options);
    // If the overlay delegated to the CommandHandler, it returns an
    // InteractiveResponse object that we should process to render forms/options.
    if (res && typeof res === 'object' && 'type' in res) {
      // Let the existing response processing pipeline handle rendering.
      this.processResponse(res as any);
    }
    return res;
  }

  /** Add a command dynamically (supports string or rich object) */
  addCommand(
    commandOrObj: string | AssistantCommand,
    action?: (
      params?: AssistantCommandParams
    ) => Promise<string | InteractiveResponse | void> | void
  ): void {
    if (typeof commandOrObj === 'string') {
      console.log(`AssistantService: Adding command "${commandOrObj}".`);
    } else {
      console.log(
        `AssistantService: Adding rich command "${commandOrObj.command}".`
      );
    }
    this.commandHandler.addCommand(commandOrObj, action);
  }

  /** Remove a command dynamically */
  removeCommand(command: string): void {
    console.log(`AssistantService: Removing command "${command}".`);
    this.commandHandler.removeCommand(command);
  }

  /** Get all registered commands */
  getCommands(): string[] {
    return this.commandHandler.getCommands();
  }

  /** Toggle the assistant overlay */
  toggle(
    onSubmit?: (input: string | Record<string, unknown>) => void,
    onClose?: () => void
  ): void {
    console.log('AssistantService: Toggling overlay...');
    this.overlayManager.toggle(
      async (input) => {
        if (typeof input === 'string') {
          this.overlayManager.addMessage(input, 'user');
        } else if (input && typeof input === 'object') {
          const label = this.extractUserLabel(input);
          if (label) {
            this.overlayManager.addMessage(label, 'user');
          }
        }

        if (onSubmit) onSubmit(input);
        await this.handleCommand(input);
      },
      () => {
        console.log('AssistantService: Overlay closed.');
        if (onClose) onClose();
      }
    );
  }

  private extractUserLabel(payload: Record<string, unknown>): string | null {
    const label = payload['label'];
    if (typeof label === 'string' && label.trim()) {
      return label.trim();
    }

    const commandId = payload['commandId'];
    if (typeof commandId === 'string' && commandId.trim()) {
      return commandId.trim();
    }

    return null;
  }
}
