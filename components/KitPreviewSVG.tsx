export function KitPreviewSVG() {
  return (
    <svg
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-label="Arsenal home kit preview"
    >
      <defs>
        {/* Subtle mesh texture on red body */}
        <pattern id="mesh" patternUnits="userSpaceOnUse" width="6" height="6">
          <rect width="6" height="6" fill="transparent" />
          <circle cx="3" cy="3" r="0.8" fill="#c0001a" opacity="0.5" />
        </pattern>
        <clipPath id="bodyOnly">
          <path d="M70,66 L70,185 L130,185 L130,66 Q115,58 100,56 Q85,58 70,66Z" />
        </clipPath>
        <clipPath id="leftSleeve">
          <path d="M63,48 L18,78 L13,108 L38,108 L43,82 L70,66 Q66,44 63,48Z" />
        </clipPath>
        <clipPath id="rightSleeve">
          <path d="M137,48 L182,78 L187,108 L162,108 L157,82 L130,66 Q134,44 137,48Z" />
        </clipPath>
      </defs>

      {/* ── Full jersey silhouette (red base) ── */}
      <path
        d="M63,48 L18,78 L13,108 L38,108 L43,82 L43,185 L157,185 L157,82 L162,108 L187,108 L182,78 L137,48 Q122,40 114,36 L114,54 Q100,60 86,54 L86,36 Q78,40 63,48Z"
        fill="#D0011B"
      />

      {/* Mesh texture on red body only */}
      <rect x="43" y="60" width="114" height="125" fill="url(#mesh)" clipPath="url(#bodyOnly)" />

      {/* ── White raglan sleeve panels ── */}
      {/* Left */}
      <path
        d="M63,48 L18,78 L13,108 L38,108 L43,82 L70,66 Q66,44 63,48Z"
        fill="white"
      />
      {/* Right */}
      <path
        d="M137,48 L182,78 L187,108 L162,108 L157,82 L130,66 Q134,44 137,48Z"
        fill="white"
      />

      {/* ── Dark maroon 3-stripes on left sleeve ── */}
      {/* Each stripe is a thin diagonal band across the white panel */}
      <line x1="52" y1="50" x2="26" y2="84" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="61" y1="48" x2="35" y2="82" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="70" y1="46" x2="44" y2="80" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />

      {/* ── Dark maroon 3-stripes on right sleeve ── */}
      <line x1="148" y1="50" x2="174" y2="84" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="139" y1="48" x2="165" y2="82" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="130" y1="46" x2="156" y2="80" stroke="#5C0020" strokeWidth="4.5" strokeLinecap="round" />

      {/* ── Collar — dark maroon crew neck ── */}
      <path
        d="M86,36 Q86,24 100,22 Q114,24 114,36 L114,54 Q100,60 86,54 Z"
        fill="#5C0020"
      />
      {/* Collar inner highlight */}
      <path
        d="M89,38 Q89,28 100,26 Q111,28 111,38 L111,52 Q100,57 89,52 Z"
        fill="#7A0028"
      />

      {/* ── Dark maroon cuffs ── */}
      <rect x="13" y="98" width="25" height="10" rx="2" fill="#5C0020" />
      <rect x="162" y="98" width="25" height="10" rx="2" fill="#5C0020" />
      {/* Cuff texture lines */}
      <line x1="17" y1="102" x2="34" y2="102" stroke="#7A0028" strokeWidth="1" />
      <line x1="17" y1="105" x2="34" y2="105" stroke="#7A0028" strokeWidth="1" />
      <line x1="166" y1="102" x2="183" y2="102" stroke="#7A0028" strokeWidth="1" />
      <line x1="166" y1="105" x2="183" y2="105" stroke="#7A0028" strokeWidth="1" />

      {/* ── Adidas 3-bars logo — white, left chest ── */}
      <g fill="white">
        <rect x="62" y="72" width="5" height="18" rx="1" transform="rotate(-8 62 72)" />
        <rect x="70" y="70" width="5" height="18" rx="1" transform="rotate(-8 70 70)" />
        <rect x="78" y="68" width="5" height="18" rx="1" transform="rotate(-8 78 68)" />
      </g>

      {/* ── Arsenal shield crest — right chest ── */}
      <g transform="translate(108, 68)">
        {/* Shield shape */}
        <path d="M0,0 L18,0 L18,20 Q9,26 0,20 Z" fill="white" />
        {/* Inner details - simplified cannon */}
        <rect x="3" y="8" width="12" height="3" rx="1.5" fill="#D0011B" />
        <circle cx="5" cy="13" r="2" stroke="#D0011B" strokeWidth="1" fill="none" />
        <circle cx="13" cy="13" r="2" stroke="#D0011B" strokeWidth="1" fill="none" />
        {/* "Arsenal" text on crest */}
        <text x="9" y="6" textAnchor="middle" fontSize="3.5" fontWeight="800" fontFamily="Arial" fill="#D0011B" letterSpacing="0.2">ARSENAL</text>
      </g>

      {/* ── Emirates sponsor — white ── */}
      <text
        x="100"
        y="122"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill="white"
        letterSpacing="0.3"
      >
        Emirates
      </text>

      {/* ── FLY BETTER — white ── */}
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        fontFamily="'Arial Black', Arial, sans-serif"
        fill="white"
        letterSpacing="2.5"
      >
        FLY BETTER
      </text>
    </svg>
  );
}
