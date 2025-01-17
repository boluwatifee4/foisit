import { StateManager } from "../state-manager";

/* eslint-disable no-console */
export class VoiceProcessor {
  private recognition: any;
  private isListening = false;
  private stateManager: StateManager;

  constructor(language = 'en-US') {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error('SpeechRecognition API is not supported in this browser.');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.interimResults = false; // Process final results only
    this.recognition.continuous = true; // Enable continuous listening

    this.recognition.onresult = this.handleResult.bind(this); // Event handler for results
    this.recognition.onend = this.handleEnd.bind(this); // Event handler for session end
    this.recognition.onerror = this.handleError.bind(this); // Event handler for errors
    this.stateManager = new StateManager();

  }

  /** Start listening for speech input */
  // eslint-disable-next-line no-unused-vars
  startListening(callback: (transcript: string) => void): void {
    console.log('VoiceProcessor: Starting listening...');
    if (this.isListening) {
      console.warn('VoiceProcessor: Already listening. Skipping start...');
      return;
    }

    try {
      this.recognition.onresult = (event: any) => this.handleResult(event, callback);
      this.recognition.start();
      this.isListening = true;
      console.log('VoiceProcessor: Listening started.');
    } catch (error) {
      console.error('VoiceProcessor: Failed to start SpeechRecognition:', error);
    }
  }

  /** Stop listening for speech input */
  stopListening(): void {
    console.log('VoiceProcessor: Stopping listening...');
    if (!this.isListening) {
      console.warn('VoiceProcessor: Already stopped. Skipping stop...');
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('VoiceProcessor: Listening stopped.');
    } catch (error) {
      console.error('VoiceProcessor: Failed to stop SpeechRecognition:', error);
    }
  }

  /** Handle recognized speech results */
  // eslint-disable-next-line no-unused-vars
  private handleResult(event: any, callback: (transcript: string) => void): void {
    const result = event.results[event.resultIndex];
    const transcript = result[0]?.transcript?.trim() || '';
    const confidence = result[0]?.confidence || 0;

    if (transcript && confidence > 0.75) {
      console.log(`VoiceProcessor: Recognized Speech (confidence ${confidence}):`, transcript);
      // check if the transcript is equals to activation command
      callback(transcript);
    } else {
      console.log('VoiceProcessor: Ignoring low-confidence or empty result.');
    }
  }

  /** Handle session end */
  private handleEnd(): void {
    console.log('VoiceProcessor: Session ended.');
    this.isListening = false;
  }

  /** Handle errors during speech recognition */
  private handleError(event: any): void {
    console.error('VoiceProcessor: Error occurred:', event.error);

    if (event.error === 'no-speech') {
      console.log('VoiceProcessor: No speech detected.');
    } else if (event.error === 'audio-capture') {
      console.log('VoiceProcessor: Microphone not detected.');
    }

    this.isListening = false; // Reset listening state
  }
}
