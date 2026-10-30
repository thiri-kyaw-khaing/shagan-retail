"use client";

import { useRef, type PointerEvent } from "react";

/** How long a card is held before its details open. Touch apps use about half a second. */
export const LONG_PRESS_MS = 500;

/** Moving further than this (px) is a scroll, not a press. */
const MOVE_TOLERANCE = 10;

/**
 * Press-and-hold for touch tills (works with a mouse too). Spread `handlers`
 * on the element; in its click handler, return early when
 * `consumeLongPress()` is true - the click that ends a long press must not
 * also add the item to the cart.
 */
export function useLongPress(onLongPress: () => void, ms = LONG_PRESS_MS) {
  const timer = useRef<number | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const cancel = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
  };

  return {
    handlers: {
      onPointerDown: (event: PointerEvent) => {
        if (event.button !== 0) return;
        cancel();
        fired.current = false;
        start.current = { x: event.clientX, y: event.clientY };
        timer.current = window.setTimeout(() => {
          fired.current = true;
          timer.current = null;
          onLongPress();
        }, ms);
      },
      onPointerMove: (event: PointerEvent) => {
        const from = start.current;
        if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > MOVE_TOLERANCE) cancel();
      },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      // A held finger would otherwise open the browser's own menu.
      onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
    },
    consumeLongPress: () => {
      const wasLongPress = fired.current;
      fired.current = false;
      return wasLongPress;
    },
  };
}
