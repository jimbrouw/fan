import fs from 'fs';

const wcTeamsJson = JSON.parse(fs.readFileSync('scratch/wc_teams.json', 'utf8'));

const teamProfilesMap: Record<string, string[]> = {
  "canada": ["Canada"],
  "mexico": ["Mexico"],
  "usa": ["United States", "USA"],
  "australia": ["Australia"],
  "iraq": ["Iraq"],
  "iran": ["Iran", "IR Iran"],
  "japan": ["Japan"],
  "jordan": ["Jordan"],
  "south-korea": ["Korea Republic", "South Korea"],
  "qatar": ["Qatar"],
  "saudi-arabia": ["Saudi Arabia"],
  "uzbekistan": ["Uzbekistan"],
  "algeria": ["Algeria"],
  "cabo-verde": ["Cabo Verde", "Cape Verde"],
  "congo-dr": ["Congo DR", "Democratic Republic of the Congo", "DR Congo"],
  "cote-divoire": ["Côte d'Ivoire", "Ivory Coast"],
  "egypt": ["Egypt"],
  "ghana": ["Ghana"],
  "morocco": ["Morocco"],
  "senegal": ["Senegal"],
  "south-africa": ["South Africa"],
  "tunisia": ["Tunisia"],
  "curacao": ["Curaçao"],
  "haiti": ["Haiti"],
  "panama": ["Panama"],
  "argentina": ["Argentina"],
  "brazil": ["Brazil"],
  "colombia": ["Colombia"],
  "ecuador": ["Ecuador"],
  "paraguay": ["Paraguay"],
  "uruguay": ["Uruguay"],
  "new-zealand": ["New Zealand"],
  "austria": ["Austria"],
  "belgium": ["Belgium"],
  "bosnia": ["Bosnia and Herzegovina", "Bosnia"],
  "croatia": ["Croatia"],
  "czechia": ["Czechia", "Czech Republic"],
  "england-wc": ["England"],
  "france": ["France"],
  "germany": ["Germany"],
  "netherlands": ["Netherlands"],
  "norway": ["Norway"],
  "portugal": ["Portugal"],
  "scotland": ["Scotland"],
  "spain": ["Spain"],
  "sweden": ["Sweden"],
  "switzerland": ["Switzerland"],
  "turkiye": ["Türkiye", "Turkey"],
};

const mappings: string[] = [];
const apiTeams = wcTeamsJson.teams;

for (const [id, names] of Object.entries(teamProfilesMap)) {
  const found = apiTeams.find((t: any) => names.includes(t.name) || names.includes(t.shortName));
  if (found) {
    mappings.push(`  "${id}": ${found.id},`);
  } else {
    console.log(`Not found: ${id}`);
  }
}

console.log("\nCopy this into footballDataTeamIds:");
console.log(mappings.join("\n"));

const types = Object.keys(teamProfilesMap).map(t => `  | "${t}"`).join("\n");
console.log("\nCopy this into FootballDataTeamId:");
console.log(types);
