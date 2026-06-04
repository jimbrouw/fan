import * as fs from "fs";

async function main() {
  const resultsPath = "scratch/flat_lay_away_results.json";
  const specsPath = "lib/kitSpecs.ts";
  
  if (!fs.existsSync(resultsPath)) {
    console.error("❌ results file not found! Scraper might still be running.");
    process.exit(1);
  }
  
  const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8")) as Record<string, string>;
  let specsContent = fs.readFileSync(specsPath, "utf-8");
  
  console.log("Applying away kit patches to lib/kitSpecs.ts...");
  let updatedCount = 0;
  let insertedCount = 0;
  
  for (const [teamId, publicUrl] of Object.entries(results)) {
    // 1. Check if the away kit entry already exists for this team in kitSpecs
    const awayRegex = new RegExp(`(teamId:\\s*"${teamId}".*?variant:\\s*"away".*?referenceImageUrl:\\s*")[^"]*(")`);
    
    if (awayRegex.test(specsContent)) {
      // It exists! Just update its referenceImageUrl.
      specsContent = specsContent.replace(awayRegex, `$1${publicUrl}$2`);
      console.log(`  ✓ Updated existing ${teamId} away kit URL`);
      updatedCount++;
    } else {
      // It doesn't exist. Find the home kit entry for this team to duplicate its structure.
      const homeRegex = new RegExp(`(\\s*\\{\\s*teamId:\\s*"${teamId}",.*?variant:\\s*"home",.*?\\})`);
      const homeMatch = specsContent.match(homeRegex);
      
      if (homeMatch) {
        const homeLine = homeMatch[1];
        
        // Construct the away line by copying and modifying the home line:
        let awayLine = homeLine
          .replace(/variant:\s*"home"/, 'variant: "away"')
          .replace(/pattern:\s*"[^"]*"/, 'pattern: "away shirt"')
          .replace(/referenceImageUrl:\s*"[^"]*"/, `referenceImageUrl: "${publicUrl}"`)
          .replace(/sourceUrls:\s*\[[^\]]*\]/, 'sourceUrls: []')
          .replace(/confidence:\s*"[^"]*"/, 'confidence: "low"');
          
        // Insert the away line immediately after the home line in the file content
        specsContent = specsContent.replace(homeLine, `${homeLine},\n${awayLine}`);
        console.log(`  + Inserted new ${teamId} away kit spec`);
        insertedCount++;
      } else {
        console.warn(`  ⚠️ Could not find home kit spec for teamId: "${teamId}" to duplicate for away kit`);
      }
    }
  }
  
  fs.writeFileSync(specsPath, specsContent);
  console.log(`\n🎉 Away Kit Patching Completed: ${insertedCount} inserted, ${updatedCount} updated.`);
}

main().catch(err => {
  console.error("❌ Patching failed:", err);
  process.exit(1);
});
