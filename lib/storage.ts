import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for server-side operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Uploads an audio file to the Supabase 'audio' bucket.
 * 
 * @param file - The audio file as a Buffer or Blob.
 * @param fileName - Desired name for the file in storage.
 * @returns The public URL of the uploaded file.
 */
export async function uploadAudio(file: Buffer | Blob, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("meeting-audio")
    .upload(fileName, file, {
      contentType: "audio/mpeg", // Or detect from extension
      upsert: true,
    });

  if (error) {
    console.error("[Storage] Upload failed:", error);
    throw new Error(`Failed to upload audio to storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("meeting-audio")
    .getPublicUrl(data.path);

  return publicUrl;
}
