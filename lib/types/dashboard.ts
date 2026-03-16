export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";

export type Task = {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
  project: string;
};

export type Meeting = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  taskCount: number;
};

export type MeetingDetail = Meeting & {
  transcriptPreview: string;
};

export type TaskInput = {
  title: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
  project: string;
};

export type UploadAudioResponse = {
  meetingId: string;
  audioUrl: string;
  status: "uploaded";
};
