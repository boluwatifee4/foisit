import { TextToSpeech } from '../speech/text-to-speech';

export class FallbackHandler {
  private fallbackMessage = 'Sorry, I didn’t understand that.';

  setFallbackMessage(message: string): void {
    this.fallbackMessage = message;
  }

  handleFallback(transcript?: string): void {
    // eslint-disable-next-line no-console
    if (transcript) console.log(`Fallback triggered for: "${transcript}"`);
    console.log(this.fallbackMessage);
    new TextToSpeech().speak(this.fallbackMessage);
  }

  getFallbackMessage(): string {
    return this.fallbackMessage;
  }
}
