export class TextToSpeech {
  private synth = window.speechSynthesis;

  speak(text: string, options?: { pitch?: number; rate?: number; volume?: number }): void {
    if (!this.synth) {
      console.error('SpeechSynthesis API is not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (options) {
      utterance.pitch = options.pitch || 1;
      utterance.rate = options.rate || 1;
      utterance.volume = options.volume || 1;
    }

    utterance.onend = () => {
      console.log('Speech finished.');
    };

    utterance.onerror = (event) => {
      console.error('Error during speech synthesis:', event.error);
    };

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
