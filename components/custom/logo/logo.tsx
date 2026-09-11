import { cn } from "@/lib/utils";

function Logo({
  className,
  icon,
}: {
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-md bg-brand p-2 text-white",
        className,
      )}
    >
      {icon}
    </div>
  );
}

export default Logo;
