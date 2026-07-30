"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Blob = { id: number; x: number; y: number; color: string; size: number };

const COLORS = ["#e4b343", "#3ed6c4", "#a5822f"];
const SPAWN_INTERVAL_MS = 70;
const LIFETIME_MS = 900;
const MAX_BLOBS = 14;

let idCounter = 0;

export function CursorTrail({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleMove(e: PointerEvent) {
      const now = performance.now();
      if (now - lastSpawn.current < SPAWN_INTERVAL_MS) return;
      lastSpawn.current = now;

      const rect = el!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = idCounter++;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 60 + Math.random() * 60;

      setBlobs((prev) => {
        const next = [...prev, { id, x, y, color, size }];
        return next.length > MAX_BLOBS ? next.slice(next.length - MAX_BLOBS) : next;
      });

      setTimeout(() => {
        setBlobs((prev) => prev.filter((b) => b.id !== id));
      }, LIFETIME_MS);
    }

    el.addEventListener("pointermove", handleMove);
    return () => el.removeEventListener("pointermove", handleMove);
  }, [containerRef]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {blobs.map((b) => (
        <span
          key={b.id}
          className="cursor-trail-blob"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color}55 0%, ${b.color}00 70%)`,
          }}
        />
      ))}
    </div>
  );
}
