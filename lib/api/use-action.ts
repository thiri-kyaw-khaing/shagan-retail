"use client";

import { useState, useTransition } from "react";

import type { ActionResult } from "@/lib/api/action-result";

/**
 * Runs a write Server Function and tracks it for a dialog: `isPending` while
 * it runs, `error` with the backend's message if it fails. `onSuccess` runs
 * after the server has already re-rendered the page with fresh data.
 */
export function useAction() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = <T,>(action: () => Promise<ActionResult<T>>, onSuccess?: (data: T) => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) onSuccess?.(result.data);
      else setError(result.error);
    });
  };

  return { isPending, error, run, clearError: () => setError(null) };
}
