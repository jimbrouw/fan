"use client";

import { BadgeCheck, Shirt, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { getKitSpec, kitVariants, type KitVariant } from "@/lib/kitSpecs";
import { getDefaultPosterStyleIdForCreateMode, posterStyles } from "@/lib/posterTemplates";
import { customTeamId, getTeamProfile, teamProfiles } from "@/lib/teamProfiles";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  imageUrl?: string;
};

type CreateMode = "single" | "vs";
type MatchSide = "home" | "away";
type OpponentMode = "club-players" | "another-person";

export default function CreatePage() {
  const router = useRouter();
  const [createMode, setCreateMode] = useState<CreateMode>("single");
  const [selectedTeamId, setSelectedTeamId] = useState("mansfield");
  const [customTeamName, setCustomTeamName] = useState("");
  const [customKitNotes, setCustomKitNotes] = useState("");
  const [kitVariant, setKitVariant] = useState<KitVariant>("home");
  const [homeTeamId, setHomeTeamId] = useState("man-united");
  const [awayTeamId, setAwayTeamId] = useState("nottingham-forest");
  const [userSide, setUserSide] = useState<MatchSide>("away");
  const [opponentMode, setOpponentMode] = useState<OpponentMode>("club-players");
  const [matchdayNotes, setMatchdayNotes] = useState("");
  const [isFetchingTeamNews, setIsFetchingTeamNews] = useState(false);
  const [teamNewsError, setTeamNewsError] = useState<string | null>(null);
  const [posterStyleId, setPosterStyleId] = useState(posterStyles[0].id);
  const [selectedModel, setSelectedModel] = useState("wan2.7-image-edit");
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const models = [
    { id: "wan2.7-image-edit", name: "WAN 2.7 Edit", description: "Newer image-edit model with multi-image references. Good test default." },
    { id: "nano-banana-2", name: "Nano Banana 2", description: "Google image-edit model with strong character consistency." },
    { id: "gpt-image-2", name: "GPT Image 2", description: "Advanced prompt adherence using GPT Image 2." },
    { id: "flux-pulid", name: "Flux PuLID", description: "Legacy face-reference model. Use only as a fallback." },
  ];

  const selectedTeam = getTeamProfile(selectedTeamId);
  const isCustomTeam = selectedTeamId === customTeamId;
  const selectedKitSpec = getKitSpec(selectedTeamId, kitVariant);
  const homeTeam = getTeamProfile(homeTeamId);
  const awayTeam = getTeamProfile(awayTeamId);
  const matchTeams = teamProfiles.filter((team) => team.id !== customTeamId);
  const userTeamId = createMode === "vs" ? (userSide === "home" ? homeTeamId : awayTeamId) : selectedTeamId;
  const userTeam = createMode === "vs" ? getTeamProfile(userTeamId) : selectedTeam;
  const userKitVariant: KitVariant = createMode === "vs" ? (userSide === "home" ? "home" : "away") : kitVariant;
  const userKitSpec = getKitSpec(userTeamId, userKitVariant);
  const homeKitSpec = getKitSpec(homeTeamId, "home");
  const awayKitSpec = getKitSpec(awayTeamId, "away");

  function describeTeamKit(teamId: string, variant: KitVariant) {
    const team = getTeamProfile(teamId);
    const spec = getKitSpec(teamId, variant);

    return spec
      ? `${spec.season} ${spec.variant} kit: ${spec.baseColor}; ${spec.pattern}; ${spec.mainSponsor} sponsor; ${spec.manufacturer} manufacturer.`
      : team.kitNotes;
  }

  const teamName = createMode === "single"
    ? isCustomTeam ? customTeamName.trim() : selectedTeam.name
    : userTeam.name;
  const kitNotes = createMode === "single"
    ? isCustomTeam
      ? customKitNotes.trim()
      : describeTeamKit(selectedTeamId, kitVariant)
    : describeTeamKit(userTeamId, userKitVariant);
  const matchContext = createMode === "vs"
    ? {
        homeTeam: {
          name: homeTeam.name,
          primary: homeTeam.primary,
          accent: homeTeam.accent,
          kitNotes: describeTeamKit(homeTeamId, "home"),
          group: homeTeam.group,
          kitVariant: "home" as const
        },
        awayTeam: {
          name: awayTeam.name,
          primary: awayTeam.primary,
          accent: awayTeam.accent,
          kitNotes: describeTeamKit(awayTeamId, "away"),
          group: awayTeam.group,
          kitVariant: "away" as const
        },
        userSide,
        opponentMode,
        matchdayNotes: matchdayNotes.trim().slice(0, 420) || undefined
      }
    : undefined;
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
  const hasValidMatch = createMode === "single" || homeTeamId !== awayTeamId;
  const canSubmit = teamName && kitNotes && posterStyleId && sourceImageUrl && sessionId && hasValidMatch;

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
            teamId: userTeamId,
            posterStyleId,
            model: selectedModel,
            kitVariant: userKitVariant,
            matchContext,
            teamProfile: {
              name: teamName,
              primary: userTeam.primary,
              accent: userTeam.accent,
              kitNotes,
              trophy: userTeam.trophy,
              group: userTeam.group
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

  async function fetchLatestTeamNews() {
    if (createMode !== "vs") return;

    const opponentTeamId = userSide === "away" ? homeTeamId : awayTeamId;
    setIsFetchingTeamNews(true);
    setTeamNewsError(null);

    try {
      const params = new URLSearchParams({
        selectedTeamId: userTeamId,
        opponentTeamId,
      });
      const response = await fetch(`/api/team-news?${params.toString()}`);
      const data = (await response.json()) as { notes?: string; error?: string };

      if (!response.ok || !data.notes) {
        throw new Error(data.error ?? "Team news lookup failed.");
      }

      setMatchdayNotes(data.notes);
    } catch (teamNewsFetchError) {
      setTeamNewsError(teamNewsFetchError instanceof Error ? teamNewsFetchError.message : "Team news lookup failed.");
    } finally {
      setIsFetchingTeamNews(false);
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
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Generation Engine</span>
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#12151b] text-white">
                  {m.name}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-white/46">
              {models.find((m) => m.id === selectedModel)?.description}
            </p>
          </label>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Poster type</legend>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["single", "Single team"],
                ["vs", "VS match"]
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setCreateMode(mode);
                    setPosterStyleId(getDefaultPosterStyleIdForCreateMode(mode));
                  }}
                  className={`h-12 rounded-lg border px-3 text-sm font-semibold transition ${
                    createMode === mode
                      ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/16 text-white"
                      : "border-white/12 bg-white/[0.07] text-white/58 hover:border-white/24 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {createMode === "single" && (
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
          )}

          {createMode === "vs" && (
            <div className="space-y-4 rounded-lg border border-white/10 bg-black/24 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Home team</span>
                  <select
                    value={homeTeamId}
                    onChange={(event) => setHomeTeamId(event.target.value)}
                    className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
                  >
                    {matchTeams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-[#12151b] text-white">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Away team</span>
                  <select
                    value={awayTeamId}
                    onChange={(event) => setAwayTeamId(event.target.value)}
                    className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
                  >
                    {matchTeams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-[#12151b] text-white">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">My side</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["home", homeTeam.name],
                    ["away", awayTeam.name]
                  ] as const).map(([side, label]) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setUserSide(side)}
                      className={`min-h-12 rounded-lg border px-3 text-sm font-semibold transition ${
                        userSide === side
                          ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/16 text-white"
                          : "border-white/12 bg-white/[0.07] text-white/58 hover:border-white/24 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Other side</span>
                <select
                  value={opponentMode}
                  onChange={(event) => setOpponentMode(event.target.value as OpponentMode)}
                  className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
                >
                  <option value="club-players" className="bg-[#12151b] text-white">
                    Use their players
                  </option>
                  <option value="another-person" className="bg-[#12151b] text-white">
                    Another person
                  </option>
                </select>
                <p className="text-xs leading-5 text-white/46">
                  {opponentMode === "club-players"
                    ? "The other team appears as opposing squad players, not your captured face."
                    : "The other team gets a separate generated feature player, not your captured face."}
                </p>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Matchday notes</span>
                <textarea
                  value={matchdayNotes}
                  onChange={(event) => setMatchdayNotes(event.target.value)}
                  maxLength={420}
                  placeholder="Allowed players, injuries, transfers, do-not-show names"
                  className="min-h-24 w-full resize-none rounded-lg border border-white/12 bg-white/[0.07] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-white/34"
                />
                <p className="text-xs leading-5 text-white/46">
                  {matchdayNotes.length}/420
                </p>
              </label>

              <Button
                type="button"
                variant="secondary"
                onClick={fetchLatestTeamNews}
                disabled={isFetchingTeamNews}
                className="w-full"
              >
                {isFetchingTeamNews ? "Checking team news..." : "Use latest squad data"}
              </Button>

              {teamNewsError && (
                <p className="text-sm leading-6 text-[var(--accent)]">{teamNewsError}</p>
              )}

              {!hasValidMatch && (
                <p className="text-sm leading-6 text-[var(--accent)]">Choose two different teams for a VS poster.</p>
              )}
            </div>
          )}

          {createMode === "single" && !isCustomTeam && (
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">2025/26 kit</span>
              <select
                value={kitVariant}
                onChange={(event) => setKitVariant(event.target.value as KitVariant)}
                className="h-13 w-full rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white outline-none transition focus:border-white/34"
              >
                {kitVariants.map((variant) => (
                  <option key={variant.id} value={variant.id} className="bg-[#12151b] text-white">
                    {variant.label}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-white/46">
                {selectedKitSpec
                  ? `${selectedKitSpec.season} ${selectedKitSpec.variant} kit reference ready.`
                  : "No exact kit reference is curated yet for this team, so the app will use the written kit profile."}
              </p>
            </label>
          )}

          {createMode === "single" && isCustomTeam && (
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
            {createMode === "vs" && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/50">
                <p>{homeTeam.name} home vs {awayTeam.name} away</p>
                <p>Your side: {userTeam.name}</p>
              </div>
            )}
            {createMode === "single" && selectedKitSpec && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/50">
                <p>{selectedKitSpec.manufacturer} · {selectedKitSpec.mainSponsor}</p>
                <p>{selectedKitSpec.pattern}</p>
              </div>
            )}
            {createMode === "vs" && (homeKitSpec || awayKitSpec || userKitSpec) && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/50">
                {homeKitSpec && <p>{homeKitSpec.team} home: {homeKitSpec.manufacturer} · {homeKitSpec.mainSponsor}</p>}
                {awayKitSpec && <p>{awayKitSpec.team} away: {awayKitSpec.manufacturer} · {awayKitSpec.mainSponsor}</p>}
              </div>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/46">Choose your poster look</span>
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
