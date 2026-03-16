"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/foundation/empty-state";
import { ErrorState } from "@/components/foundation/error-state";
import { KpiCard } from "@/components/foundation/kpi-card";
import { SkeletonBlock } from "@/components/foundation/skeleton-block";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { TaskFormDialog } from "@/components/dashboard/task-form-dialog";
import { TasksTable } from "@/components/dashboard/tasks-table";
import { useToast } from "@/components/providers/toast-provider";
import {
  useCreateTaskMutation,
  useMeetingsQuery,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@/lib/query/dashboard-query";
import type { Task } from "@/lib/types/dashboard";
import {
  buildMeetingVolumeData,
  buildTaskTrendData,
  formatShortDate,
  getTaskStatusCount,
  normalizeDateKey,
} from "@/lib/utils/dashboard";
import type { TaskFormValues } from "@/lib/validation/task-form-schema";

type DrilldownFilter = "all" | "open" | "completed" | "blocked";

export function DashboardOverview() {
  const router = useRouter();
  const { pushToast } = useToast();
  const tasksQuery = useTasksQuery();
  const meetingsQuery = useMeetingsQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [drilldownFilter, setDrilldownFilter] = useState<DrilldownFilter>("all");
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null);

  const isKpiLoading = tasksQuery.isLoading || meetingsQuery.isLoading;
  const hasKpiError = tasksQuery.isError || meetingsQuery.isError;

  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const meetings = useMemo(() => meetingsQuery.data ?? [], [meetingsQuery.data]);

  const taskTrendData = buildTaskTrendData(tasks);
  const meetingVolumeData = buildMeetingVolumeData(meetings);

  const lastSync = Math.max(tasksQuery.dataUpdatedAt || 0, meetingsQuery.dataUpdatedAt || 0);
  const dialogMode = editingTask ? "edit" : "create";
  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;

  const selectedTask = useMemo(() => {
    if (!editingTask) return null;
    return tasks.find((task) => task.id === editingTask.id) ?? editingTask;
  }, [editingTask, tasks]);

  const filteredTasksForTable = useMemo(() => {
    const byDrilldown =
      drilldownFilter === "all"
        ? tasks
        : drilldownFilter === "open"
          ? tasks.filter((task) => task.status === "pending" || task.status === "in_progress")
          : tasks.filter((task) => task.status === drilldownFilter);

    if (!selectedDueDate) return byDrilldown;
    return byDrilldown.filter((task) => normalizeDateKey(task.deadline) === selectedDueDate);
  }, [drilldownFilter, selectedDueDate, tasks]);

  const contextFilters = useMemo(() => {
    const filters: Array<{ id: string; label: string; onClear: () => void }> = [];

    if (drilldownFilter === "open") {
      filters.push({
        id: "kpi-open",
        label: "Open tasks (pending + in progress)",
        onClear: () => setDrilldownFilter("all"),
      });
    }
    if (drilldownFilter === "completed") {
      filters.push({
        id: "kpi-completed",
        label: "Completed tasks",
        onClear: () => setDrilldownFilter("all"),
      });
    }
    if (drilldownFilter === "blocked") {
      filters.push({
        id: "kpi-blocked",
        label: "Blocked tasks",
        onClear: () => setDrilldownFilter("all"),
      });
    }
    if (selectedDueDate) {
      filters.push({
        id: "date-filter",
        label: `Due on ${formatShortDate(selectedDueDate)}`,
        onClear: () => setSelectedDueDate(null),
      });
    }

    return filters;
  }, [drilldownFilter, selectedDueDate]);

  function handleTaskTrendPointSelect(dateKey: string) {
    setSelectedDueDate((current) => (current === dateKey ? null : dateKey));
  }

  function handleMeetingVolumeSelect(dateKey: string) {
    router.push(`/meetings?date=${dateKey}`);
  }

  function openCreateDialog() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEditDialog(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingTask(null);
  }

  async function handleSubmitTask(values: TaskFormValues) {
    try {
      if (dialogMode === "create") {
        await createTaskMutation.mutateAsync(values);
        pushToast({
          tone: "success",
          title: "Task created",
          message: "The task now appears in the task table.",
        });
      } else if (selectedTask) {
        await updateTaskMutation.mutateAsync({
          taskId: selectedTask.id,
          input: values,
        });
        pushToast({
          tone: "success",
          title: "Task updated",
          message: "Your updates are now reflected in the task table.",
        });
      }
      closeDialog();
    } catch {
      pushToast({
        tone: "error",
        title: "Unable to save task",
        message: "Please try again in a moment.",
      });
    }
  }

  return (
    <div className="space-y-5">
      {isKpiLoading ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="app-card p-3.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-16" />
          </div>
          <div className="app-card p-3.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-16" />
          </div>
          <div className="app-card p-3.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-16" />
          </div>
          <div className="app-card p-3.5">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-16" />
          </div>
        </section>
      ) : hasKpiError ? (
        <ErrorState
          message="We could not load your dashboard metrics. Please try again."
          onRetry={() => {
            void tasksQuery.refetch();
            void meetingsQuery.refetch();
          }}
        />
      ) : (
        <section className="space-y-2.5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Open Tasks"
              value={String(
                getTaskStatusCount(tasks, "pending") + getTaskStatusCount(tasks, "in_progress"),
              )}
              change="Active workload"
              onClick={() => setDrilldownFilter("open")}
            />
            <KpiCard
              label="Meetings Processed"
              value={String(meetings.length)}
              change="Captured sessions"
              onClick={() => router.push("/meetings")}
            />
            <KpiCard
              label="Completed Tasks"
              value={String(getTaskStatusCount(tasks, "completed"))}
              change="Delivery progress"
              onClick={() => setDrilldownFilter("completed")}
            />
            <KpiCard
              label="Blocked Tasks"
              value={String(getTaskStatusCount(tasks, "blocked"))}
              change="Needs intervention"
              onClick={() => setDrilldownFilter("blocked")}
            />
          </div>
          <p className="text-xs text-success" role="status" aria-live="polite">
            Dashboard data synced
            {lastSync ? ` • ${new Date(lastSync).toLocaleTimeString()}` : ""}
          </p>
        </section>
      )}

      <section className="space-y-4">
        {tasksQuery.isLoading || meetingsQuery.isLoading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="app-card p-4">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="mt-4 h-56 w-full" />
            </div>
            <div className="app-card p-4">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="mt-4 h-56 w-full" />
            </div>
          </div>
        ) : tasksQuery.isError || meetingsQuery.isError ? (
          <ErrorState
            message="We could not load chart insights. Please try again."
            onRetry={() => {
              void tasksQuery.refetch();
              void meetingsQuery.refetch();
            }}
          />
        ) : taskTrendData.length === 0 && meetingVolumeData.length === 0 ? (
          <EmptyState
            title="No analytics available"
            description="Once tasks and meetings are available, trend charts will appear here."
          />
        ) : (
          <OverviewCharts
            taskTrendData={taskTrendData}
            meetingVolumeData={meetingVolumeData}
            selectedDueDate={selectedDueDate}
            onTaskTrendPointSelect={handleTaskTrendPointSelect}
            onMeetingVolumeSelect={handleMeetingVolumeSelect}
          />
        )}
      </section>

      <section>
        {tasksQuery.isLoading ? (
          <div className="app-card p-4">
            <SkeletonBlock className="h-4 w-44" />
            <SkeletonBlock className="mt-4 h-10 w-full" />
            <SkeletonBlock className="mt-3 h-12 w-full" />
            <SkeletonBlock className="mt-2 h-12 w-full" />
          </div>
        ) : tasksQuery.isError ? (
          <ErrorState
            message="We could not load tasks right now. Please try again."
            onRetry={() => {
              void tasksQuery.refetch();
            }}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks to display"
            description="When the extraction pipeline starts producing tasks, this table will update automatically."
          />
        ) : (
          <TasksTable
            data={filteredTasksForTable}
            overallTotal={tasks.length}
            onCreateTask={openCreateDialog}
            onEditTask={openEditDialog}
            contextFilters={contextFilters}
          />
        )}
      </section>

      <TaskFormDialog
        open={dialogOpen}
        mode={dialogMode}
        task={selectedTask}
        submitting={isSubmitting}
        onClose={closeDialog}
        onSubmit={handleSubmitTask}
      />
    </div>
  );
}
