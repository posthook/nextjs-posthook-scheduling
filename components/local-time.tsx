"use client";

import { useState, useEffect } from "react";

export function LocalTime({ iso, showSeconds }: { iso: string; showSeconds?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="text-xs text-muted-foreground">...</span>;

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...(showSeconds && { second: "2-digit" }),
  };

  return (
    <span>{new Date(iso).toLocaleTimeString([], options)}</span>
  );
}
