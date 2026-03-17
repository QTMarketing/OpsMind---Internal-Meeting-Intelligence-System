type KpiCardProps = {
  label: string;
  value: string;
  change?: string;
  onClick?: () => void;
};

export function KpiCard({ label, value, change, onClick }: KpiCardProps) {
  const Wrapper = onClick ? "button" : "article";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`app-card p-3.5 text-left ${onClick ? "cursor-pointer hover:bg-surface-muted" : ""}`}
      aria-label={onClick ? `Drill down to ${label.toLowerCase()}` : undefined}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-1.5 text-[1.7rem] font-bold leading-none text-foreground">{value}</p>
      {change ? <p className="mt-1 text-xs text-muted">{change}</p> : null}
    </Wrapper>
  );
}
