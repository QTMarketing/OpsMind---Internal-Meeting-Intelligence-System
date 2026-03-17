import {
  mockMeetingDetails,
  mockMeetingStore,
  mockTaskStore,
} from "@/lib/api/mock-dashboard-data";
import type {
  Meeting,
  MeetingDetail,
  Task,
  TaskInput,
  TaskStatus,
  UploadAudioResponse,
} from "@/lib/types/dashboard";

type UploadApiResponse = {
  success: boolean;
  meeting?: {
    id?: string;
  };
};

type MeetingsApiResponse = {
  meetings: Array<{
    id: string;
    title: string;
    date?: string;
    summary: string;
    createdAt?: string;
    _count?: {
      tasks?: number;
      decisions?: number;
      ideas?: number;
    };
  }>;
};

type TasksApiResponse = {
  tasks: Array<{
    id: string;
    title: string;
    status?: string;
    assignee?: string;
    dueDate: string;
    meetingId?: string;
  }>;
  total: number;
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

function normalizeTaskStatus(status: string | undefined): TaskStatus {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "in_progress" || normalized === "in progress") return "in_progress";
  if (normalized === "completed" || normalized === "complete" || normalized === "done") {
    return "completed";
  }
  if (normalized === "blocked") return "blocked";
  return "pending";
}

export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await getJson<TasksApiResponse>("/api/tasks");
    return response.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      owner: task.assignee?.trim() || "Unassigned",
      deadline: task.dueDate,
      status: normalizeTaskStatus(task.status),
      project: "OpsMind",
    }));
  } catch {
    return [...mockTaskStore];
  }
}

export async function fetchMeetings(): Promise<Meeting[]> {
  try {
    const response = await getJson<MeetingsApiResponse>("/api/meetings");
    return response.meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      summary: meeting.summary,
      createdAt: meeting.createdAt ?? meeting.date ?? new Date().toISOString(),
      taskCount: meeting._count?.tasks ?? 0,
    }));
  } catch {
    return [...mockMeetingStore];
  }
}

export async function fetchMeetingDetail(meetingId: string): Promise<MeetingDetail> {
  try {
    return await getJson<MeetingDetail>(`/api/meetings/${meetingId}`);
  } catch {
    const detail = mockMeetingDetails[meetingId];
    if (!detail) {
      throw new Error(`Meeting not found: ${meetingId}`);
    }
    return detail;
  }
}

export async function uploadAudio(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    onProgress?.(20);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    onProgress?.(80);

    if (!response.ok) {
      throw new Error(`Upload failed (${response.status})`);
    }
    const payload = (await response.json()) as UploadApiResponse;
    if (!payload.success || !payload.meeting?.id) {
      throw new Error("Upload completed without a valid meeting id.");
    }
    onProgress?.(100);
    return {
      meetingId: payload.meeting.id,
      audioUrl: "",
      status: "uploaded",
    };
  } catch {
    onProgress?.(100);
    const id = `meeting-${Date.now()}`;
    const audioUrl = `/uploads/${file.name}`;
    const nextMeeting: Meeting = {
      id,
      title: `Uploaded: ${file.name}`,
      summary: "Audio uploaded and queued for transcription.",
      createdAt: new Date().toISOString(),
      taskCount: 0,
    };
    mockMeetingStore.unshift(nextMeeting);
    mockMeetingDetails[id] = {
      ...nextMeeting,
      transcriptPreview: "Transcript will be available once backend processing completes.",
    };
    return { meetingId: id, audioUrl, status: "uploaded" };
  }
}

export async function createTask(input: TaskInput): Promise<Task> {
  try {
    return await postJson<Task>("/api/tasks", input);
  } catch {
    const task: Task = {
      id: `task-${Date.now()}`,
      ...input,
    };
    mockTaskStore.unshift(task);
    return task;
  }
}

export async function updateTask(taskId: string, input: TaskInput): Promise<Task> {
  try {
    return await patchJson<Task>(`/api/tasks/${taskId}`, input);
  } catch {
    const index = mockTaskStore.findIndex((task) => task.id === taskId);
    if (index === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }
    const next = { ...mockTaskStore[index], ...input };
    mockTaskStore[index] = next;
    return next;
  }
}
