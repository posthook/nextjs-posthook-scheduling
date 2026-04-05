"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Poller({ interval = 5000 }: { interval?: number }) {
  const router = useRouter();
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => { id = setInterval(() => router.refresh(), interval); };
    const stop = () => { if (id) { clearInterval(id); id = null; } };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [router, interval]);
  return null;
}
