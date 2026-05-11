export type TeamProfile = {
  id: string;
  name: string;
  group: "Premier League" | "EFL League One" | "International" | "World Cup 2026" | "International Giants" | "Custom";
  primary: string;
  accent: string;
  kitNotes: string;
  trophy?: string;
};

export const customTeamId = "custom";

export const teamProfiles: TeamProfile[] = [
  // World Cup 2026
  { id: "canada", name: "Canada", group: "World Cup 2026", primary: "#FF0000", accent: "#FFFFFF", kitNotes: "Red home shirt with white accents, white shorts, red socks. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "mexico", name: "Mexico", group: "World Cup 2026", primary: "#006847", accent: "#FFFFFF", kitNotes: "Green shirt with white shorts and red socks. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "usa", name: "USA", group: "World Cup 2026", primary: "#FFFFFF", accent: "#002868", kitNotes: "White shirt with navy and red accents, navy shorts. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "australia", name: "Australia", group: "World Cup 2026", primary: "#FFCD00", accent: "#00843D", kitNotes: "Gold shirt with green shorts and gold socks." },
  { id: "iraq", name: "Iraq", group: "World Cup 2026", primary: "#FFFFFF", accent: "#007A33", kitNotes: "White shirt with green accents, white shorts." },
  { id: "iran", name: "IR Iran", group: "World Cup 2026", primary: "#FFFFFF", accent: "#DA291C", kitNotes: "White shirt with red and green accents." },
  { id: "japan", name: "Japan", group: "World Cup 2026", primary: "#00008B", accent: "#FFFFFF", kitNotes: "Blue shirt with white accents, blue shorts." },
  { id: "jordan", name: "Jordan", group: "World Cup 2026", primary: "#FFFFFF", accent: "#CE1126", kitNotes: "White shirt with red accents." },
  { id: "south-korea", name: "Korea Republic", group: "World Cup 2026", primary: "#FF0000", accent: "#000000", kitNotes: "Red shirt with black accents, black shorts." },
  { id: "qatar", name: "Qatar", group: "World Cup 2026", primary: "#8A1538", accent: "#FFFFFF", kitNotes: "Maroon shirt with white accents." },
  { id: "saudi-arabia", name: "Saudi Arabia", group: "World Cup 2026", primary: "#FFFFFF", accent: "#006C35", kitNotes: "White shirt with green accents." },
  { id: "uzbekistan", name: "Uzbekistan", group: "World Cup 2026", primary: "#FFFFFF", accent: "#0099B5", kitNotes: "White shirt with blue accents." },
  { id: "algeria", name: "Algeria", group: "World Cup 2026", primary: "#FFFFFF", accent: "#006633", kitNotes: "White shirt with green accents." },
  { id: "cabo-verde", name: "Cabo Verde", group: "World Cup 2026", primary: "#003893", accent: "#FFFFFF", kitNotes: "Blue shirt with white and red accents." },
  { id: "congo-dr", name: "Congo DR", group: "World Cup 2026", primary: "#007FFF", accent: "#CE1126", kitNotes: "Blue shirt with red and yellow accents." },
  { id: "cote-divoire", name: "Côte d'Ivoire", group: "World Cup 2026", primary: "#FF8200", accent: "#FFFFFF", kitNotes: "Orange shirt with white accents." },
  { id: "egypt", name: "Egypt", group: "World Cup 2026", primary: "#CE1126", accent: "#FFFFFF", kitNotes: "Red shirt with white accents." },
  { id: "ghana", name: "Ghana", group: "World Cup 2026", primary: "#FFFFFF", accent: "#000000", kitNotes: "White shirt with black accents and a black star." },
  { id: "morocco", name: "Morocco", group: "World Cup 2026", primary: "#C1272D", accent: "#006233", kitNotes: "Red shirt with green accents." },
  { id: "senegal", name: "Senegal", group: "World Cup 2026", primary: "#FFFFFF", accent: "#00853F", kitNotes: "White shirt with green accents." },
  { id: "south-africa", name: "South Africa", group: "World Cup 2026", primary: "#FFCD00", accent: "#007A33", kitNotes: "Yellow shirt with green accents." },
  { id: "tunisia", name: "Tunisia", group: "World Cup 2026", primary: "#FFFFFF", accent: "#E41B17", kitNotes: "White shirt with red accents." },
  { id: "curacao", name: "Curaçao", group: "World Cup 2026", primary: "#002B7F", accent: "#FFFF00", kitNotes: "Blue shirt with yellow accents." },
  { id: "haiti", name: "Haiti", group: "World Cup 2026", primary: "#00209F", accent: "#D21034", kitNotes: "Blue shirt with red accents." },
  { id: "panama", name: "Panama", group: "World Cup 2026", primary: "#DA121A", accent: "#FFFFFF", kitNotes: "Red shirt with white accents." },
  { id: "argentina", name: "Argentina", group: "World Cup 2026", primary: "#75AADB", accent: "#FFFFFF", kitNotes: "Light blue and white vertical stripes, black shorts." },
  { id: "brazil", name: "Brazil", group: "World Cup 2026", primary: "#FEDF00", accent: "#009739", kitNotes: "Yellow shirt with green trim, blue shorts." },
  { id: "colombia", name: "Colombia", group: "World Cup 2026", primary: "#FCD116", accent: "#003893", kitNotes: "Yellow shirt with blue and red accents." },
  { id: "ecuador", name: "Ecuador", group: "World Cup 2026", primary: "#FFD100", accent: "#0033A0", kitNotes: "Yellow shirt with blue accents." },
  { id: "paraguay", name: "Paraguay", group: "World Cup 2026", primary: "#D52B1E", accent: "#FFFFFF", kitNotes: "Red and white vertical stripes, blue shorts." },
  { id: "uruguay", name: "Uruguay", group: "World Cup 2026", primary: "#0081C6", accent: "#FFFFFF", kitNotes: "Sky blue shirt with black shorts." },
  { id: "new-zealand", name: "New Zealand", group: "World Cup 2026", primary: "#FFFFFF", accent: "#000000", kitNotes: "All white kit with black accents." },
  { id: "austria", name: "Austria", group: "World Cup 2026", primary: "#ED2939", accent: "#FFFFFF", kitNotes: "Red shirt with white accents." },
  { id: "belgium", name: "Belgium", group: "World Cup 2026", primary: "#BA0C2F", accent: "#000000", kitNotes: "Red shirt with black and yellow accents." },
  { id: "bosnia", name: "Bosnia and Herzegovina", group: "World Cup 2026", primary: "#002395", accent: "#FECB00", kitNotes: "Blue shirt with yellow accents." },
  { id: "croatia", name: "Croatia", group: "World Cup 2026", primary: "#FF0000", accent: "#FFFFFF", kitNotes: "Red and white checkers, white shorts." },
  { id: "czechia", name: "Czechia", group: "World Cup 2026", primary: "#D7141A", accent: "#FFFFFF", kitNotes: "Red shirt with white and blue accents." },
  { id: "england-wc", name: "England", group: "World Cup 2026", primary: "#FFFFFF", accent: "#000040", kitNotes: "Official 2024 Nike home kit: White shirt with 'Blue Void' accents, unique multi-coloured St George's Cross on back of collar. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "france", name: "France", group: "World Cup 2026", primary: "#002395", accent: "#FFFFFF", kitNotes: "Blue shirt with white and red accents. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "germany", name: "Germany", group: "World Cup 2026", primary: "#FFFFFF", accent: "#000000", kitNotes: "White shirt with black, red, and gold accents. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "netherlands", name: "Netherlands", group: "World Cup 2026", primary: "#FF4F00", accent: "#000000", kitNotes: "Orange shirt with black accents. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },
  { id: "norway", name: "Norway", group: "World Cup 2026", primary: "#EF2B2D", accent: "#00205B", kitNotes: "Red shirt with blue and white accents." },
  { id: "portugal", name: "Portugal", group: "World Cup 2026", primary: "#FF0000", accent: "#006600", kitNotes: "Red shirt with green accents." },
  { id: "scotland", name: "Scotland", group: "World Cup 2026", primary: "#002B5C", accent: "#FFFFFF", kitNotes: "Dark blue shirt with white accents." },
  { id: "spain", name: "Spain", group: "World Cup 2026", primary: "#AA151B", accent: "#F1BF00", kitNotes: "Red shirt with yellow accents." },
  { id: "sweden", name: "Sweden", group: "World Cup 2026", primary: "#FECC00", accent: "#006AA7", kitNotes: "Yellow shirt with blue accents." },
  { id: "switzerland", name: "Switzerland", group: "World Cup 2026", primary: "#D52B1E", accent: "#FFFFFF", kitNotes: "Red shirt with white accents." },
  { id: "turkiye", name: "Türkiye", group: "World Cup 2026", primary: "#E30A17", accent: "#FFFFFF", kitNotes: "Red shirt with white crescent and star. FIFA World Cup logo on sleeve.", trophy: "FIFA World Cup" },

  // International Giants (Clubs)
  { id: "real-madrid", name: "Real Madrid", group: "International Giants", primary: "#FFFFFF", accent: "#000000", kitNotes: "2024/25 Home Kit: Minimalist white design with black accents. Features a subtle, bespoke houndstooth pattern woven into the fabric with 'RM' initials. UCL badge on sleeve.", trophy: "Champions League Trophy" },
  { id: "barcelona", name: "FC Barcelona", group: "International Giants", primary: "#004D98", accent: "#A50044", kitNotes: "Classic Blaugrana vertical stripes, yellow accents, club crest on chest. UCL badge on sleeve.", trophy: "Champions League Trophy" },
  { id: "bayern-munich", name: "Bayern Munich", group: "International Giants", primary: "#DC052D", accent: "#FFFFFF", kitNotes: "Red body with white accents, clean German powerhouse identity. UCL badge on sleeve.", trophy: "Champions League Trophy" },

  // Premier League
  { id: "arsenal", name: "Arsenal", group: "Premier League", primary: "#d71920", accent: "#ffffff", kitNotes: "2024/25 Home Kit: Classic red base with white logos, dark blue side labels, featuring the return of the iconic 'Canon' crest on chest. Premier League badge on sleeve.", trophy: "Premier League Trophy" },
  { id: "aston-villa", name: "Aston Villa", group: "Premier League", primary: "#95bfe5", accent: "#670e36", kitNotes: "Claret body with sky-blue sleeves, white shorts, claret and blue identity cues. Premier League badge on sleeve.", trophy: "Premier League Trophy" },
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
  { id: "man-city", name: "Manchester City", group: "Premier League", primary: "#6cabdd", accent: "#ffffff", kitNotes: "2024/25 Home Kit: Traditional sky blue with navy and white accents, featuring '0161' graffiti-inspired pattern on the collar and cuffs. Premier League badge on sleeve.", trophy: "Premier League Trophy" },
  { id: "man-united", name: "Manchester United", group: "Premier League", primary: "#da291c", accent: "#111111", kitNotes: "2024/25 Home Kit: Red shirt with deep gradient pattern, white shorts, black socks. Premier League badge on sleeve.", trophy: "Premier League Trophy" },
  { id: "newcastle", name: "Newcastle United", group: "Premier League", primary: "#111111", accent: "#ffffff", kitNotes: "Black and white striped shirt, black shorts, high-contrast Tyneside identity." },
  { id: "nottingham-forest", name: "Nottingham Forest", group: "Premier League", primary: "#dd0000", accent: "#ffffff", kitNotes: "Red shirt, white shorts, clean Forest crest placement and simple trim." },
  { id: "sunderland", name: "Sunderland", group: "Premier League", primary: "#eb172b", accent: "#ffffff", kitNotes: "Red and white striped home identity, black shorts, Wearside club palette." },
  { id: "tottenham", name: "Tottenham Hotspur", group: "Premier League", primary: "#ffffff", accent: "#132257", kitNotes: "White shirt, navy shorts, minimal navy detailing, clean Spurs home identity." },
  { id: "west-ham", name: "West Ham United", group: "Premier League", primary: "#7a263a", accent: "#1bb1e7", kitNotes: "Claret shirt with blue sleeves or blue accents, white shorts." },
  { id: "wolves", name: "Wolverhampton Wanderers", group: "Premier League", primary: "#fdb913", accent: "#231f20", kitNotes: "Old-gold shirt with black trim, black shorts, strong Wolves contrast." },
  { id: "mansfield", name: "Mansfield Town", group: "EFL League One", primary: "#f6c400", accent: "#0057b8", kitNotes: "Amber and blue Mansfield Town identity, amber shirt, blue trim, football-league badge placement." },
  { id: "england", name: "England", group: "International", primary: "#ffffff", accent: "#0b1f5d", kitNotes: "Official 2024 Nike home kit: White shirt with 'Blue Void' accents, unique multi-coloured St George's Cross on back of collar.", trophy: "European Championship Trophy" },
  { id: customTeamId, name: "Custom team", group: "Custom", primary: "#ffffff", accent: "#5fd3ff", kitNotes: "" }
];

export function getTeamProfile(id: string) {
  return teamProfiles.find((team) => team.id === id) ?? teamProfiles[0];
}
