import "dotenv/config";

const BASE_URL = "http://localhost:3000/api";

async function runTests() {
  console.log("🔍 Starting API Test Suite...\n");

  try {
    // 1. Test GET /api/meetings (List)
    console.log("➡️ Testing GET /api/meetings...");
    const meetingsRes = await fetch(`${BASE_URL}/meetings`);
    const { meetings } = await meetingsRes.json();
    console.log(`✅ Found ${meetings.length} meetings.`);

    if (meetings.length > 0) {
      const sampleId = meetings[0].id;

      // 2. Test GET /api/meetings/[id] (Detail)
      console.log(`➡️ Testing GET /api/meetings/${sampleId}...`);
      const detailRes = await fetch(`${BASE_URL}/meetings/${sampleId}`);
      if (detailRes.ok) {
        console.log("✅ Successfully fetched meeting detail.");
      } else {
        console.error("❌ Failed to fetch meeting detail.");
      }

      // 3. Test POST /api/tasks (Manual Create)
      console.log("➡️ Testing POST /api/tasks...");
      const newTaskRes = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Manual Task",
          meetingId: sampleId,
          assignee: "Test Runner",
          description: "Created by automated suite"
        }),
      });
      const { task } = await newTaskRes.json();
      console.log(`✅ Task created with ID: ${task.id}`);

      // 4. Test PATCH /api/tasks/[id] (Update)
      console.log(`➡️ Testing PATCH /api/tasks/${task.id}...`);
      const updateRes = await fetch(`${BASE_URL}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (updateRes.ok) {
        console.log("✅ Task status updated to in_progress.");
      }

      // 5. Test DELETE /api/tasks/[id] (Cleanup)
      console.log(`➡️ Testing DELETE /api/tasks/${task.id}...`);
      const deleteRes = await fetch(`${BASE_URL}/tasks/${task.id}`, {
        method: "DELETE"
      });
      if (deleteRes.ok) {
        console.log("✅ Task cleanup successful.");
      }
    } else {
      console.log("⚠️ No meetings found in DB. Skipping detail and task tests.");
      console.log("💡 Run 'npx tsx test-upload.ts' first to seed some data.");
    }

    // 6. Test GET /api/tasks (List)
    console.log("➡️ Testing GET /api/tasks...");
    const tasksRes = await fetch(`${BASE_URL}/tasks`);
    const { total } = await tasksRes.json();
    console.log(`✅ Found ${total} total tasks in system.`);

  } catch (error: any) {
    console.error("\n❌ Test Suite Error:", error.message);
    console.log("\n💡 Make sure the dev server is running with 'npm run dev'.");
  }

  console.log("\n🏁 API Test Suite Finished.");
}

runTests();
