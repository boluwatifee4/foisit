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
        console.log('Restarting listening safely...');
        this.restartListening(); // Safely restart listening
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('VoiceProcessor error:', event.error);
      if (this.isListening) {
        console.log('Error occurred. Restarting listening...');
        this.restartListening(); // Restart on error
      }
    };
  }

  startListening(callback: (transcript: string) => void): void {
    console.log('VoiceProcessor: Start listening...');
    if (this.isListening) {
      console.warn('VoiceProcessor: Already listening. Skipping start...');
      return; // Prevent multiple calls to startListening
    }

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Recognized Speech:', transcript);
      callback(transcript);
    };

    this.isListening = true;
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start SpeechRecognition:', error);
    }
  }

  stopListening(): void {
    console.log('VoiceProcessor: Stop listening...');
    if (!this.isListening) {
      console.warn('VoiceProcessor: Already stopped. Skipping stop...');
      return; // Prevent unnecessary calls to stopListening
    }

    this.isListening = false;
    this.recognition.stop();
  }

  private restartListening(): void {
    console.log('VoiceProcessor: Safely restarting listening...');
    if (this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to restart SpeechRecognition:', error);
      }
    }
  }
}
