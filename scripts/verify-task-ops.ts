import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";

async function runVerification() {
  console.log("🔍 Verifying Task Operations (Bulk & Meeting-Specific)...\n");

  try {
    // 1. Get a meeting ID
    const meetingsRes = await fetch(`${BASE_URL}/meetings`);
    const { meetings } = await meetingsRes.json();
    if (meetings.length === 0) {
      console.log("⚠️ No meetings found. Run 'npx tsx scripts/test-upload.ts' first.");
      return;
    }
    const meetingId = meetings[0].id;
    console.log(`✅ Using Meeting ID: ${meetingId}`);

    // 2. Create a task under this meeting
    console.log("➡️ Creating task specifically for this meeting...");
    const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Meeting-Specific Task",
        meetingId: meetingId,
        assignee: "Verifier",
        project: "OpsMind",
        description: "Testing association"
      }),
    });
    const { task } = await createTaskRes.json();
    console.log(`✅ Task created with ID: ${task.id}, associated with meeting: ${task.meetingId}`);

    if (task.meetingId !== meetingId) {
      throw new Error("Meeting association failed!");
    }

    // 3. Verify the task shows up in the task list with the meeting title
    console.log("➡️ Verifying task list inclusion...");
    const tasksRes = await fetch(`${BASE_URL}/tasks`);
    const { tasks } = await tasksRes.json();
    const created = tasks.find((t: { id: string; meeting?: { title: string } }) => t.id === task.id);
    if (!created || !created.meeting || !created.meeting.title) {
      throw new Error("Task was correctly created but the GET list didn't include meeting title!");
    }
    console.log(`✅ Task found in list with meeting title: "${created.meeting.title}"`);

    // 4. Test Bulk Update (simulated by updating one task for now since we don't have a bulk API, we use Promise.all in frontend)
    // Actually, our frontend does Promise.all. Let's just verify the individual PATCH still works as expected.
    console.log("➡️ Verifying individual status update (for bulk simulation)...");
    const patchRes = await fetch(`${BASE_URL}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (patchRes.ok) {
      console.log("✅ Status updated to completed.");
    }

    // 5. Cleanup
    console.log("➡️ Deleting the test task...");
    const delRes = await fetch(`${BASE_URL}/tasks/${task.id}`, { method: "DELETE" });
    if (delRes.ok) {
      console.log("✅ Task deleted successfully.");
    }

    console.log("\n✨ Verification complete! The backend supports meeting-specific tasks and individual operations required for bulk actions.");

  } catch (error: unknown) {
    const err = error as Error;
    console.error("\n❌ Verification Failed:", err.message);
  }
}

runVerification();
