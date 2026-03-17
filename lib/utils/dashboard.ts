import type { Meeting, Task, TaskStatus } from "@/lib/types/dashboard";

export function normalizeDateKey(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input.slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

export function formatShortDate(input: string) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFullDate(input: string) {
  const date = new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getTaskStatusCount(tasks: Task[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status).length;
}

export function getStatusTone(status: TaskStatus) {
  if (status === "completed") return "text-success";
  if (status === "blocked") return "text-destructive";
  if (status === "in_progress") return "text-warning";
  if (status === "pending") return "text-muted";
  return "text-foreground";
}

export function buildTaskTrendData(tasks: Task[]) {
  const sorted = [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const byDay = new Map<string, { date: string; dateKey: string; due: number }>();

  for (const task of sorted) {
    const key = normalizeDateKey(task.deadline);
    const current = byDay.get(key) ?? { date: formatShortDate(key), dateKey: key, due: 0 };
    current.due += 1;
    byDay.set(key, current);
  }

  return [...byDay.values()];
}

export function buildMeetingVolumeData(meetings: Meeting[]) {
  const sorted = [...meetings].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return sorted.map((meeting) => ({
    date: formatShortDate(meeting.createdAt),
    dateKey: normalizeDateKey(meeting.createdAt),
    meetings: 1,
    tasks: meeting.taskCount,
  }));
}
