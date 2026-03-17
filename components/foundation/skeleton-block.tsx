type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return (
    <div
      className={`surface-muted animate-pulse rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}
