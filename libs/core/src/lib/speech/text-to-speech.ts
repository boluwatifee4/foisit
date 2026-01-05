export class TextToSpeech {
  private synth: SpeechSynthesis | null = (typeof window !== 'undefined' ? window.speechSynthesis : null);

  speak(text: string, options?: { pitch?: number; rate?: number; volume?: number }): void {
    if (!this.synth) {
      // eslint-disable-next-line no-console
      console.error('SpeechSynthesis API is not supported in this environment.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (options) {
      utterance.pitch = options.pitch || 1;
      utterance.rate = options.rate || 1;
      utterance.volume = options.volume || 1;
    }

    // Notify listeners (e.g., VoiceProcessor) to pause recognition while speaking
    if (typeof window !== 'undefined') {
      utterance.onstart = () => {
        window.dispatchEvent(new CustomEvent('foisit:tts-start'));
      };
      utterance.onend = () => {
        // eslint-disable-next-line no-console
        console.log('Speech finished.');
        window.dispatchEvent(new CustomEvent('foisit:tts-end'));
      };
    }

    utterance.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.error('Error during speech synthesis:', (event as any).error);
    };

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
