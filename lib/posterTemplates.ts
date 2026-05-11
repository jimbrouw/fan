import type { TeamProfile } from "@/lib/teamProfiles";

export type PosterStyle = {
  id: string;
  name: string;
  description: string;
};

export const posterStyles: PosterStyle[] = [
  { id: "hero-card", name: "Football Card", description: "A clean player-card look with club colours." },
  { id: "matchday", name: "VS Match Poster", description: "A bold home-vs-away poster with matchday energy." },
  { id: "player-reveal", name: "Star Player Poster", description: "A dramatic star-player poster with strong lighting." }
];

export function getDefaultPosterStyleIdForCreateMode(mode: "single" | "vs") {
  return mode === "vs" ? "matchday" : "hero-card";
}

export function getPosterStyle(id: string) {
  return posterStyles.find((style) => style.id === id) ?? posterStyles[0];
}

export function buildTargetPosterSvg(input: {
  team: Pick<TeamProfile, "name" | "primary" | "accent" | "kitNotes">;
  styleName: string;
}) {
  const teamName = escapeSvg(input.team.name.toUpperCase());
  const styleName = escapeSvg(input.styleName.toUpperCase());
  const kitNotes = escapeSvg(input.team.kitNotes);
  const primary = input.team.primary;
  const accent = input.team.accent;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="58%" stop-color="#090b10"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="light" cx="50%" cy="24%" r="62%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".34"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1600" fill="url(#bg)"/>
  <rect width="1200" height="1600" fill="url(#light)"/>
  <g opacity=".16" stroke="#fff" stroke-width="2">
    <path d="M120 230h960M120 1370h960M190 120v1360M1010 120v1360"/>
    <circle cx="600" cy="800" r="270" fill="none"/>
  </g>
  <g transform="translate(600 706)">
    <ellipse cx="0" cy="518" rx="260" ry="42" fill="#000" opacity=".34"/>
    <circle cx="0" cy="-238" r="104" fill="#d8b08b"/>
    <path d="M-86 -262c24-86 158-92 196-17 10-89-74-145-165-125-83 18-125 85-102 154 18-16 41-20 71-12z" fill="#20150e"/>
    <path d="M-170 -94c52-75 288-75 340 0l92 372c11 44-21 87-66 87h-392c-45 0-77-43-66-87z" fill="${primary}"/>
    <path d="M-120 -48c68 37 172 37 240 0l36 422h-312z" fill="${accent}" opacity=".94"/>
    <path d="M-318 -16c-54 118-73 211-57 279 10 44 67 55 93 18l142-203-54-122z" fill="${primary}"/>
    <path d="M318 -16c54 118 73 211 57 279-10 44-67 55-93 18L140 78l54-122z" fill="${primary}"/>
    <path d="M-154 362h116l-18 366h-126zM38 362h116l28 366H56z" fill="#14161d"/>
    <path d="M-198 733h156v52h-180c-20 0-30-25-15-38 12-10 25-14 39-14zM42 733h156c14 0 27 4 39 14 15 13 5 38-15 38H42z" fill="${accent}"/>
  </g>
  <text x="96" y="148" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="800" fill="#fff" letter-spacing="10">${styleName}</text>
  <text x="96" y="1420" font-family="Inter, Arial, sans-serif" font-size="84" font-weight="900" fill="#fff">${teamName}</text>
  <foreignObject x="96" y="1460" width="1008" height="74">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Inter,Arial,sans-serif;font-size:26px;line-height:1.35;color:rgba(255,255,255,.78);">${kitNotes}</div>
  </foreignObject>
</svg>`;
}

function escapeSvg(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
