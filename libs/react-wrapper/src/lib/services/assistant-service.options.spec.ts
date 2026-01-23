import { AssistantService } from './AssistantService';

jest.mock('@foisit/core', () => {
  class CommandHandler {
    static nextResponse: any;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor(_: any) { }
    addCommand = jest.fn();
    removeCommand = jest.fn();
    getCommands = jest.fn(() => []);
    executeCommand = jest.fn(async () => CommandHandler.nextResponse);
  }

  class FallbackHandler {
    handleFallback = jest.fn();
    setFallbackMessage = jest.fn();
    getFallbackMessage = jest.fn(() => 'fallback');
  }

  class VoiceProcessor {
    startListening = jest.fn();
    stopListening = jest.fn();
  }

  class StateManager {
    setState = jest.fn();
    subscribers: any[] = [];
  }

  class TextToSpeech {
    speak = jest.fn();
  }

  class GestureHandler {
    setupTripleTapListener = jest.fn();
    destroy = jest.fn();
  }

  class OverlayManager {
    static lastInstance: any;
    _onSubmit: any;
    _onClose: any;

    constructor(_: any) {
      OverlayManager.lastInstance = this;
    }

    registerCallbacks = jest.fn((onSubmit: any, onClose: any) => {
      this._onSubmit = onSubmit;
      this._onClose = onClose;
    });

    setExternalCommandExecutor = jest.fn();

    toggle = jest.fn(async (onSubmit: any, onClose: any) => {
      this._onSubmit = onSubmit;
      this._onClose = onClose;
    });

    showLoading = jest.fn();
    hideLoading = jest.fn();
    addMessage = jest.fn();
    addOptions = jest.fn();
    addForm = jest.fn();
    destroy = jest.fn();
  }

  return {
    CommandHandler,
    FallbackHandler,
    VoiceProcessor,
    StateManager,
    TextToSpeech,
    GestureHandler,
    OverlayManager,
  };
});

import { CommandHandler, OverlayManager } from '@foisit/core';

describe('react-wrapper AssistantService', () => {
  it('renders options even when message exists (ambiguous/confirm)', async () => {
    (CommandHandler as any).nextResponse = {
      type: 'ambiguous',
      message: 'Here are the available commands:',
      options: [
        { label: 'help', commandId: 'help' },
        { label: 'create user', commandId: 'create user' },
      ],
    };

    new AssistantService({
      commands: [],
      floatingButton: { visible: false },
      inputPlaceholder: 'Type...',
      enableSmartIntent: false,
    } as any);

    const overlay = (OverlayManager as any).lastInstance;
    await overlay._onSubmit('hello');

    expect(overlay.addMessage).toHaveBeenCalledWith(
      'Here are the available commands:',
      'system'
    );
    expect(overlay.addOptions).toHaveBeenCalledWith([
      { label: 'help', commandId: 'help' },
      { label: 'create user', commandId: 'create user' },
    ]);
  });
});
