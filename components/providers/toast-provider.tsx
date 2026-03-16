"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
  createdAt: number;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id" | "createdAt">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 2500;
const TOAST_DEDUPE_WINDOW_MS = 2500;
const MAX_VISIBLE_TOASTS = 3;

function getToastToneClasses(tone: ToastTone) {
  if (tone === "success") return "border-success/40";
  if (tone === "error") return "border-destructive/40";
  return "border-border";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id" | "createdAt">) => {
    const createdAt = Date.now();
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => {
      const hasRecentDuplicate = current.some(
        (item) =>
          item.title === toast.title &&
          item.message === toast.message &&
          item.tone === toast.tone &&
          createdAt - item.createdAt < TOAST_DEDUPE_WINDOW_MS,
      );
      if (hasRecentDuplicate) return current;

      const next = [...current, { id, ...toast, createdAt }];
      return next.slice(-MAX_VISIBLE_TOASTS);
    });
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`app-card pointer-events-auto rounded-md border px-3 py-2 ${getToastToneClasses(
              toast.tone,
            )}`}
          >
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
            {toast.message ? <p className="mt-0.5 text-xs text-muted">{toast.message}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
