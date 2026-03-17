import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  owner: z.string().min(2, "Owner is required"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  project: z.string().min(2, "Project is required"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
