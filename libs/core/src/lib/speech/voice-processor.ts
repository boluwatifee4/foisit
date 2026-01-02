/* eslint-disable no-unused-vars */
// Minimal typings for a cross-browser SpeechRecognition shape
type RecognitionErrorEvent = { error?: string };
type RecognitionResultAlternative = { transcript?: string; confidence?: number };
type RecognitionResult = RecognitionResultAlternative[] & { isFinal?: boolean };
type RecognitionEvent = { resultIndex: number; results: RecognitionResult[] };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;

  onresult: ((event: RecognitionEvent) => void) | null;
  onstart?: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
};
type RecognitionCtor = new () => Recognition;

const getRecognitionCtor = (): RecognitionCtor | null => {
  const w = window as Window & {
    webkitSpeechRecognition?: RecognitionCtor;
    SpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

type ResultCallback = (text: string, isFinal: boolean) => void;

export type VoiceProcessorStatus =
  | 'unsupported'
  | 'idle'
  | 'listening'
  | 'speaking'
  | 'error';

export type StatusCallback = (status: VoiceProcessorStatus, details?: { error?: string }) => void;

export class VoiceProcessor {
  private recognition: Recognition | null = null;
  private isListening = false;
  private engineActive = false; // true after onstart, false after onend
  private intentionallyStopped = false;
  private restartAllowed = true;
  private lastStart = 0;
  private backoffMs = 250;
  private destroyed = false;
  private resultCallback: ResultCallback | null = null;
  private ttsSpeaking = false;
  private visibilityHandler?: () => void;
  private statusCallback?: StatusCallback;
  private debugEnabled = true; // enable debug logs to aid diagnosis
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private prewarmed = false;
  private hadResultThisSession = false;
  // Debug logger helpers
  private log(message?: string): void {
    if (this.debugEnabled && message) {
      // eslint-disable-next-line no-console
      console.log('[VoiceProcessor]', message);
    }
  }
  private warn(message?: string): void {
    if (this.debugEnabled && message) {
      // eslint-disable-next-line no-console
      console.warn('[VoiceProcessor]', message);
    }
  }
  private error(message?: string): void {
    if (this.debugEnabled && message) {
      // eslint-disable-next-line no-console
      console.error('[VoiceProcessor]', message);
    }
  }

  constructor(
    language = 'en-US',
    options: { interimResults?: boolean; continuous?: boolean; confidenceThreshold?: number } = {}
  ) {
    const Ctor = getRecognitionCtor();
    if (Ctor) {
      this.recognition = new Ctor();
      this.recognition.lang = language;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.continuous = options.continuous ?? true;

      this.recognition.onresult = (event: RecognitionEvent) => this.handleResult(event, options);
      this.recognition.onend = () => this.handleEnd();
      this.recognition.onstart = () => {
        this.log('recognition onstart');
        this.engineActive = true;
        this.hadResultThisSession = false;
        // Clear any pending restart attempts now that we are active
        if (this.restartTimer) {
          clearTimeout(this.restartTimer);
          this.restartTimer = null;
        }
        this.backoffMs = 250;
        if (this.isListening && !this.ttsSpeaking) {
          this.emitStatus('listening');
        }
      };
      // Optional debug hooks supported by Chrome
      type VendorRecognitionEvents = {
        onaudiostart?: () => void;
        onsoundstart?: () => void;
        onspeechstart?: () => void;
        onspeechend?: () => void;
        onsoundend?: () => void;
        onaudioend?: () => void;
      };
      const vrec = this.recognition as unknown as VendorRecognitionEvents;
      vrec.onaudiostart = () => this.log('onaudiostart');
      vrec.onsoundstart = () => this.log('onsoundstart');
      vrec.onspeechstart = () => this.log('onspeechstart');
      vrec.onspeechend = () => this.log('onspeechend');
      vrec.onsoundend = () => this.log('onsoundend');
      vrec.onaudioend = () => this.log('onaudioend');
      this.recognition.onerror = (event: RecognitionErrorEvent) => this.handleError(event);
    } else {
      // No native support; keep recognition null and let consumers feature-detect.
      this.recognition = null;
      // If unsupported, immediately report status so UI can show a clear fallback.
      this.emitStatus('unsupported');
    }

    // Pause listening while TTS is speaking via CustomEvents dispatched by TextToSpeech
    window.addEventListener('foisit:tts-start', this.onTTSStart);
    window.addEventListener('foisit:tts-end', this.onTTSEnd);

    // Pause on tab hide, resume on show
    this.visibilityHandler = () => {
      if (document.hidden) {
        try { this.recognition?.stop(); } catch { /* no-op */ }
        this.emitStatus(this.ttsSpeaking ? 'speaking' : 'idle');
      } else if (this.isListening && !this.ttsSpeaking) {
        this.safeRestart();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  /** Check if SpeechRecognition is available */
  isSupported(): boolean {
    return getRecognitionCtor() !== null;
  }

   /** Allow consumers (wrappers) to observe status changes */
  onStatusChange(callback: StatusCallback | undefined): void {
    this.statusCallback = callback;
  }

  /** Start listening for speech input */
  startListening(callback: ResultCallback): void {
    if (!this.isSupported() || !this.recognition) {
      this.warn('VoiceProcessor: SpeechRecognition is not supported in this browser.');
      this.emitStatus('unsupported');
      return;
    }
    if (this.isListening) {
      this.warn('VoiceProcessor: Already listening.');
      this.resultCallback = callback; // update callback if needed
      return;
    }

    this.resultCallback = callback;
    this.intentionallyStopped = false;
    this.restartAllowed = true;
    this.isListening = true;
    this.emitStatus('listening');
    // Warm up mic to avoid immediate onend in some environments
    this.prewarmAudio().finally(() => {
      this.safeRestart();
    });
  }

  /** Stop listening for speech input */
  stopListening(): void {
    this.intentionallyStopped = true;
    this.restartAllowed = false;
    this.isListening = false;
    this.emitStatus(this.ttsSpeaking ? 'speaking' : 'idle');
    try { this.recognition?.stop(); } catch { /* no-op */ }
  }

  /** Clean up listeners */
  destroy(): void {
    this.destroyed = true;
    this.stopListening();
    this.resultCallback = null;
    window.removeEventListener('foisit:tts-start', this.onTTSStart);
    window.removeEventListener('foisit:tts-end', this.onTTSEnd);
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = undefined;
    }
  }

  /** Handle recognized speech results */
  private handleResult(event: RecognitionEvent, options: { interimResults?: boolean; confidenceThreshold?: number }): void {
    if (!this.resultCallback) return;
    const threshold = options.confidenceThreshold ?? 0.6;
    // Emit each alternative result chunk; concatenate finals client-side if desired
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const alt = res && res[0];
      const transcript: string = alt?.transcript?.trim?.() || '';
      const confidence: number = alt?.confidence ?? 0;
      if (!transcript) continue;
      if (!res.isFinal && options.interimResults === false) continue; // skip interim if disabled
      if (res.isFinal && confidence < threshold) continue; // ignore low-confidence finals
      try {
        this.hadResultThisSession = true;
        this.resultCallback(transcript, !!res.isFinal);
      } catch {
        // Swallow user callback exceptions to avoid killing recognition
        this.error('VoiceProcessor: result callback error');
      }
    }
  }

  /** Handle session end */
  private handleEnd(): void {
    this.log('recognition onend');
    this.engineActive = false;
    if (this.destroyed || this.intentionallyStopped || !this.restartAllowed || this.ttsSpeaking) {
      if (!this.ttsSpeaking) {
        this.isListening = false;
        this.emitStatus('idle');
      }
      return;
    }
    // We are still in "listening" mode logically; recognition ended spuriously.
    this.isListening = true;
    // Best-effort restart (continuous can still end spuriously)
    this.scheduleRestart();
  }

  /** Handle errors during speech recognition */
  private handleError(event: RecognitionErrorEvent): void {
    const err = event?.error;
    this.warn(`Error occurred: ${err ?? 'unknown'}`);

    // Fatal errors: don't spin
    const fatal = ['not-allowed', 'service-not-allowed', 'bad-grammar', 'language-not-supported'];
    if (err && fatal.includes(err)) {
      this.intentionallyStopped = true;
      this.restartAllowed = false;
      this.isListening = false;
      this.emitStatus('error', { error: err });
      return;
    }
    // For transient errors, try restart
    this.scheduleRestart();
  }

  private safeRestart(): void {
    if (!this.recognition) return;
    if (this.engineActive) {
      this.log('safeRestart: engine already active, skipping start');
      return;
    }
    const now = Date.now();
    if (now - this.lastStart < 300) {
      setTimeout(() => this.safeRestart(), 300);
      return;
    }
    this.lastStart = now;
    try {
      this.log('calling recognition.start()');
      this.recognition.start();
      this.backoffMs = 250; // reset backoff on successful start
      if (this.isListening && !this.ttsSpeaking) {
        this.emitStatus('listening');
      }
    } catch {
      this.error('recognition.start() threw; scheduling restart');
      this.scheduleRestart();
    }
  }

  private scheduleRestart(): void {
    if (this.destroyed || this.intentionallyStopped || !this.restartAllowed || this.ttsSpeaking) return;
    if (this.engineActive) {
      this.log('scheduleRestart: engine active, not scheduling');
      return;
    }
    const delay = Math.min(this.backoffMs, 2000);
    this.log(`scheduleRestart in ${delay}ms`);
    if (this.restartTimer) {
      // A restart is already scheduled; keep the earliest
      this.log('scheduleRestart: restart already scheduled');
      return;
    }
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (this.destroyed || this.intentionallyStopped || !this.restartAllowed || this.ttsSpeaking) return;
      this.safeRestart();
    }, delay);
    this.backoffMs = Math.min(this.backoffMs * 2, 2000);
  }

  private async prewarmAudio(): Promise<void> {
    if (this.prewarmed) return;
    try {
      if (typeof navigator === 'undefined' || !('mediaDevices' in navigator)) return;
      const md = navigator.mediaDevices;
      if (!md?.getUserMedia) return;
      this.log('prewarmAudio: requesting mic');
      const stream = await md.getUserMedia({ audio: true });
      for (const track of stream.getTracks()) track.stop();
      this.prewarmed = true;
      this.log('prewarmAudio: mic ready');
    } catch {
      this.warn('prewarmAudio: failed to get mic');
    }
  }

  private onTTSStart = () => {
    this.ttsSpeaking = true;
    try { this.recognition?.stop(); } catch { /* no-op */ }
    // If we were listening, switch to speaking state
    if (this.isListening) {
      this.emitStatus('speaking');
    }
  };

  private onTTSEnd = () => {
    this.ttsSpeaking = false;
    if (this.isListening && this.restartAllowed) {
      this.safeRestart();
    } else {
      this.emitStatus(this.isListening ? 'listening' : 'idle');
    }
  };

  private emitStatus(status: VoiceProcessorStatus, details?: { error?: string }): void {
    if (!this.statusCallback) return;
    try {
      this.statusCallback(status, details);
    } catch {
      // Never let consumer errors break recognition
      this.error('VoiceProcessor: status callback error');
    }
  }
}
