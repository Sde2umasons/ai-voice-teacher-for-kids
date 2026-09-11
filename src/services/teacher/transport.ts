import type { TeacherCommand } from "@/types";
export interface ClassroomState {
  childId: string;
  path: string;
  lessonId?: string;
  step?: number;
  paused?: boolean;
  lastCommandId?: string;
  lastAnswer?: string;
}
export type ClassroomMessage =
  | { kind: "command"; command: TeacherCommand }
  | { kind: "state"; state: ClassroomState };
export interface TeacherTransport {
  send(message: ClassroomMessage): void;
  subscribe(listener: (message: ClassroomMessage) => void): () => void;
  close(): void;
}
export class LocalTeacherTransport implements TeacherTransport {
  private channel: BroadcastChannel | null;
  constructor() {
    this.channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("little-wonder-classroom")
        : null;
  }
  send(message: ClassroomMessage) {
    this.channel?.postMessage(message);
  }
  subscribe(listener: (message: ClassroomMessage) => void) {
    const handler = (event: MessageEvent<ClassroomMessage>) =>
      listener(event.data);
    this.channel?.addEventListener("message", handler);
    return () => this.channel?.removeEventListener("message", handler);
  }
  close() {
    this.channel?.close();
  }
}
export function emitLessonCommand(command: TeacherCommand) {
  window.dispatchEvent(new CustomEvent("teacher-command", { detail: command }));
}
