import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.FOOTBALL_DATA_API_KEY;

async function run() {
  const response = await fetch("https://api.football-data.org/v4/competitions/WC/teams", {
    headers: { "X-Auth-Token": apiKey! }
  });
  
  if (!response.ok) {
    console.error(await response.text());
    process.exit(1);
  }
  
  const data = await response.json();
  const teams = data.teams.map((t: any) => ({ id: t.id, name: t.name, tla: t.tla }));
  console.log(JSON.stringify(teams, null, 2));
}

run();
