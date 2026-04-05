import type { TaskStatus } from "@/lib/types";

const config: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "#fdf5d8", text: "#8a7a2e" },
  reminded: { label: "Reminded", bg: "#fde8d8", text: "#8a5a2e" },
  done: { label: "Done", bg: "#e8f4f0", text: "#2e6b5a" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, bg, text } = config[status];
  return (
    <span
      className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full border-2 border-foreground"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  );
}
