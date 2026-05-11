import assert from "node:assert/strict";
import test from "node:test";
import { buildMatchdayNotesFromTeamNews } from "../lib/footballData.ts";

test("team news notes restrict generated opposition players to current squad names", () => {
  const notes = buildMatchdayNotesFromTeamNews({
    opponent: {
      teamName: "Manchester United",
      squadNames: ["Bruno Fernandes", "Kobbie Mainoo", "Leny Yoro"],
      latestMatch: "2026-05-10 Manchester United vs Chelsea"
    },
    selectedTeam: {
      teamName: "Nottingham Forest",
      squadNames: ["Morgan Gibbs-White", "Murillo"]
    }
  });

  assert.match(notes, /Allowed Manchester United players: Bruno Fernandes, Kobbie Mainoo, Leny Yoro/i);
  assert.match(notes, /Do not show players not in the current squads/i);
  assert.match(notes, /Latest Manchester United match: 2026-05-10 Manchester United vs Chelsea/i);
  assert.ok(notes.length <= 420);
});
