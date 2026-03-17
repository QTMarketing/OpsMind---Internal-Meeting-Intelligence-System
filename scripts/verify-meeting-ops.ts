import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";

async function runVerification() {
  console.log("🔍 Starting Meeting Management Verification...\n");

  try {
    // 1. Fetch initial meetings
    console.log("➡️ Fetching initial meetings...");
    const meetingsRes = await fetch(`${BASE_URL}/meetings`);
    const { meetings } = await meetingsRes.json();
    console.log(`✅ Found ${meetings.length} meetings.`);

    if (meetings.length === 0) {
      console.log("⚠️ No meetings found. Please upload a meeting first.");
      return;
    }

    const testMeeting = meetings[0];
    const meetingId = testMeeting.id;
    const originalTitle = testMeeting.title;

    // 2. Test PATCH (Edit)
    console.log(`➡️ Testing PATCH (Edit) for meeting: ${meetingId}...`);
    const updatedTitle = `Updated: ${originalTitle} (Verified)`;
    const patchRes = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: updatedTitle, summary: "Verified update via automated script." }),
    });

    if (!patchRes.ok) {
      throw new Error(`PATCH failed with status ${patchRes.status}`);
    }

    const { meeting: updatedMeeting } = await patchRes.json();
    if (updatedMeeting.title !== updatedTitle) {
      throw new Error(`Title update mismatch! Expected: "${updatedTitle}", Got: "${updatedMeeting.title}"`);
    }
    console.log(`✅ Meeting successfully updated: "${updatedMeeting.title}"`);

    // 3. Test DELETE
    console.log(`➡️ Testing DELETE for meeting: ${meetingId}...`);
    const deleteRes = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: "DELETE",
    });

    if (deleteRes.status !== 204 && !deleteRes.ok) {
      throw new Error(`DELETE failed with status ${deleteRes.status}`);
    }
    console.log("✅ Meeting successfully deleted.");

    // 4. Verify deletion
    console.log("➡️ Verifying deletion in list...");
    const verifyRes = await fetch(`${BASE_URL}/meetings`);
    const { meetings: finalMeetings } = await verifyRes.json();
    const found = finalMeetings.find((m: { id: string }) => m.id === meetingId);
    if (found) {
      throw new Error("Meeting still exists after deletion!");
    }
    console.log("✅ Deletion verified. Meeting no longer in list.");

    console.log("\n✨ Verification complete! Backend meeting management is fully functional.");

  } catch (error: unknown) {
    const err = error as Error;
    console.error("\n❌ Verification Failed:", err.message);
  }
}

runVerification();
