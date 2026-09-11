import type { VoiceState } from "@/types";
export function TeacherAvatar({
  state = "IDLE",
  celebrating = false,
}: {
  state?: VoiceState;
  celebrating?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Mia, your friendly teacher, ${state.toLowerCase()}`}
      className={`avatar ${state.toLowerCase()} ${celebrating ? "celebrate" : ""}`}
    >
      <div className="avatar-shirt" />
      <div className="avatar-head">
        <i className="avatar-eye left" />
        <i className="avatar-eye right" />
        <i className="avatar-mouth" />
      </div>
      <div className="avatar-hair" />
      <span className="absolute -right-4 top-4 text-3xl">
        {celebrating ? "🌟" : state === "THINKING" ? "💭" : "✨"}
      </span>
    </div>
  );
}
