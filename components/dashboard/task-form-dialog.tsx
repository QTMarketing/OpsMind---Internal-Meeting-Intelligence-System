"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import type { Task } from "@/lib/types/dashboard";
import { type TaskFormValues, taskFormSchema } from "@/lib/validation/task-form-schema";

type TaskFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  task: Task | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

const defaultValues: TaskFormValues = {
  title: "",
  owner: "",
  deadline: "",
  status: "pending",
  project: "OpsMind",
};

export function TaskFormDialog({
  open,
  mode,
  task,
  submitting,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });
  const { ref: titleRegisterRef, ...titleField } = form.register("title");

  useEffect(() => {
    if (!open) return;
    if (task) {
      form.reset({
        title: task.title,
        owner: task.owner,
        deadline: task.deadline,
        status: task.status,
        project: task.project,
      });
      return;
    }
    form.reset(defaultValues);
  }, [form, open, task]);

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
        aria-labelledby="task-dialog-title"
        aria-describedby="task-dialog-description"
        className="app-card w-full max-w-xl p-5"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="task-dialog-title" className="text-lg font-semibold text-foreground">
              {mode === "create" ? "Create Task" : "Edit Task"}
            </h2>
            <p id="task-dialog-description" className="text-sm text-muted">
              {mode === "create"
                ? "Add a new operational task to the workflow."
                : "Update details and keep the task stream accurate."}
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
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <label className="flex flex-col gap-1 text-sm text-foreground sm:col-span-2">
            Title
            <input
              ref={(element) => {
                titleRegisterRef(element);
                titleInputRef.current = element;
              }}
              id="task-title"
              {...titleField}
              aria-invalid={Boolean(form.formState.errors.title)}
              aria-describedby={form.formState.errors.title ? "task-title-error" : undefined}
              className="app-input"
            />
            {form.formState.errors.title ? (
              <span id="task-title-error" className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Owner
            <input
              id="task-owner"
              {...form.register("owner")}
              aria-invalid={Boolean(form.formState.errors.owner)}
              aria-describedby={form.formState.errors.owner ? "task-owner-error" : undefined}
              className="app-input"
            />
            {form.formState.errors.owner ? (
              <span id="task-owner-error" className="text-xs text-destructive">
                {form.formState.errors.owner.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Deadline
            <input
              id="task-deadline"
              type="date"
              {...form.register("deadline")}
              aria-invalid={Boolean(form.formState.errors.deadline)}
              aria-describedby={form.formState.errors.deadline ? "task-deadline-error" : undefined}
              className="app-input"
            />
            {form.formState.errors.deadline ? (
              <span id="task-deadline-error" className="text-xs text-destructive">
                {form.formState.errors.deadline.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Status
            <select
              id="task-status"
              {...form.register("status")}
              aria-invalid={Boolean(form.formState.errors.status)}
              aria-describedby={form.formState.errors.status ? "task-status-error" : undefined}
              className="app-select"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
            {form.formState.errors.status ? (
              <span id="task-status-error" className="text-xs text-destructive">
                {form.formState.errors.status.message}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Project
            <input
              id="task-project"
              {...form.register("project")}
              aria-invalid={Boolean(form.formState.errors.project)}
              aria-describedby={form.formState.errors.project ? "task-project-error" : undefined}
              className="app-input"
            />
            {form.formState.errors.project ? (
              <span id="task-project-error" className="text-xs text-destructive">
                {form.formState.errors.project.message}
              </span>
            ) : null}
          </label>

          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
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
              {submitting ? "Saving task..." : mode === "create" ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
