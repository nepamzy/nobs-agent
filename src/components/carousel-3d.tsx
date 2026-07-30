"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";

export type CarouselItem = {
  id?: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
};

export function Carousel3D({
  items,
  orientation = "horizontal",
}: {
  items: CarouselItem[];
  orientation?: "horizontal" | "vertical";
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ pos: 0, scroll: 0 });
  const isHorizontal = orientation === "horizontal";

  // Applies a coverflow-style rotation/scale to each card based on its
  // distance from the container's center, along the scroll axis.
  function updateTilt() {
    const container = scrollRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const centerPos = isHorizontal
      ? containerRect.left + containerRect.width / 2
      : containerRect.top + containerRect.height / 2;

    cardRefs.current.forEach((card) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cardCenter = isHorizontal
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2;
      const dimension = isHorizontal ? containerRect.width : containerRect.height;
      const offset = (cardCenter - centerPos) / (dimension / 2); // roughly -1..1
      const clamped = Math.max(-1, Math.min(1, offset));
      const rotation = clamped * (isHorizontal ? -14 : 10);
      const scale = 1 - Math.abs(clamped) * 0.12;
      const opacity = 1 - Math.abs(clamped) * 0.35;
      card.style.transform = isHorizontal
        ? `perspective(1000px) rotateY(${rotation}deg) scale(${scale})`
        : `perspective(1000px) rotateX(${rotation}deg) scale(${scale})`;
      card.style.opacity = String(Math.max(0.45, opacity));
    });
  }

  useEffect(() => {
    updateTilt();
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateTilt, { passive: true });
    window.addEventListener("resize", updateTilt);
    return () => {
      container.removeEventListener("scroll", updateTilt);
      window.removeEventListener("resize", updateTilt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-bind only when item count or orientation changes
  }, [items.length, orientation]);

  function handlePointerDown(e: ReactPointerEvent) {
    const container = scrollRef.current;
    if (!container) return;
    setDragging(true);
    dragStart.current = {
      pos: isHorizontal ? e.clientX : e.clientY,
      scroll: isHorizontal ? container.scrollLeft : container.scrollTop,
    };
  }

  function handlePointerMove(e: ReactPointerEvent) {
    if (!dragging) return;
    const container = scrollRef.current;
    if (!container) return;
    const pos = isHorizontal ? e.clientX : e.clientY;
    const delta = pos - dragStart.current.pos;
    if (isHorizontal) {
      container.scrollLeft = dragStart.current.scroll - delta;
    } else {
      container.scrollTop = dragStart.current.scroll - delta;
    }
  }

  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`scrollbar-none cursor-grab select-none active:cursor-grabbing ${
        isHorizontal
          ? "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
          : "flex max-h-[560px] snap-y snap-mandatory flex-col gap-5 overflow-y-auto pr-2"
      }`}
      style={{ scrollBehavior: dragging ? "auto" : "smooth" }}
    >
      {/* spacer so the first/last card can reach visual center */}
      <div className={isHorizontal ? "w-[calc(50%-9rem)] shrink-0" : "h-2 shrink-0"} />
      {items.map((item, i) => (
        <Link
          key={item.title}
          href={item.href}
          id={item.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          draggable={false}
          className={`glass group shrink-0 snap-center rounded-2xl p-7 transition-transform duration-100 ease-out hover:border-[var(--color-brass)]/50 ${
            isHorizontal ? "w-72" : "w-full"
          }`}
        >
          {item.meta && (
            <p className="mb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-brass)]">
              {item.meta}
            </p>
          )}
          <h3 className="font-[family-name:var(--font-display)] text-xl font-medium">
            {item.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-slate)]">{item.description}</p>
          <ArrowUpRight
            size={18}
            className="mt-6 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
          />
        </Link>
      ))}
      <div className={isHorizontal ? "w-[calc(50%-9rem)] shrink-0" : "h-2 shrink-0"} />
    </div>
  );
}
