import type { RecognitionCallbacks, SpeechToTextService } from "./interfaces";
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export class BrowserRecognition implements SpeechToTextService {
  private recognition: Recognition | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  get supported() {
    if (typeof window === "undefined") return false;
    const w = window as SpeechWindow;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }
  start(callbacks: RecognitionCallbacks, language = "en-US") {
    this.abort();
    const w = window as SpeechWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) {
      callbacks.onError(
        "This browser cannot listen yet. Type your answer below!",
      );
      return;
    }
    const r = new Constructor();
    this.recognition = r;
    r.lang = language;
    r.continuous = false;
    r.interimResults = false;
    let heard = false;
    r.onresult = (e) => {
      heard = true;
      callbacks.onResult(e.results[0][0].transcript);
    };
    r.onerror = (e) => {
      heard = true;
      callbacks.onError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Please ask a grown-up to allow the microphone, or type below."
          : e.error === "network"
            ? "The microphone connection needs a rest. Try typing below."
            : "I couldn't hear that. Let's try again!",
      );
    };
    r.onend = () => {
      if (this.timer) clearTimeout(this.timer);
      if (!heard) callbacks.onError("I couldn't hear that. Let's try again!");
      callbacks.onEnd();
    };
    try {
      r.start();
      this.timer = setTimeout(() => {
        heard = true;
        this.abort();
        callbacks.onError(
          "Let's try again. Tap the microphone when you are ready!",
        );
      }, 12000);
    } catch {
      callbacks.onError("The microphone is busy. Try again in a moment.");
    }
  }
  stop() {
    this.recognition?.stop();
  }
  abort() {
    if (this.timer) clearTimeout(this.timer);
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.abort();
      this.recognition = null;
    }
  }
}
