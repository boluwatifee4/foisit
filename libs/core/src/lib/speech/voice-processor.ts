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
    this.recognition.interimResults = false;

    this.recognition.onend = () => {
      console.log('SpeechRecognition session ended.');
      if (this.isListening) {
        this.restartListening(); // Restart if still in listening state
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('VoiceProcessor error:', event.error);
      if (this.isListening) {
        this.restartListening(); // Restart on error
      }
    };
  }

  startListening(callback: (transcript: string) => void): void {
    console.log('VoiceProcessor: Start listening...');
    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Recognized Speech:', transcript);
      callback(transcript);
    };

    this.isListening = true;
    this.recognition.start();
  }

  stopListening(): void {
    console.log('VoiceProcessor: Stop listening...');
    this.isListening = false;
    this.recognition.stop();
  }

  private restartListening(): void {
    console.log('VoiceProcessor: Restarting listening...');
    this.recognition.start();
  }
}
