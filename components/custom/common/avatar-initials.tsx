export function AvatarInitials({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const initials = name.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div
      className={`bg-primary-button flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${className}`}
    >
      {initials}
    </div>
  );
}
