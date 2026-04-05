"use client";

import { useState, useEffect } from "react";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "any moment";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes < 60) return `${minutes}m ${secs}s`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function Countdown({
  target,
  className = "",
}: {
  target: string;
  className?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const epoch = new Date(target).getTime();
    setRemaining(epoch - Date.now());
    const id = setInterval(() => {
      const r = epoch - Date.now();
      setRemaining(r);
      if (r < -30000) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining === null) return <span className={`font-mono text-[11px] font-bold ${className}`}>...</span>;
  if (remaining < -30000) return null;

  return (
    <span className={`font-mono text-[11px] font-bold ${className}`}>
      {formatRemaining(remaining)}
    </span>
  );
}
