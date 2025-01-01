export class TextToSpeech {
  private synth = window.speechSynthesis;

  speak(text: string, options?: { pitch?: number; rate?: number; volume?: number }): void {
    const utterance = new SpeechSynthesisUtterance(text);
    if (options) {
      utterance.pitch = options.pitch || 1;
      utterance.rate = options.rate || 1;
      utterance.volume = options.volume || 1;
    }
    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    this.synth.cancel();
  }
}
