"use client";

import { useRef, type RefObject, type PointerEvent } from "react";

export type PointerState = {
  x: number; // normalized -1..1 across the container
  y: number; // normalized -1..1 across the container
  dragging: boolean;
  lastClientX: number;
  lastClientY: number;
  dragDeltaX: number; // accumulated since last read, consumer should reset to 0 after reading
  dragDeltaY: number;
};

export function usePointerTracking(containerRef: RefObject<HTMLElement | null>) {
  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    dragging: false,
    lastClientX: 0,
    lastClientY: 0,
    dragDeltaX: 0,
    dragDeltaY: 0,
  });

  function updateNormalized(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointer.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handlePointerDown(e: PointerEvent) {
    pointer.current.dragging = true;
    pointer.current.lastClientX = e.clientX;
    pointer.current.lastClientY = e.clientY;
    updateNormalized(e.clientX, e.clientY);
  }

  function handlePointerMove(e: PointerEvent) {
    updateNormalized(e.clientX, e.clientY);
    if (pointer.current.dragging) {
      pointer.current.dragDeltaX += e.clientX - pointer.current.lastClientX;
      pointer.current.dragDeltaY += e.clientY - pointer.current.lastClientY;
      pointer.current.lastClientX = e.clientX;
      pointer.current.lastClientY = e.clientY;
    }
  }

  function handlePointerUp() {
    pointer.current.dragging = false;
  }

  return { pointer, handlePointerDown, handlePointerMove, handlePointerUp };
}
