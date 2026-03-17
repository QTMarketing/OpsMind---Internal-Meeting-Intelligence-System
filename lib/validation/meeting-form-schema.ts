import { z } from "zod";

export const meetingFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  summary: z.string().min(1, "Summary is required").max(500, "Summary is too long"),
});

export type MeetingFormValues = z.infer<typeof meetingFormSchema>;
