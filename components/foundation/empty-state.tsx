type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section
      className="app-card flex min-h-48 flex-col items-start justify-center gap-3 p-6"
      aria-live="polite"
    >
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-prose text-sm text-muted">{description}</p>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="app-button app-button-primary inline-flex items-center"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
