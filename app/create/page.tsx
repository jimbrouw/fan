"use client";

import { BadgeCheck, Shirt, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { posterStyles } from "@/lib/posterTemplates";
import { customTeamId, getTeamProfile, teamProfiles } from "@/lib/teamProfiles";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  imageUrl?: string;
};

export default function CreatePage() {
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState("mansfield");
  const [customTeamName, setCustomTeamName] = useState("");
  const [customKitNotes, setCustomKitNotes] = useState("");
  const [posterStyleId, setPosterStyleId] = useState(posterStyles[0].id);
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedTeam = getTeamProfile(selectedTeamId);
  const isCustomTeam = selectedTeamId === customTeamId;
  const teamName = isCustomTeam ? customTeamName.trim() : selectedTeam.name;
  const kitNotes = isCustomTeam ? customKitNotes.trim() : selectedTeam.kitNotes;
  const groupedTeams = useMemo(
    () =>
      teamProfiles.reduce<Record<string, typeof teamProfiles>>((groups, team) => {
        groups[team.group] = [...(groups[team.group] ?? []), team];
        return groups;
      }, {}),
    []
  );
  const sourceImageUrl = useMemo(
    () =>
      captures.find((capture) => capture.type === "neutral_front")?.imageUrl ??
      captures.find((capture) => capture.imageUrl)?.imageUrl,
    [captures]
  );
  const canSubmit = teamName && kitNotes && posterStyleId && sourceImageUrl && sessionId;

  useEffect(() => {
    setSessionId(localStorage.getItem("fan-hero-session-id"));
    setCaptures(JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[]);
  }, []);

  async function submitJob() {
    if (!canSubmit || !sourceImageUrl || !sessionId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionId,
            sourceImageUrl,
            posterStyleId,
            teamProfile: {
              name: teamName,
              primary: selectedTeam.primary,
              accent: selectedTeam.accent,
              kitNotes
            },
            teamName,
            kitNotes
          })
      });

      const data = (await response.json()) as { jobId?: string; error?: string };
      if (!response.ok || !data.jobId) {
        throw new Error(data.error ?? "Generation job failed.");
      }

      router.push(`/generating/${data.jobId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation job failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-none tracking-[-0.03em]">Create poster.</h1>
          <p className="text-sm leading-6 text-white/62">
            Pick the team and poster style. The app uses your best captured pose as the image target.
          </p>
        </div>

        <form className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Team</span>
            <select
              value={selectedTeamId}
              onChange={(event) => setSelectedTeamId(event.target.value)}
              className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
            >
              {Object.entries(groupedTeams).map(([group, teams]) => (
                <optgroup key={group} label={group} className="bg-[#12151b] text-white">
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {isCustomTeam && (
            <>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Custom team name</span>
                <input
                  value={customTeamName}
                  onChange={(event) => setCustomTeamName(event.target.value)}
                  placeholder="Your club or country"
                  className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Kit profile</span>
                <textarea
                  value={customKitNotes}
                  onChange={(event) => setCustomKitNotes(event.target.value)}
                  placeholder="Home colours, away colours, badge direction, shirt number ideas"
                  className="min-h-28 w-full resize-none rounded-lg border border-white/12 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
                />
              </label>
            </>
          )}

          <div className="rounded-lg border border-white/10 bg-black/24 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/46">
              <Shirt size={15} />
              Kit profile
            </div>
            <p className="text-sm leading-6 text-white/70">{kitNotes || "Add kit colours for your custom team."}</p>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Poster style</span>
            <select
              value={posterStyleId}
              onChange={(event) => setPosterStyleId(event.target.value)}
              className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
            >
              {posterStyles.map((style) => (
                <option key={style.id} value={style.id} className="bg-[#12151b] text-white">
                  {style.name}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-white/46">
              {posterStyles.find((style) => style.id === posterStyleId)?.description}
            </p>
          </label>
        </form>

        <div className="rounded-lg border border-white/10 bg-black/24 p-4 text-sm leading-6 text-white/58">
          <div className="flex gap-3">
            <BadgeCheck size={18} className={sourceImageUrl ? "mt-1 text-[var(--accent-blue)]" : "mt-1 text-white/28"} />
            <span>
              {sourceImageUrl
                ? "Reference image ready. The AI will use your face to generate a photorealistic poster."
                : "Take at least one capture so the AI can learn your face."}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-white/76">
            {error}
          </div>
        )}

        <Button type="button" disabled={!canSubmit || isSubmitting} onClick={submitJob} className="mt-auto w-full">
          <WandSparkles size={17} />
          {isSubmitting ? "Starting..." : "Start Generation"}
        </Button>
      </section>
    </AppFrame>
  );
}
