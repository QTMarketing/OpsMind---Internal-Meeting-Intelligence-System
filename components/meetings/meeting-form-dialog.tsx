"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Meeting } from "@/lib/types/dashboard";
import { type MeetingFormValues, meetingFormSchema } from "@/lib/validation/meeting-form-schema";

type MeetingFormDialogProps = {
  open: boolean;
  meeting: Meeting | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: MeetingFormValues) => void;
};

const defaultValues: MeetingFormValues = {
  title: "",
  summary: "",
};

export function MeetingFormDialog({
  open,
  meeting,
  submitting,
  onClose,
  onSubmit,
}: MeetingFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues,
  });
  const { ref: titleRegisterRef, ...titleField } = form.register("title");

  useEffect(() => {
    if (!open) return;
    if (meeting) {
      form.reset({
        title: meeting.title,
        summary: meeting.summary,
      });
      return;
    }
    form.reset(defaultValues);
  }, [form, open, meeting]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (submitting) return;
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, submitting]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(event) => {
        if (submitting) return;
        if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-dialog-title"
        aria-describedby="meeting-dialog-description"
        className="app-card w-full max-w-xl p-5"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="meeting-dialog-title" className="text-lg font-semibold text-foreground">
              Edit Meeting
            </h2>
            <p id="meeting-dialog-description" className="text-sm text-muted">
              Update the meeting title and summary to keep your records clear.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="app-button app-button-ghost hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <label className="flex flex-col gap-1 text-sm text-foreground">
            Title
            <input
              ref={(element) => {
                titleRegisterRef(element);
                titleInputRef.current = element;
              }}
              id="meeting-title"
              {...titleField}
              aria-invalid={Boolean(form.formState.errors.title)}
              aria-describedby={form.formState.errors.title ? "meeting-title-error" : undefined}
              className="app-input"
            />
            {form.formState.errors.title ? (
              <span id="meeting-title-error" className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Summary
            <textarea
              id="meeting-summary"
              rows={4}
              {...form.register("summary")}
              aria-invalid={Boolean(form.formState.errors.summary)}
              aria-describedby={form.formState.errors.summary ? "meeting-summary-error" : undefined}
              className="app-input resize-none py-2"
            />
            {form.formState.errors.summary ? (
              <span id="meeting-summary-error" className="text-xs text-destructive">
                {form.formState.errors.summary.message}
              </span>
            ) : null}
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="app-button app-button-ghost hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="app-button app-button-primary disabled:opacity-60"
            >
              {submitting ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
