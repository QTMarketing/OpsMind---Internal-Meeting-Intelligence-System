import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTask,
  deleteMeeting,
  deleteTask,
  fetchMeetingDetail,
  fetchMeetings,
  fetchTasks,
  updateMeeting,
  updateTask,
  uploadAudio,
} from "@/lib/api/dashboard-adapters";
import type { Meeting, MeetingUpdateInput, Task, TaskInput } from "@/lib/types/dashboard";

export const dashboardQueryKeys = {
  tasks: ["dashboard", "tasks"] as const,
  meetings: ["dashboard", "meetings"] as const,
  meetingDetail: (meetingId: string) =>
    ["dashboard", "meetings", "detail", meetingId] as const,
};

export function useTasksQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.tasks,
    queryFn: fetchTasks,
  });
}

export function useMeetingsQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.meetings,
    queryFn: fetchMeetings,
  });
}

export function useMeetingDetailQuery(meetingId: string | null) {
  return useQuery({
    queryKey: meetingId ? dashboardQueryKeys.meetingDetail(meetingId) : ["dashboard", "meetings", "detail", "none"],
    queryFn: () => fetchMeetingDetail(meetingId as string),
    enabled: Boolean(meetingId),
  });
}

export function useUploadAudioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => uploadAudio(file, onProgress),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.meetings });
    },
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.tasks });
      const previous = queryClient.getQueryData<Task[]>(dashboardQueryKeys.tasks) ?? [];
      const optimistic: Task = {
        id: `optimistic-${Date.now()}`,
        ...input,
      };
      queryClient.setQueryData<Task[]>(dashboardQueryKeys.tasks, [optimistic, ...previous]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.tasks, context.previous);
      }
    },
    onSuccess: (createdTask) => {
      queryClient.setQueryData<Task[]>(dashboardQueryKeys.tasks, (current = []) => {
        return [createdTask, ...current.filter((task) => !task.id.startsWith("optimistic-"))];
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasks });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: TaskInput }) => updateTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.tasks });
      const previous = queryClient.getQueryData<Task[]>(dashboardQueryKeys.tasks) ?? [];
      queryClient.setQueryData<Task[]>(dashboardQueryKeys.tasks, (current = []) =>
        current.map((task) => (task.id === taskId ? { ...task, ...input } : task)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.tasks, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasks });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.tasks });
      const previous = queryClient.getQueryData<Task[]>(dashboardQueryKeys.tasks) ?? [];
      queryClient.setQueryData<Task[]>(dashboardQueryKeys.tasks, (current = []) =>
        current.filter((task) => task.id !== taskId),
      );
      return { previous };
    },
    onError: (_error, _taskId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.tasks, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasks });
    },
  });
}

export function useBulkUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskIds,
      status,
    }: {
      taskIds: string[];
      status: Task["status"];
    }) => {
      const results = await Promise.all(
        taskIds.map((id) => updateTask(id, { status } as TaskInput)),
      );
      return results;
    },
    onMutate: async ({ taskIds, status }) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.tasks });
      const previous = queryClient.getQueryData<Task[]>(dashboardQueryKeys.tasks) ?? [];
      queryClient.setQueryData<Task[]>(dashboardQueryKeys.tasks, (current = []) =>
        current.map((task) =>
          taskIds.includes(task.id) ? { ...task, status } : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.tasks, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasks });
    },
  });
}

export function useUpdateMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, input }: { meetingId: string; input: MeetingUpdateInput }) =>
      updateMeeting(meetingId, input),
    onMutate: async ({ meetingId, input }) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.meetings });
      const previous = queryClient.getQueryData<Meeting[]>(dashboardQueryKeys.meetings) ?? [];
      queryClient.setQueryData<Meeting[]>(dashboardQueryKeys.meetings, (current = []) =>
        current.map((meeting) => (meeting.id === meetingId ? { ...meeting, ...input } : meeting)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.meetings, context.previous);
      }
    },
    onSettled: (data) => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.meetings });
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.meetingDetail(data.id) });
      }
    },
  });
}

export function useDeleteMeetingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) => deleteMeeting(meetingId),
    onMutate: async (meetingId) => {
      await queryClient.cancelQueries({ queryKey: dashboardQueryKeys.meetings });
      const previous = queryClient.getQueryData<Meeting[]>(dashboardQueryKeys.meetings) ?? [];
      queryClient.setQueryData<Meeting[]>(dashboardQueryKeys.meetings, (current = []) =>
        current.filter((meeting) => meeting.id !== meetingId),
      );
      return { previous };
    },
    onError: (_error, _meetingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dashboardQueryKeys.meetings, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.meetings });
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.tasks });
    },
  });
}

