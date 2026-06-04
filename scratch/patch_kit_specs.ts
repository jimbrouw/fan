import * as fs from "fs";
import * as path from "path";

async function main() {
  const resultsPath = "scratch/flat_lay_results.json";
  const specsPath = "lib/kitSpecs.ts";
  
  if (!fs.existsSync(resultsPath)) {
    console.error("❌ results file not found! Scraper might still be running.");
    process.exit(1);
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8")) as Record<string, string>;
  let specsContent = fs.readFileSync(specsPath, "utf-8");
  
  console.log("Applying patches to lib/kitSpecs.ts...");
  let count = 0;
  
  // Also manually add Mexico, USA, France, and Germany which we successfully scraped in the previous run!
  results["mexico"] = "https://gldtjiofbokiqcordale.supabase.co/storage/v1/object/public/kit-images/international/mexico/home.jpg";
  results["usa"] = "https://gldtjiofbokiqcordale.supabase.co/storage/v1/object/public/kit-images/international/usa/home.jpg";
  results["france"] = "https://gldtjiofbokiqcordale.supabase.co/storage/v1/object/public/kit-images/international/france/home.jpg";
  results["germany"] = "https://gldtjiofbokiqcordale.supabase.co/storage/v1/object/public/kit-images/international/germany/home.jpg";
  
  for (const [teamId, publicUrl] of Object.entries(results)) {
    // We want to find the line for the international kit spec and update the referenceImageUrl field.
    // E.g. find: teamId: "england" and on that same line replace referenceImageUrl: "..." with publicUrl
    const regex = new RegExp(`(teamId:\\s*"${teamId}".*?referenceImageUrl:\\s*")[^"]+(")`, "g");
    
    if (regex.test(specsContent)) {
      specsContent = specsContent.replace(regex, `$1${publicUrl}$2`);
      console.log(`  ✓ Updated ${teamId} kit image url`);
      count++;
    } else {
      console.warn(`  ⚠️ Could not find teamId: "${teamId}" with referenceImageUrl inside kitSpecs.ts`);
    }
  }
  
  fs.writeFileSync(specsPath, specsContent);
  console.log(`🎉 Patched ${count} team kit specs successfully!`);
}

main().catch(err => {
  console.error("❌ Patching failed:", err);
  process.exit(1);
});
