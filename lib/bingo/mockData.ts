const PORTRAIT_COLORS: [string, string][] = [
  ["#CC0000", "#FF5500"],   // red → orange-red
  ["#FFFFFF", "#CC0000"],   // white → red
  ["#880000", "#CC0000"],   // dark red → red
  ["#CC0000", "#1C0808"],   // red → near-black
  ["#FF5500", "#990000"],   // orange-red → deep red
  ["#CC0000", "#FFFFFF"],   // red → white
  ["#990000", "#880000"],   // deep red → dark red
  ["#1C0808", "#CC0000"],   // near-black → red
];

const PLAYER_NAMES = [
  "Alex", "Jordan", "Sam", "Taylor",
  "Casey", "Morgan", "Riley", "Jamie",
  "Drew", "Blake", "Quinn", "Reese",
  "Avery", "Finley", "Peyton", "Skyler",
];

export const MOCK_EVENT = {
  id: "evt-demo",
  name: "AI Bingo",
  code: "BINGO01",
  status: "active" as "waiting" | "active" | "complete",
  playerCount: 14,
  portraitCount: 14,
};

export const MOCK_PORTRAITS = PLAYER_NAMES.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  colors: PORTRAIT_COLORS[i % PORTRAIT_COLORS.length],
}));

// Portraits already called by the host — main diagonal (p1, p6, p11, p16)
// Grid positions: 0→(0,0), 5→(1,1), 10→(2,2), 15→(3,3)
export const MOCK_CALLED_IDS = ["p1", "p6", "p11", "p16"];

// Current portrait being displayed by host
export const MOCK_CURRENT_PORTRAIT = MOCK_PORTRAITS[15]; // Skyler (last called)

export type Portrait = (typeof MOCK_PORTRAITS)[number];
export type BingoEvent = typeof MOCK_EVENT;
