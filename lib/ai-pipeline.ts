import openai from "./openai";
import { uploadAudio } from "./storage";
import { toFile } from "openai";
import prisma from "@/lib/prisma";

type ExtractedTask = {
  title: string;
  assignee?: string | null;
  dueDate?: string | null;
};

type ExtractedDecision = {
  summary: string;
  madeBy?: string | null;
};

type ExtractedIdea = {
  content: string;
  author?: string | null;
};

type PipelineExtraction = {
  summary?: string;
  tasks?: ExtractedTask[];
  decisions?: ExtractedDecision[];
  ideas?: ExtractedIdea[];
};

export interface ProcessedMeeting {
  id: string;
  transcript: string;
  summary: string;
  tasks: Array<{ title: string; assignee?: string; dueDate?: string }>;
  decisions: Array<{ summary: string; madeBy?: string }>;
  ideas: Array<{ content: string; author?: string }>;
}

/**
 * Orchestrates the full AI pipeline:
 * 1. Uploads audio to storage.
 * 2. Transcribes using Whisper.
 * 3. Extracts structured data using GPT.
 * 4. Saves results to the database.
 */
export async function runAIPipeline(audioFile: Buffer, originalName: string): Promise<ProcessedMeeting> {
  const fileName = `${Date.now()}-${originalName}`;
  
  console.log("[AI Pipeline] Uploading audio...");
  await uploadAudio(audioFile, fileName);

  console.log("[AI Pipeline] Transcribing with Whisper...");
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(audioFile, fileName),
    model: "whisper-1",
  });

  const transcriptText = transcription.text;

  console.log("[AI Pipeline] Extracting entities with GPT...");
  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert secretary. Extract tasks, decisions, and ideas from the following meeting transcript. 
        Format your response as a strict JSON object with the following structure:
        {
          "summary": "Short 2-3 sentence summary of the meeting",
          "tasks": [{ "title": "Task description", "assignee": "Name or null", "dueDate": "ISO date or null" }],
          "decisions": [{ "summary": "Decision description", "madeBy": "Name or null" }],
          "ideas": [{ "content": "Idea description", "author": "Name or null" }]
        }`
      },
      {
        role: "user",
        content: transcriptText
      }
    ],
    response_format: { type: "json_object" }
  });

  const extraction = JSON.parse(
    gptResponse.choices[0].message.content || "{}",
  ) as PipelineExtraction;

  console.log("[AI Pipeline] Saving to database...");
  const meeting = await prisma.meeting.create({
    data: {
      title: originalName.split(".")[0] || "Untitled Meeting",
      date: new Date(),
      transcript: transcriptText,
      summary: extraction.summary ?? "No summary generated.",
      tasks: {
        create: extraction.tasks?.map((t) => ({
          title: t.title,
          assignee: t.assignee ?? null,
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
        })) || []
      },
      decisions: {
        create: extraction.decisions?.map((d) => ({
          summary: d.summary,
          madeBy: d.madeBy ?? null,
        })) || []
      },
      ideas: {
        create: extraction.ideas?.map((i) => ({
          content: i.content,
          author: i.author ?? null,
        })) || []
      }
    },
    include: {
      tasks: true,
      decisions: true,
      ideas: true
    }
  });

  return meeting as unknown as ProcessedMeeting;
}
