import type { Meeting, MeetingDetail, Task } from "@/lib/types/dashboard";

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize meeting transcript pipeline review",
    owner: "Sachit",
    deadline: "2026-03-18",
    status: "in_progress",
    project: "OpsMind",
  },
  {
    id: "task-2",
    title: "Prepare dashboard KPI definitions",
    owner: "Aryan",
    deadline: "2026-03-19",
    status: "pending",
    project: "OpsMind",
  },
  {
    id: "task-3",
    title: "Audit upload flow edge states",
    owner: "Sachit",
    deadline: "2026-03-20",
    status: "blocked",
    project: "OpsMind",
  },
  {
    id: "task-4",
    title: "Ship Phase 1 UI foundation",
    owner: "Aryan",
    deadline: "2026-03-16",
    status: "completed",
    project: "OpsMind",
  },
  {
    id: "task-5",
    title: "Review table selection interactions",
    owner: "Sachit",
    deadline: "2026-03-22",
    status: "pending",
    project: "OpsMind",
  },
];

export const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "MVP Delivery Planning",
    summary: "Aligned on frontend and backend ownership for Phase 2 execution.",
    createdAt: "2026-03-12T10:00:00.000Z",
    taskCount: 4,
  },
  {
    id: "meeting-2",
    title: "Dashboard UX Review",
    summary: "Validated calm design direction and low cognitive load principles.",
    createdAt: "2026-03-13T11:15:00.000Z",
    taskCount: 3,
  },
  {
    id: "meeting-3",
    title: "API Contract Alignment",
    summary: "Defined typed payload expectations for tasks and meetings.",
    createdAt: "2026-03-14T09:30:00.000Z",
    taskCount: 5,
  },
  {
    id: "meeting-4",
    title: "Table & Chart Requirements",
    summary: "Confirmed sorting, filtering, selection, and chart clarity standards.",
    createdAt: "2026-03-15T13:20:00.000Z",
    taskCount: 2,
  },
  {
    id: "meeting-5",
    title: "Phase 2 Build Kickoff",
    summary: "Started dashboard data integration and state handling implementation.",
    createdAt: "2026-03-16T08:45:00.000Z",
    taskCount: 6,
  },
];

export const mockTaskStore: Task[] = [...mockTasks];
export const mockMeetingStore: Meeting[] = [...mockMeetings];

export const mockMeetingDetails: Record<string, MeetingDetail> = {
  "meeting-1": {
    ...mockMeetings[0],
    transcriptPreview:
      "Aligned on ownership split, with frontend focused on dashboard polish and backend on extraction APIs.",
  },
  "meeting-2": {
    ...mockMeetings[1],
    transcriptPreview:
      "Reviewed low cognitive-load layout rules and finalized calm visual hierarchy standards.",
  },
  "meeting-3": {
    ...mockMeetings[2],
    transcriptPreview:
      "Confirmed typed contract boundaries for tasks and meetings query payloads.",
  },
  "meeting-4": {
    ...mockMeetings[3],
    transcriptPreview:
      "Validated table sorting/filtering and chart requirements for decision-oriented monitoring.",
  },
  "meeting-5": {
    ...mockMeetings[4],
    transcriptPreview:
      "Kicked off Phase 2 implementation and verified query-driven state and fallback behavior.",
  },
};
