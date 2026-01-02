export interface SpeechRecognitionConfig {
  lang?: string; // Language code, e.g., "en-US"
  continuous?: boolean; // Continuous listening or single phrase
  interimResults?: boolean; // Capture partial results
}
