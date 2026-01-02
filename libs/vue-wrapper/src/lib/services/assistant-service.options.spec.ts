import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssistantService } from './AssistantService';

vi.mock('@foisit/core', () => {
  class CommandHandler {
    static nextResponse: any;
    constructor(_: any) { }
    addCommand = vi.fn();
    removeCommand = vi.fn();
    getCommands = vi.fn(() => []);
    executeCommand = vi.fn(async () => CommandHandler.nextResponse);
  }

  class FallbackHandler {
    handleFallback = vi.fn();
    setFallbackMessage = vi.fn();
    getFallbackMessage = vi.fn(() => 'fallback');
  }

  class VoiceProcessor {
    startListening = vi.fn();
    stopListening = vi.fn();
  }

  class StateManager {
    setState = vi.fn();
    subscribers: any[] = [];
  }

  class TextToSpeech {
    speak = vi.fn();
  }

  class GestureHandler {
    setupDoubleTapListener = vi.fn();
    destroy = vi.fn();
  }

  class OverlayManager {
    static lastInstance: any;
    _onSubmit: any;
    _onClose: any;

    constructor(_: any) {
      OverlayManager.lastInstance = this;
    }

    registerCallbacks = vi.fn((onSubmit: any, onClose: any) => {
      this._onSubmit = onSubmit;
      this._onClose = onClose;
    });

    toggle = vi.fn(async (onSubmit: any, onClose: any) => {
      this._onSubmit = onSubmit;
      this._onClose = onClose;
    });

    showLoading = vi.fn();
    hideLoading = vi.fn();
    addMessage = vi.fn();
    addOptions = vi.fn();
    addForm = vi.fn();
    destroy = vi.fn();
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

describe('vue-wrapper AssistantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders options even when message exists (ambiguous/confirm)', async () => {
    (CommandHandler as any).nextResponse = {
      type: 'confirm',
      message:
        'Could you please specify whether you want to delete your account or delete all user records?',
      options: [
        { label: 'Delete my account permanently', commandId: 'delete account' },
        { label: 'Permanently delete all user records from the database', commandId: 'delete all records' },
      ],
    };

    new AssistantService({
      commands: [],
      floatingButton: { visible: false },
      inputPlaceholder: 'Type...',
      enableSmartIntent: false,
    } as any);

    const overlay = (OverlayManager as any).lastInstance;
    await overlay._onSubmit('i want to delete stuffs');

    expect(overlay.addMessage).toHaveBeenCalledWith(
      'Could you please specify whether you want to delete your account or delete all user records?',
      'system'
    );
    expect(overlay.addOptions).toHaveBeenCalledWith([
      { label: 'Delete my account permanently', commandId: 'delete account' },
      { label: 'Permanently delete all user records from the database', commandId: 'delete all records' },
    ]);
  });
});
