type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-0.5">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm leading-6 text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
