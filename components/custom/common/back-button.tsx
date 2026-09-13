"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  /**
   * Where "Back" navigates to. Always used directly rather than falling back
   * to router.back() — window.history.length reflects the whole tab's
   * browsing history, not just in-app navigation, so it's not a reliable way
   * to tell whether "back" has a sensible in-app destination.
   */
  fallbackHref?: string;
  /** Optional style override; defaults to the primary button style. */
  className?: string;
  /** Button label. */
  label?: string;
}

function BackButton({
  fallbackHref = "/staff",
  className,
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  const backFunction = () => {
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={backFunction}
      className={
        className ??
        "rounded-lg bg-primary-button px-4 py-2 text-sm text-white hover:border-amber-100 hover:border-2"
      }
    >
      {label}
    </button>
  );
}

export default BackButton;
