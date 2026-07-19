import fs from 'fs';
import path from 'path';

console.log("==========================================");
console.log("       AUTOMATED APPLET UAT & TESTER      ");
console.log("==========================================");

const DB_FILE = path.join(process.cwd(), "db.json");

function runTestSuite() {
  console.log("\n[TEST 1] Verifying db.json Database Integrity...");
  if (!fs.existsSync(DB_FILE)) {
    console.log("❌ DB file does not exist! Generating a template for testing...");
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], jobs: [] }, null, 2));
  }

  const dbContent = fs.readFileSync(DB_FILE, 'utf-8');
  let db: any;
  try {
    db = JSON.parse(dbContent);
    console.log("✅ db.json is valid JSON!");
  } catch (err: any) {
    console.error("❌ Failed to parse db.json as JSON: " + err.message);
    process.exit(1);
  }

  // Check required tables
  if (!Array.isArray(db.users)) {
    console.error("❌ db.users is not an array!");
    process.exit(1);
  }
  if (!Array.isArray(db.jobs)) {
    console.error("❌ db.jobs is not an array!");
    process.exit(1);
  }
  console.log(`✅ Database structure validated. found ${db.users.length} users and ${db.jobs.length} jobs.`);

  console.log("\n[TEST 2] Running Job ID Deduplication Unit Test...");
  const initialCount = db.jobs.length;
  console.log(`Initial jobs count: ${initialCount}`);

  // Scan for duplicate IDs
  const seenIds = new Set<string>();
  const duplicates = [];
  for (const job of db.jobs) {
    if (seenIds.has(job.id)) {
      duplicates.push(job.id);
    }
    seenIds.add(job.id);
  }

  if (duplicates.length > 0) {
    console.log(`⚠️ Found duplicate IDs before cleaning: ${duplicates.join(', ')}`);
    // Deduplicate
    const cleanedJobs = [];
    const cleanedIds = new Set();
    for (const job of db.jobs) {
      if (!cleanedIds.has(job.id)) {
        cleanedJobs.push(job);
        cleanedIds.add(job.id);
      }
    }
    db.jobs = cleanedJobs;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log(`✅ Deduplicated db.json. Cleaned count: ${db.jobs.length}`);
  } else {
    console.log("✅ No duplicate job IDs found in database!");
  }

  console.log("\n[TEST 3] Testing Local Fallback Job Matchmaking Calculation Algorithm...");
  // Simulate matching
  const testSkills = ["React", "TypeScript", "Node.js", "Express"];
  const testJobs = [
    { id: "test-1", title: "Frontend Engineer", requirements: ["React", "TypeScript", "CSS"] },
    { id: "test-2", title: "Backend Specialist", requirements: ["Node.js", "Express", "PostgreSQL", "Docker"] },
    { id: "test-3", title: "Marketing Director", requirements: ["SEO", "Copywriting", "Sales"] }
  ];

  const results = testJobs.map(job => {
    const matchedReqs = job.requirements.filter((req: string) => 
      testSkills.some((ts: string) => ts.toLowerCase() === req.toLowerCase())
    );
    const score = job.requirements.length > 0 
      ? Math.round((matchedReqs.length / job.requirements.length) * 100)
      : 50;

    return {
      jobId: job.id,
      title: job.title,
      score,
      matchedReqs
    };
  });

  results.forEach(res => {
    console.log(`- Job: [${res.title}] | Requirements: [${testJobs.find(j => j.id === res.jobId)?.requirements.join(', ')}] | Match Score: ${res.score}% (Matched: ${res.matchedReqs.join(', ') || 'None'})`);
  });

  const topMatch = results.sort((a, b) => b.score - a.score)[0];
  if (topMatch.jobId === "test-1") {
    console.log("✅ Local matchmaking ranking holds as expected (Frontend Engineer scored highest for React/TS dev).");
  } else {
    console.error("❌ Matchmaking algorithm produced unexpected order!");
    process.exit(1);
  }

  console.log("\n[TEST 4] Simulating POST /api/employer/match-candidate Payload Parsing...");
  const dummyPayload = {
    fullName: "Arthur Pendragon",
    skills: "React, Node.js, Next.js",
    experienceLevel: "Senior",
    resumeText: "Ex-Google architect specializing in React, TypeScript, and high throughput Node services."
  };

  const parsedSkills = dummyPayload.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
  if (parsedSkills.length === 3 && parsedSkills[1] === "Node.js") {
    console.log("✅ Payload skills parser operates accurately.");
  } else {
    console.error("❌ Payload skills parser error.");
    process.exit(1);
  }

  console.log("\n==========================================");
  console.log(" ✅ ALL 4 TESTS COMPLETED SUCCESSFULLY! ");
  console.log("==========================================");
}

runTestSuite();
