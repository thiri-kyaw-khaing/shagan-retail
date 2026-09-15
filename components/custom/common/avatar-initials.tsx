import { cn } from "@/lib/utils";

type AvatarInitialsProps = {
  name: string;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AvatarInitials({
  name,
  className,
}: AvatarInitialsProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
