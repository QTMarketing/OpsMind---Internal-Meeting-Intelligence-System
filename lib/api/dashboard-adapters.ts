import {
  mockMeetingDetails,
  mockMeetingStore,
  mockTaskStore,
} from "@/lib/api/mock-dashboard-data";
import type {
  Meeting,
  MeetingDetail,
  MeetingUpdateInput,
  Task,
  TaskInput,
  UploadAudioResponse,
} from "@/lib/types/dashboard";

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

export async function fetchTasks(): Promise<Task[]> {
  try {
    const data = await getJson<{ tasks: Task[] }>("/api/tasks");
    return data.tasks;
  } catch {
    return [...mockTaskStore];
  }
}

export async function fetchMeetings(): Promise<Meeting[]> {
  try {
    const data = await getJson<{ meetings: Meeting[] }>("/api/meetings");
    return data.meetings;
  } catch {
    return [...mockMeetingStore];
  }
}

export async function fetchMeetingDetail(meetingId: string): Promise<MeetingDetail> {
  try {
    const data = await getJson<{ meeting: MeetingDetail }>(`/api/meetings/${meetingId}`);
    return data.meeting;
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
  formData.append("audio", file);

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
    onProgress?.(100);
    return (await response.json()) as UploadAudioResponse;
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

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed (${response.status})`);
    }
  } catch {
    const index = mockTaskStore.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      mockTaskStore.splice(index, 1);
    }
  }
}

export async function updateMeeting(
  meetingId: string,
  input: MeetingUpdateInput,
): Promise<Meeting> {
  try {
    const data = await patchJson<{ meeting: Meeting }>(`/api/meetings/${meetingId}`, input);
    return data.meeting;
  } catch {
    const index = mockMeetingStore.findIndex((m) => m.id === meetingId);
    if (index === -1) {
      throw new Error(`Meeting not found: ${meetingId}`);
    }
    const next = { ...mockMeetingStore[index], ...input };
    mockMeetingStore[index] = next;
    
    // Also update detail if exists
    if (mockMeetingDetails[meetingId]) {
      mockMeetingDetails[meetingId] = { ...mockMeetingDetails[meetingId], ...input };
    }
    
    return next;
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    const response = await fetch(`/api/meetings/${meetingId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed (${response.status})`);
    }
  } catch {
    const index = mockMeetingStore.findIndex((m) => m.id === meetingId);
    if (index !== -1) {
      mockMeetingStore.splice(index, 1);
      delete mockMeetingDetails[meetingId];
    }
  }
}
