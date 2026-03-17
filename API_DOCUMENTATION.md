# OpsMind API Documentation

This document provides technical details for the OpsMind Intelligence System backend APIs.

## Base URL
The default development base URL is `http://localhost:3000`.

---

## 1. Meetings API

### GET `/api/meetings`
Returns a list of all processed meetings.

**Response (200 OK):**
```json
{
  "meetings": [
    {
      "id": "string",
      "title": "string",
      "date": "ISO8601 Date",
      "summary": "string",
      "createdAt": "ISO8601 Date",
      "_count": {
        "tasks": "number",
        "decisions": "number",
        "ideas": "number"
      }
    }
  ]
}
```

### GET `/api/meetings/[id]`
Returns full details for a specific meeting, including all extracted items.

**Response (200 OK):**
```json
{
  "meeting": {
    "id": "string",
    "title": "string",
    "date": "ISO8601 Date",
    "transcript": "string",
    "summary": "string",
    "tasks": [ ... ],
    "decisions": [ ... ],
    "ideas": [ ... ]
  }
}
```

---

## 2. Tasks API

### GET `/api/tasks`
Returns a list of all tasks. 

**Query Parameters:**
- `status`: Filter by status (`pending`, `in_progress`, `done`).

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "status": "string",
      "assignee": "string|null",
      "dueDate": "ISO8601 Date|null",
      "meetingId": "string"
    }
  ],
  "total": "number"
}
```

### POST `/api/tasks`
Manually creates a new task for a specified meeting.

**Request Body:**
```json
{
  "title": "string (Required)",
  "meetingId": "string (Required)",
  "assignee": "string (Optional)",
  "description": "string (Optional)",
  "dueDate": "ISO8601 Date (Optional)"
}
```

### PATCH `/api/tasks/[id]`
Updates an existing task.

**Request Body (Any field is optional):**
```json
{
  "title": "string",
  "status": "string (pending | in_progress | done)",
  "assignee": "string",
  "description": "string",
  "dueDate": "ISO8601 Date"
}
```

### DELETE `/api/tasks/[id]`
Permanently removes a task.

---

## 3. Upload & AI Pipeline

### POST `/api/upload`
Uploads an audio file and triggers the AI transcription and extraction pipeline.

**Request:**
- `Content-Type: multipart/form-data`
- Body: `audio` (File)

**Processing Steps:**
1. Upload to storage (Supabase).
2. Transcribe via Whisper-1.
3. Extract entities via GPT-4o.
4. Save to PostgreSQL.

**Response (200 OK):**
```json
{
  "success": true,
  "meeting": { ... }
}
```
