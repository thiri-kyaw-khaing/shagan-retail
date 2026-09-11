import Link from "next/link";
import { Monitor, Archive } from "lucide-react";
import Logo from "@/components/custom/logo/logo";

function PortalCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-4 rounded-2xl border border-border-light bg-card px-8 py-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2"
    >
      <Logo icon={icon} />
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </Link>
  );
}

export default PortalCard;
