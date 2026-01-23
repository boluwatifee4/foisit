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
  InteractiveResponse,
} from '@foisit/core';

export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;
  private isActivated = false;
  private lastProcessedInput = '';
  private processingLock = false;
  private gestureHandler: GestureHandler;
  private overlayManager: OverlayManager;
  private defaultIntroMessage = 'How can I help you?';

  constructor(private config: AssistantConfig) {
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
      this.stateManager = new StateManager();
      this.gestureHandler = new GestureHandler();
      this.overlayManager = new OverlayManager({
        floatingButton: this.config.floatingButton,
        inputPlaceholder: this.config.inputPlaceholder,
        enableGestureActivation: this.config.enableGestureActivation,
      });

      // Allow overlay to delegate to commandHandler when needed
      this.overlayManager.setExternalCommandExecutor(async (payload: any) => {
        return this.commandHandler.executeCommand(payload);
      });

      // Add configured commands
      this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd));

      // Set fallback response
      if (this.config.fallbackResponse) {
        this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
      }

      // Register global callbacks for floating button
      this.overlayManager.registerCallbacks(
        async (input: string | Record<string, unknown>) => {
          if (typeof input === 'string') {
            this.overlayManager.addMessage(input, 'user'); // Echo user input
            await this.handleCommand(input);
            return;
          }

          // Structured payloads (e.g., { commandId, params }) - run deterministically
          if (input && typeof input === 'object') {
            const obj = input as Record<string, unknown>;
            const label = (obj['label'] as string) ?? (obj['commandId'] as string) ?? 'Selection';
            this.overlayManager.addMessage(String(label), 'user');
            this.overlayManager.showLoading();
            const response = await this.commandHandler.executeCommand(obj as Record<string, unknown>);
            this.overlayManager.hideLoading();
            this.processResponse(response);
          }
        },
        () => console.log('AssistantService: Overlay closed.')
      );
    } else {
      this.voiceProcessor = undefined as any;
      this.textToSpeech = undefined as any;
      this.stateManager = undefined as any;
      this.gestureHandler = undefined as any;
      this.overlayManager = undefined as any;
      // Register commands (commandHandler still exists) so server-side can introspect commands
      this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd));

      if (this.config.fallbackResponse) {
        this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
      }
    }
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

  /** Stop listening */
  stopListening(): void {
    if (typeof window === 'undefined' || !this.voiceProcessor) {
      console.log('AssistantService: Voice unavailable; stopListening() is a no-op.');
      this.isActivated = false;
      return;
    }
    this.voiceProcessor.stopListening();
    this.isActivated = false;
  }

  /**
   * Reset activation state so the next activation flow can occur.
   * This is mainly used by the wrapper UI (e.g. AssistantActivator).
   */
  reactivate(): void {
    console.log('AssistantService: Reactivating assistant...');
    this.isActivated = false;
    // If voice is enabled, ensure we are listening again.
    // (startListening is idempotent in VoiceProcessor)
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
  private async handleCommand(transcript: string): Promise<void> {
    this.overlayManager.showLoading();
    let response: InteractiveResponse;
    try {
      response = await this.commandHandler.executeCommand(transcript);
    } finally {
      this.overlayManager.hideLoading();
    }

    if (response.type === 'form' && response.fields) {
      this.overlayManager.addForm(
        response.message,
        response.fields,
        async (data) => {
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

    if (response.type === 'error') {
      this.fallbackHandler.handleFallback(transcript);
      this.overlayManager.addMessage(this.fallbackHandler.getFallbackMessage(), 'system');
      return;
    }

    if (
      (response.type === 'ambiguous' || response.type === 'confirm') &&
      response.options
    ) {
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

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.voiceProcessor.stopListening();
    this.gestureHandler.destroy();
    this.overlayManager.destroy();
  }

  /** Unified response processing */
  private processResponse(response: InteractiveResponse | undefined): void {
    if (!response) return;
    if (response.type === 'form' && response.fields) {
      this.overlayManager.addForm(
        response.message,
        response.fields,
        async (data) => {
          this.overlayManager.showLoading();
          let nextReponse: InteractiveResponse;
          try {
            nextReponse = await this.commandHandler.executeCommand(data as Record<string, unknown>);
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

  /** Add a command dynamically (supports string or rich object) */
  addCommand(
    commandOrObj: string | AssistantCommand,
    action?: (
      params?: Record<string, unknown>
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
    if (res && typeof res === 'object' && 'type' in res) {
      this.processResponse(res as any);
    }
    return res;
  }

  /** Get all registered commands */
  getCommands(): string[] {
    return this.commandHandler.getCommands();
  }

  /** Toggle the assistant overlay */
  toggle(onSubmit?: (input: string | Record<string, unknown>) => void, onClose?: () => void): void {
    console.log('AssistantService: Toggling overlay...');
    this.overlayManager.toggle(
      async (input) => {
        if (typeof input === 'string') {
          this.overlayManager.addMessage(input, 'user'); // Echo user input
          if (onSubmit) onSubmit(input);
          await this.handleCommand(input);
          return;
        }

        // Structured payload from overlay (deterministic trigger)
        if (input && typeof input === 'object') {
          const obj = input as Record<string, unknown>;
          const label = (obj['label'] as string) ?? (obj['commandId'] as string) ?? 'Selection';
          this.overlayManager.addMessage(String(label), 'user');
          this.overlayManager.showLoading();
          let response: InteractiveResponse;
          try {
            response = await this.commandHandler.executeCommand(obj as Record<string, unknown>);
          } finally {
            this.overlayManager.hideLoading();
          }
          this.processResponse(response);
        }
      },
      () => {
        console.log('AssistantService: Overlay closed.');
        if (onClose) onClose();
      }
    );
  }
}
