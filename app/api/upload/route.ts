import { NextResponse } from "next/server";
import { runAIPipeline } from "@/lib/ai-pipeline";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log(`[Upload API] Received file: ${file.name} (${file.size} bytes)`);

    // Convert File to Buffer for the pipeline
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run the pipeline (Upload -> Transcribe -> Extract -> DB)
    const result = await runAIPipeline(buffer, file.name);

    return NextResponse.json({ 
      success: true, 
      meeting: result 
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Upload API] Error processing upload:", error);
    return NextResponse.json({ 
      error: "Internal server error during processing",
      details: error.message 
    }, { status: 500 });
  }
}
