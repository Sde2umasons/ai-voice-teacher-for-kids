import type { TextToSpeechService } from "./interfaces";
interface Playback {
  utterance: SpeechSynthesisUtterance;
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
}
export class BrowserSynthesis implements TextToSpeechService {
  private active: Playback | null = null;
  private armTimeout(playback: Playback) {
    playback.timer = setTimeout(() => {
      if (this.active !== playback) return;
      this.finish(
        playback,
        new Error("My voice took too long. Tap Repeat to try again."),
      );
      window.speechSynthesis.cancel();
    }, 45000);
  }
  private finish(playback: Playback, error?: Error) {
    if (playback.timer) clearTimeout(playback.timer);
    playback.utterance.onend = null;
    playback.utterance.onerror = null;
    if (this.active === playback) this.active = null;
    if (error) playback.reject(error);
    else playback.resolve();
  }
  speak(
    text: string,
    options: { rate: number; language: string },
  ): Promise<void> {
    this.stop();
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        reject(new Error("My voice is resting. You can read my words here."));
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate;
      utterance.lang = options.language;
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith(options.language.slice(0, 2)));
      if (voice) utterance.voice = voice;
      const playback: Playback = { utterance, resolve, reject, timer: null };
      this.active = playback;
      this.armTimeout(playback);
      utterance.onend = () => this.finish(playback);
      utterance.onerror = () =>
        this.finish(
          playback,
          new Error("My voice is resting. Tap Repeat, or read along."),
        );
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        this.finish(
          playback,
          new Error("My voice is resting. Tap Repeat, or read along."),
        );
      }
    });
  }
  stop() {
    if (this.active) this.finish(this.active);
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
  }
  pause() {
    if (this.active?.timer) clearTimeout(this.active.timer);
    window.speechSynthesis?.pause();
  }
  resume() {
    if (this.active) this.armTimeout(this.active);
    window.speechSynthesis?.resume();
  }
}
