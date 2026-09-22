type BackOfficeHeaderBrandProps = {
  title: string;
  subtitle: string;
};

export default function BackOfficeHeaderBrand({
  title,
  subtitle,
}: BackOfficeHeaderBrandProps) {
  return (
    <div className="text-white">
      <p className="text-lg font-extrabold tracking-wide uppercase">
        {title}
      </p>
      <p className="text-xs text-white/80">{subtitle}</p>
    </div>
  );
}
