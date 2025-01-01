import { TextToSpeech } from "../speech/text-to-speech";

export class FallbackHandler {
  private fallbackMessage = "Sorry, I didn’t understand that.";

  setFallbackMessage(message: string): void {
    this.fallbackMessage = message;
  }

  handleFallback(input: string): void {
    console.log(this.fallbackMessage);
    new TextToSpeech().speak(this.fallbackMessage);
  }
}
