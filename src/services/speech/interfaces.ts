export interface RecognitionCallbacks {
  onResult: (text: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}
export interface SpeechToTextService {
  readonly supported: boolean;
  start(callbacks: RecognitionCallbacks, language: string): void;
  stop(): void;
  abort(): void;
}
export interface TextToSpeechService {
  speak(
    text: string,
    options: { rate: number; language: string },
  ): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
}
