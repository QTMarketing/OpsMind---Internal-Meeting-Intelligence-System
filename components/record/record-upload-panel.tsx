"use client";

import { useRef, useState } from "react";
import { ErrorState } from "@/components/foundation/error-state";
import { SkeletonBlock } from "@/components/foundation/skeleton-block";
import { useToast } from "@/components/providers/toast-provider";
import { useUploadAudioMutation } from "@/lib/query/dashboard-query";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

type UploadStatus = "idle" | "uploading" | "success" | "failed";

function isAudioFile(file: File) {
  return file.type.startsWith("audio/");
}

export function RecordUploadPanel() {
  const { pushToast } = useToast();
  const uploadMutation = useUploadAudioMutation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (!isAudioFile(file)) return "Only audio files are supported.";
    if (file.size > MAX_FILE_SIZE_BYTES) return "Audio file must be smaller than 25 MB.";
    return null;
  }

  function handlePickFile(file: File | null) {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setSelectedFile(null);
      setUploadStatus("failed");
      setLastError(error);
      pushToast({ tone: "error", title: "Invalid file", message: error });
      return;
    }
    setSelectedFile(file);
    setUploadStatus("idle");
    setLastError(null);
  }

  async function uploadSelectedFile() {
    if (!selectedFile) return;
    try {
      setUploadStatus("uploading");
      setProgress(0);
      const result = await uploadMutation.mutateAsync({
        file: selectedFile,
        onProgress: setProgress,
      });
      setUploadStatus("success");
      setLastError(null);
      pushToast({
        tone: "success",
        title: "Upload successful",
        message: `Meeting ${result.meetingId} was uploaded and is being processed.`,
      });
    } catch {
      setUploadStatus("failed");
      setLastError("We could not upload this file.");
      pushToast({
        tone: "error",
        title: "Upload failed",
        message: "Please check your connection and try again.",
      });
    }
  }

  return (
    <div className="space-y-4">
      <section
        className={`app-card p-4 transition-colors ${dragActive ? "bg-surface-muted" : ""}`}
        role="group"
        tabIndex={0}
        aria-label="Audio file drop zone"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragActive(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files?.[0] ?? null;
          handlePickFile(file);
        }}
      >
        <h2 className="text-sm font-semibold text-foreground">Audio Upload</h2>
        <p className="mt-1 text-sm text-muted">
          Drag and drop an audio file, or choose one manually. Supported formats use standard
          audio MIME types.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(event) => handlePickFile(event.target.files?.[0] ?? null)}
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="app-button app-button-ghost hover:bg-surface-muted"
          >
            Choose Audio
          </button>
          <button
            type="button"
            onClick={uploadSelectedFile}
            disabled={!selectedFile || uploadStatus === "uploading"}
            className="app-button app-button-primary disabled:opacity-60"
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload File"}
          </button>
        </div>

        {selectedFile ? (
          <p className="mt-3 text-sm text-foreground">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </p>
        ) : null}
      </section>

      <section className="app-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Upload Status</h3>
        {uploadStatus === "idle" ? (
          <p className="mt-2 text-sm text-muted">
            Waiting for a validated audio file before upload can begin.
          </p>
        ) : null}
        {uploadStatus === "uploading" ? (
          <div className="mt-3 space-y-2">
            <SkeletonBlock className="h-2 w-full" />
            <p className="text-sm text-foreground">Uploading... {progress}%</p>
          </div>
        ) : null}
        {uploadStatus === "success" ? (
          <p className="mt-2 text-sm text-success" role="status" aria-live="polite">
            Upload complete. File has been queued for transcription.
          </p>
        ) : null}
        {uploadStatus === "failed" && lastError ? (
          <ErrorState
            message={`${lastError} Confirm the file is valid and try again.`}
            retryLabel="Retry upload"
            onRetry={selectedFile ? uploadSelectedFile : undefined}
          />
        ) : null}
      </section>
    </div>
  );
}
