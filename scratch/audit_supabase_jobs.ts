import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.resolve(process.cwd(), ".env.local");
let url = "";
let serviceRoleKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      url = line.split("=")[1].trim();
    }
    if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = line.split("=")[1].trim();
    }
  }
}

if (!url || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function auditDatabase() {
  console.log("Auditing generation jobs in Supabase...");
  
  // Query last 10 jobs
  const { data: jobs, error } = await supabase
    .from("generation_jobs")
    .select("id, user_id, team_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    console.error("Error reading jobs:", error.message);
    return;
  }

  console.log(`\nFound ${jobs.length} recent generation jobs:`);
  jobs.forEach((j: any) => {
    console.log(`- [Job: ${j.id.slice(0, 8)}] Team: ${j.team_name} | User ID: ${j.user_id || "null"} | Status: ${j.status} | Created: ${j.created_at}`);
  });

  // Query profiles / users if table exists
  const { data: profiles, error: profError } = await supabase
    .from("user_profiles")
    .select("*")
    .limit(10);

  if (!profError && profiles) {
    console.log(`\nRecent profiles (${profiles.length}):`);
    profiles.forEach((p: any) => {
      console.log(`- User ID: ${p.id} | Email: ${p.email} | Name: ${p.full_name}`);
    });
  } else {
    console.log("\nCould not query user_profiles table (might not exist or be empty):", profError?.message);
  }
}

auditDatabase();
