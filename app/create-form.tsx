"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const delayOptions = ["30s", "1m", "5m", "1h"];

export function CreateForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [delay, setDelay] = useState("1m");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), delay }),
      });
      if (res.ok) {
        setDescription("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <input
        type="text"
        placeholder="What needs a reminder?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="comic-input flex-1 h-11 px-4 text-sm"
      />
      <select
        value={delay}
        onChange={(e) => setDelay(e.target.value)}
        className="comic-input h-11 px-3 text-sm font-bold appearance-none cursor-pointer"
      >
        {delayOptions.map((d) => (
          <option key={d} value={d}>
            in {d}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="comic-btn jiggle bg-foreground text-background px-6 h-11 text-sm"
      >
        {loading ? "..." : "Schedule"}
      </button>
    </form>
  );
}
