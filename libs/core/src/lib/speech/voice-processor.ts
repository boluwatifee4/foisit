export class VoiceProcessor {
  private recognition: any;
  private isListening = false;

  constructor(language = 'en-US') {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('SpeechRecognition API is not supported in this browser.');
    }
    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
  }

  startListening(callback: (transcript: string) => void): void {
    if (this.isListening) {
      return;
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      callback(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('VoiceProcessor error:', event.error);
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening(): void {
    if (!this.isListening) {
      return;
    }
    this.recognition.stop();
    this.isListening = false;
  }
}
