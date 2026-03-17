import type { Meeting, Task, TaskStatus } from "@/lib/types/dashboard";

export function normalizeDateKey(input: string) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input.slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

export function formatShortDate(input: string) {
  if (!input) return "N/A";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFullDate(input: string) {
  if (!input) return "N/A";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "N/A";
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
  const sorted = [...tasks].sort((a, b) => {
    // Handle both mock data 'deadline' and Prisma 'dueDate'
    const aDate = (a as any).dueDate || a.deadline || new Date().toISOString();
    const bDate = (b as any).dueDate || b.deadline || new Date().toISOString();
    
    // Convert to Date objects to sort safely instead of relying on localeCompare on potential null/undefined
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
  
  const byDay = new Map<string, { date: string; dateKey: string; due: number }>();

  for (const task of sorted) {
    const rawDate = (task as any).dueDate || task.deadline || new Date().toISOString();
    const key = normalizeDateKey(rawDate);
    const current = byDay.get(key) ?? { date: formatShortDate(key), dateKey: key, due: 0 };
    current.due += 1;
    byDay.set(key, current);
  }

  return [...byDay.values()];
}

export function buildMeetingVolumeData(meetings: Meeting[]) {
  const sorted = [...meetings].sort((a, b) => {
    // Handle missing createdAt by falling back to current date
    const aDate = a.createdAt || new Date().toISOString();
    const bDate = b.createdAt || new Date().toISOString();
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });
  
  return sorted.map((meeting) => ({
    date: formatShortDate(meeting.createdAt || new Date().toISOString()),
    dateKey: normalizeDateKey(meeting.createdAt || new Date().toISOString()),
    meetings: 1,
    tasks: meeting.taskCount || 0,
  }));
}
