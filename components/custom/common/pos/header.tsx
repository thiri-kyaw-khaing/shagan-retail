function Header({
  title,
  description,
  right,
  children,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="m-4 flex flex-row items-center justify-between gap-5 rounded-xl bg-brand px-4 py-4 text-white sm:px-8">
        <div className="flex items-center gap-5">
          {children}
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            {description && (
              <p className="mt-1 text-sm font-medium text-white/90">
                {description}
              </p>
            )}
          </div>
        </div>

        {right}
      </div>
    </div>
  );
}

export default Header;
