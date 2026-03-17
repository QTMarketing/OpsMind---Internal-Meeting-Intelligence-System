import "dotenv/config";
import fs from "fs";
import path from "path";

/**
 * test-upload.ts
 * 
 * Usage: npx tsx test-upload.ts <path_to_audio_file>
 * 
 * This script sends a real audio file to the local API endpoint to test
 * the full AI pipeline (Upload -> Transcribe -> Extract -> DB).
 */

async function testUpload() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("❌ Please provide a path to an audio file (e.g., sample.mp3)");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`🚀 Starting test upload for: ${filePath}`);

  const url = "http://localhost:3000/api/upload";
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "audio/mpeg" });
  const filename = path.basename(filePath);

  const formData = new FormData();
  formData.append("audio", blob, filename);

  try {
    console.log(`📤 Sending POST request to ${url}...`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const result = await response.json();

    if (response.ok) {
      console.log(`✅ Success! (Took ${duration}s)`);
      console.log("\n--- Processed Meeting Result ---");
      console.log(JSON.stringify(result.meeting, null, 2));
    } else {
      console.error(`❌ Upload failed with status ${response.status}:`);
      console.error(JSON.stringify(result, null, 2));
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Request error:", err.message);
  }
}

testUpload();
