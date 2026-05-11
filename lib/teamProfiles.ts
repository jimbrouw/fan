export type TeamProfile = {
  id: string;
  name: string;
  group: "Premier League" | "EFL League One" | "International" | "Custom";
  primary: string;
  accent: string;
  kitNotes: string;
};

export const customTeamId = "custom";

export const teamProfiles: TeamProfile[] = [
  { id: "arsenal", name: "Arsenal", group: "Premier League", primary: "#d71920", accent: "#ffffff", kitNotes: "Red home shirt with white sleeves, white shorts, red socks, club crest placement on chest." },
  { id: "aston-villa", name: "Aston Villa", group: "Premier League", primary: "#95bfe5", accent: "#670e36", kitNotes: "Claret body with sky-blue sleeves, white shorts, claret and blue identity cues." },
  { id: "bournemouth", name: "AFC Bournemouth", group: "Premier League", primary: "#da291c", accent: "#111111", kitNotes: "Red and black striped home identity, black shorts, red-and-black detailing." },
  { id: "brentford", name: "Brentford", group: "Premier League", primary: "#e30613", accent: "#ffffff", kitNotes: "Red and white striped home identity, black shorts, bee-inspired accent details." },
  { id: "brighton", name: "Brighton & Hove Albion", group: "Premier League", primary: "#0057b8", accent: "#ffffff", kitNotes: "Blue and white striped home identity, blue shorts, clean seaside club palette." },
  { id: "burnley", name: "Burnley", group: "Premier League", primary: "#6c1d45", accent: "#99d6ea", kitNotes: "Claret shirt with sky-blue detailing, white shorts, traditional Burnley palette." },
  { id: "chelsea", name: "Chelsea", group: "Premier League", primary: "#034694", accent: "#ffffff", kitNotes: "Royal blue home kit, blue shorts, white trim, London club crest placement." },
  { id: "crystal-palace", name: "Crystal Palace", group: "Premier League", primary: "#1b458f", accent: "#c4122e", kitNotes: "Red and blue vertical stripe identity, blue shorts, bold south London palette." },
  { id: "everton", name: "Everton", group: "Premier League", primary: "#003399", accent: "#ffffff", kitNotes: "Royal blue shirt, white shorts, blue socks, clean classic trim." },
  { id: "fulham", name: "Fulham", group: "Premier League", primary: "#ffffff", accent: "#111111", kitNotes: "White shirt with black trim, black shorts, restrained monochrome palette." },
  { id: "leeds", name: "Leeds United", group: "Premier League", primary: "#ffffff", accent: "#ffcd00", kitNotes: "All-white home identity with blue and yellow accent details." },
  { id: "liverpool", name: "Liverpool", group: "Premier League", primary: "#c8102e", accent: "#f6eb61", kitNotes: "Full red home kit, yellow or white accent trim, strong Anfield identity." },
  { id: "man-city", name: "Manchester City", group: "Premier League", primary: "#6cabdd", accent: "#ffffff", kitNotes: "Sky-blue shirt, white shorts, clean light-blue Manchester City palette." },
  { id: "man-united", name: "Manchester United", group: "Premier League", primary: "#da291c", accent: "#111111", kitNotes: "Red shirt, white shorts, black socks, classic Manchester United contrast." },
  { id: "newcastle", name: "Newcastle United", group: "Premier League", primary: "#111111", accent: "#ffffff", kitNotes: "Black and white striped shirt, black shorts, high-contrast Tyneside identity." },
  { id: "nottingham-forest", name: "Nottingham Forest", group: "Premier League", primary: "#dd0000", accent: "#ffffff", kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim." },
  { id: "sunderland", name: "Sunderland", group: "Premier League", primary: "#eb172b", accent: "#ffffff", kitNotes: "Red and white striped home identity, black shorts, Wearside club palette." },
  { id: "tottenham", name: "Tottenham Hotspur", group: "Premier League", primary: "#ffffff", accent: "#132257", kitNotes: "White shirt, navy shorts, minimal navy detailing, clean Spurs home identity." },
  { id: "west-ham", name: "West Ham United", group: "Premier League", primary: "#7a263a", accent: "#1bb1e7", kitNotes: "Claret shirt with blue sleeves or blue accents, white shorts." },
  { id: "wolves", name: "Wolverhampton Wanderers", group: "Premier League", primary: "#fdb913", accent: "#231f20", kitNotes: "Old-gold shirt with black trim, black shorts, strong Wolves contrast." },
  { id: "mansfield", name: "Mansfield Town", group: "EFL League One", primary: "#f6c400", accent: "#0057b8", kitNotes: "Amber and blue Mansfield Town identity, amber shirt, blue trim, football-league badge placement." },
  { id: "england", name: "England", group: "International", primary: "#ffffff", accent: "#0b1f5d", kitNotes: "White England shirt, navy trim, clean national-team styling with restrained red accent." },
  { id: customTeamId, name: "Custom team", group: "Custom", primary: "#ffffff", accent: "#5fd3ff", kitNotes: "" }
];

export function getTeamProfile(id: string) {
  return teamProfiles.find((team) => team.id === id) ?? teamProfiles[0];
}
