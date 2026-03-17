type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      className="app-card flex min-h-48 flex-col items-start justify-center gap-3 p-6"
      role="status"
      aria-live="assertive"
    >
      <h2 className="text-base font-semibold text-destructive">{title}</h2>
      <p className="max-w-prose text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="app-button app-button-ghost inline-flex items-center hover:bg-surface-muted"
        >
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}
