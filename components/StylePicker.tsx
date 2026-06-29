"use client";

import { clsx } from "clsx";
import { PORTRAIT_STYLES, type PortraitStyle } from "@/lib/bingo/portraitStyles";

type StylePickerProps = {
  selected: string | null;
  onChange: (styleId: string) => void;
};

function StyleThumbnail({ style, selected }: { style: PortraitStyle; selected: boolean }) {
  const t = style.thumbnail;

  return (
    <button
      onClick={() => {}}
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-[14px] border-2 text-left transition-all duration-200 active:scale-[0.97]",
        selected
          ? "border-[var(--accent)] shadow-[0_0_0_3px_rgba(204,0,0,0.18)]"
          : "border-transparent hover:border-[var(--line)]"
      )}
      aria-pressed={selected}
      aria-label={style.name}
    >
      {/* Thumbnail image area */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={{ background: t.background }}
      >
        {/* Simulated face silhouette */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pb-4">
          {/* Head circle */}
          <div
            className="relative flex h-[42%] w-[58%] items-center justify-center rounded-full"
            style={{ background: `${t.foreground}22`, border: `2px solid ${t.foreground}44` }}
          >
            <span className="text-[clamp(18px,5vw,26px)] leading-none" role="img">
              {t.emoji}
            </span>
          </div>
          {/* Shoulders */}
          <div
            className="h-[22%] w-[80%] rounded-t-[50%]"
            style={{ background: `${t.foreground}18` }}
          />
        </div>

        {/* Style-specific texture overlay */}
        {style.id === "comic" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "6px 6px",
            }}
          />
        )}
        {style.id === "pop-art" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
              backgroundSize: "8px 8px",
            }}
          />
        )}
        {style.id === "sketch" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #636366 0, #636366 1px, transparent 0, transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />
        )}
        {style.id === "watercolour" && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.6) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.4) 0%, transparent 50%)",
            }}
          />
        )}

        {/* Selected check */}
        {selected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[12px] font-black text-white shadow-md">
            ✓
          </div>
        )}

        {/* Accent strip at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: t.accent }}
        />
      </div>

      {/* Label */}
      <div className="bg-[var(--surface)] px-2.5 py-2">
        <p className="text-[12px] font-bold leading-tight text-[var(--foreground)]">
          {style.name}
        </p>
        <p className="mt-0.5 text-[10px] leading-tight text-[var(--muted)]">
          {style.description}
        </p>
      </div>
    </button>
  );
}

export function StylePicker({ selected, onChange }: StylePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-semibold uppercase tracking-[0.07em] text-[var(--muted)]">
          Choose a style
        </label>
        {selected && (
          <span className="text-[12px] font-semibold text-[var(--accent)]">
            {PORTRAIT_STYLES.find((s) => s.id === selected)?.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {PORTRAIT_STYLES.map((style) => (
          <div key={style.id} onClick={() => onChange(style.id)}>
            <StyleThumbnail style={style} selected={selected === style.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
