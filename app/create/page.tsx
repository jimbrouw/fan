"use client";

import { BadgeCheck, ImagePlus, Shirt, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { getKitSpec, kitVariants, type KitVariant } from "@/lib/kitSpecs";
import { getDefaultPosterStyleIdForCreateMode, posterStyles } from "@/lib/posterTemplates";
import { customTeamId, getTeamProfile, teamProfiles } from "@/lib/teamProfiles";
import { validateImageBlob } from "@/lib/validation";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  objectUrl?: string;
  imageUrl?: string;
};

type CreateMode = "single" | "vs";
type MatchSide = "home" | "away";
type OpponentMode = "club-players" | "another-person";
type GptImageTestMode = "fast-1k-low" | "draft-1k-medium" | "final-2k-high";

export default function CreatePage() {
  const [createMode, setCreateMode] = useState<CreateMode>("single");
  const [selectedTeamId, setSelectedTeamId] = useState("");
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
  const [gptImageTestMode, setGptImageTestMode] = useState<GptImageTestMode>("fast-1k-low");
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [opponentImageUrl, setOpponentImageUrl] = useState<string | undefined>();
  const [opponentPreviewUrl, setOpponentPreviewUrl] = useState<string | undefined>();
  const [isUploadingOpponent, setIsUploadingOpponent] = useState(false);
  const [opponentUploadError, setOpponentUploadError] = useState<string | null>(null);
  const [failedKitImages, setFailedKitImages] = useState<Record<string, true>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shirtName, setShirtName] = useState("");
  const [teamSlogan, setTeamSlogan] = useState("");
  const [usesMobilityAid, setUsesMobilityAid] = useState(false);
  const [accessibilityNote, setAccessibilityNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const models = [
    { id: "wan2.7-image-edit", name: "WAN 2.7 Edit", description: "Newer image-edit model with multi-image references. Good test default." },
    { id: "nano-banana-2", name: "Nano Banana 2", description: "Google image-edit model with strong character consistency." },
    { id: "gpt-image-2", name: "GPT Image 2", description: "Advanced prompt adherence using GPT Image 2." },
    { id: "flux-pulid", name: "Flux PuLID", description: "Legacy face-reference model. Use only as a fallback." },
  ];
  const gptImageTestModes = [
    { id: "fast-1k-low", label: "Fast 1K", detail: "Smallest and quickest: 1K / low quality." },
    { id: "draft-1k-medium", label: "Draft 1K", detail: "Still small, with medium quality for better proofing." },
    { id: "final-2k-high", label: "Final 2K", detail: "Slower and larger: 2K / high quality." },
  ] as const;

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
  const kitPreviewTiles = createMode === "vs"
    ? [
        { label: "Home kit", team: homeTeam.name, base: homeTeam.primary, trim: homeTeam.accent, imageUrl: homeKitSpec?.referenceImageUrl },
        { label: "Away kit", team: awayTeam.name, base: awayTeam.primary, trim: awayTeam.accent, imageUrl: awayKitSpec?.referenceImageUrl },
        { label: "Your side", team: userTeam.name, base: userTeam.primary, trim: userTeam.accent, imageUrl: userKitSpec?.referenceImageUrl },
      ]
    : [
        {
          label: kitVariants.find((variant) => variant.id === kitVariant)?.label ?? "Selected kit",
          team: isCustomTeam ? customTeamName.trim() || selectedTeam.name : selectedTeam.name,
          base: selectedTeam.primary,
          trim: selectedTeam.accent,
          imageUrl: selectedKitSpec?.referenceImageUrl,
        },
      ];

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
          id: homeTeamId,
          name: homeTeam.name,
          primary: homeTeam.primary,
          accent: homeTeam.accent,
          kitNotes: describeTeamKit(homeTeamId, "home"),
          group: homeTeam.group,
          nickname: homeTeam.nickname,
          visualMotifs: homeTeam.visualMotifs,
          kitVariant: "home" as const
        },
        awayTeam: {
          id: awayTeamId,
          name: awayTeam.name,
          primary: awayTeam.primary,
          accent: awayTeam.accent,
          kitNotes: describeTeamKit(awayTeamId, "away"),
          group: awayTeam.group,
          nickname: awayTeam.nickname,
          visualMotifs: awayTeam.visualMotifs,
          kitVariant: "away" as const
        },
        userSide,
        opponentMode,
        opponentSourceImageUrl: opponentMode === "another-person" ? opponentImageUrl : undefined,
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
  const hasTeamSelected = createMode !== "single" || selectedTeamId !== "";
  const hasValidMatch = createMode === "single" || homeTeamId !== awayTeamId;
  const needsOpponentImage = createMode === "vs" && opponentMode === "another-person";
  const hasOpponentImage = !needsOpponentImage || Boolean(opponentImageUrl);
  const canSubmit = hasTeamSelected && teamName && kitNotes && posterStyleId && sourceImageUrl && sessionId && hasValidMatch && hasOpponentImage;

  useEffect(() => {
    setSessionId(localStorage.getItem("fan-hero-session-id"));
    const storedCaptures = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
    const storedOpponent = storedCaptures.find((capture) => capture.type === "opponent_front");
    setCaptures(storedCaptures);
    setOpponentImageUrl(storedOpponent?.imageUrl);
    setOpponentPreviewUrl(storedOpponent?.imageUrl ?? storedOpponent?.objectUrl);
  }, []);

  async function handleOpponentPhotoChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !sessionId) return;

    setIsUploadingOpponent(true);
    setOpponentUploadError(null);

    const objectUrl = URL.createObjectURL(file);
    let imageUrl: string | undefined;

    try {
      const validation = await validateImageBlob(file);
      const form = new FormData();
      form.append("file", file, "opponent_front.jpg");
      form.append("sessionId", sessionId);
      form.append("type", "opponent_front");
      form.append("validationStatus", validation.status);
      form.append("validationResults", JSON.stringify(validation.checks));

      const response = await fetch("/api/captures", {
        method: "POST",
        body: form
      });
      const data = (await response.json()) as { imageUrl?: string; error?: string };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error ?? "Other person photo upload failed.");
      }

      imageUrl = data.imageUrl;
      const nextCapture: LocalCapture = { type: "opponent_front", objectUrl, imageUrl };
      setOpponentImageUrl(imageUrl);
      setOpponentPreviewUrl(objectUrl);
      setCaptures((current) => [
        ...current.filter((capture) => capture.type !== "opponent_front"),
        nextCapture
      ]);

      const existing = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
      const next = [
        ...existing.filter((capture) => capture.type !== "opponent_front"),
        nextCapture
      ];
      localStorage.setItem("fan-hero-captures", JSON.stringify(next));
    } catch (uploadError) {
      URL.revokeObjectURL(objectUrl);
      setOpponentUploadError(uploadError instanceof Error ? uploadError.message : "Other person photo upload failed.");
    } finally {
      setIsUploadingOpponent(false);
    }
  }

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
            gptImageTestMode,
            kitVariant: userKitVariant,
            matchContext,
            teamProfile: {
              name: teamName,
              primary: userTeam.primary,
              accent: userTeam.accent,
              kitNotes,
              trophy: userTeam.trophy,
              group: userTeam.group,
              nickname: userTeam.nickname,
              visualMotifs: userTeam.visualMotifs
            },
            teamName,
            kitNotes,
            shirtName: shirtName.trim() || undefined,
            teamSlogan: teamSlogan.trim() || undefined,
            accessibilityNote: usesMobilityAid ? (accessibilityNote.trim() || "") : undefined
          })
      });

      const data = (await response.json()) as { jobId?: string; error?: string };
      if (!response.ok || !data.jobId) {
        if (response.status === 401) {
          window.location.href = "/login?next=/create";
          return;
        }
        throw new Error(data.error ?? "Poster job failed.");
      }

      window.location.href = `/generating/${data.jobId}`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Poster job failed.");
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
        setTeamNewsError("Live squad data is unavailable right now. You can still write the match note manually.");
        return;
      }

      setMatchdayNotes(data.notes);
    } catch {
      setTeamNewsError("Live squad data is unavailable right now. You can still write the match note manually.");
    } finally {
      setIsFetchingTeamNews(false);
    }
  }

  return (
    <AppFrame>
      <section className="flex flex-1 flex-col gap-6 pb-4">
        <div className="space-y-3">
          <h1 className="font-display text-[34px] leading-none text-[var(--foreground)]">Create.</h1>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Choose the kit, poster style, and a small match note to include.
          </p>
        </div>

        <form className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Poster maker</span>
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                  {m.name}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-[var(--muted)]">
              {models.find((m) => m.id === selectedModel)?.description}
            </p>
          </label>

          {selectedModel === "gpt-image-2" && (
            <fieldset className="space-y-2 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Testing output</legend>
              <div className="grid grid-cols-3 gap-2">
                {gptImageTestModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGptImageTestMode(mode.id)}
                    className={`min-h-11 rounded-[12px] border px-2 text-xs font-semibold transition ${
                      gptImageTestMode === mode.id
                        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <p className="text-xs leading-5 text-[var(--muted)]">
                {gptImageTestModes.find((mode) => mode.id === gptImageTestMode)?.detail}
              </p>
            </fieldset>
          )}

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Poster type</legend>
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
                  className={`h-12 rounded-[14px] border px-3 text-sm font-semibold transition ${
                    createMode === mode
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {createMode === "single" && (
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Kit</span>
              <select
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              >
                <option value="" disabled className="bg-[var(--surface)] text-[var(--muted)]">Premier League</option>
                {Object.entries(groupedTeams)
                  .sort(([a], [b]) => {
                    const order = ["Premier League", "EFL League One", "International", "International Giants", "World Cup 2026", "Custom"];
                    return order.indexOf(a) - order.indexOf(b);
                  })
                  .map(([group, teams]) => (
                    <optgroup key={group} label={group} className="bg-[var(--surface)] text-[var(--foreground)]">
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
            <div className="space-y-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/60 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Home team</span>
                  <select
                    value={homeTeamId}
                    onChange={(event) => setHomeTeamId(event.target.value)}
                    className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  >
                    {matchTeams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Away team</span>
                  <select
                    value={awayTeamId}
                    onChange={(event) => setAwayTeamId(event.target.value)}
                    className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                  >
                    {matchTeams.map((team) => (
                      <option key={team.id} value={team.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                        {team.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">My side</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["home", homeTeam.name],
                    ["away", awayTeam.name]
                  ] as const).map(([side, label]) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => setUserSide(side)}
                      className={`min-h-12 rounded-[14px] border px-3 text-sm font-semibold transition ${
                        userSide === side
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                          : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Other side</span>
                <select
                  value={opponentMode}
                  onChange={(event) => setOpponentMode(event.target.value as OpponentMode)}
                  className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                >
                  <option value="club-players" className="bg-[var(--surface)] text-[var(--foreground)]">
                    Use their players
                  </option>
                  <option value="another-person" className="bg-[var(--surface)] text-[var(--foreground)]">
                    Another person
                  </option>
                </select>
                <p className="text-xs leading-5 text-[var(--muted)]">
                  {opponentMode === "club-players"
                    ? "The other team appears as opposing squad players, not your captured face."
                    : "The other team gets a separate generated feature player, not your captured face."}
                </p>
              </label>

              {opponentMode === "another-person" && (
                <div className="space-y-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[var(--line)] bg-[var(--surface-soft)]">
                      {opponentPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={opponentPreviewUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus size={22} className="text-[var(--muted)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {opponentImageUrl ? "Other person photo ready" : "Add other person photo"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        Use a clear front-facing photo. This becomes the opposing feature player.
                      </p>
                    </div>
                  </div>

                  <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-[12px] border border-[var(--accent)] px-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)]">
                    {isUploadingOpponent ? "Uploading..." : opponentImageUrl ? "Replace photo" : "Choose photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploadingOpponent}
                      onChange={(event) => handleOpponentPhotoChange(event.target.files)}
                      className="sr-only"
                    />
                  </label>

                  {opponentUploadError && (
                    <p className="text-xs leading-5 text-[var(--accent)]">{opponentUploadError}</p>
                  )}
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Match note</span>
                <textarea
                  value={matchdayNotes}
                  onChange={(event) => setMatchdayNotes(event.target.value)}
                  maxLength={420}
                  placeholder="First home game of the season. Unforgettable."
                  className="min-h-24 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
                />
                <p className="text-xs leading-5 text-[var(--muted)]">
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

          {createMode === "single" && !isCustomTeam && selectedTeamId !== "" && (
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">2025/26 kit</span>
              <select
                value={kitVariant}
                onChange={(event) => setKitVariant(event.target.value as KitVariant)}
                className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              >
                {kitVariants.map((variant) => (
                  <option key={variant.id} value={variant.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                    {variant.label}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-[var(--muted)]">
                {selectedKitSpec?.referenceImageUrl
                  ? `${selectedKitSpec.season} ${selectedKitSpec.variant} kit reference ready.`
                  : selectedKitSpec
                    ? `${selectedKitSpec.season} ${selectedKitSpec.variant} kit metadata ready; image reference still needed.`
                  : "No exact kit reference is curated yet for this team, so the app will use the written kit profile."}
              </p>
            </label>
          )}

          {createMode === "single" && isCustomTeam && (
            <>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Custom team name</span>
                <input
                  value={customTeamName}
                  onChange={(event) => setCustomTeamName(event.target.value)}
                  placeholder="Your club or country"
                  className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Kit profile</span>
                <textarea
                  value={customKitNotes}
                  onChange={(event) => setCustomKitNotes(event.target.value)}
                  placeholder="Home colours, away colours, badge direction, shirt number ideas"
                  className="min-h-28 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
                />
              </label>
            </>
          )}

          {(createMode === "vs" || selectedTeamId !== "") && <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {kitPreviewTiles.map(({ label, team, imageUrl }) => {
              const visibleImageUrl = imageUrl && !failedKitImages[imageUrl] ? imageUrl : undefined;

              return (
                <div
                  key={`${label}-${team}`}
                  className="min-w-0 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3"
                >
                  <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)]" aria-hidden="true">
                    {visibleImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={visibleImageUrl}
                        alt=""
                        className="h-full w-full object-contain object-center"
                        onError={() => setFailedKitImages((current) => ({ ...current, [visibleImageUrl]: true }))}
                      />
                    ) : (
                      <span className="px-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        No kit image yet
                      </span>
                    )}
                  </div>
                  <div className="mt-3 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[var(--foreground)]">{team}</p>
                    <p className="mt-1 text-xs leading-4 text-[var(--muted)]">{visibleImageUrl ? "Reference image" : "Kit image needed"}</p>
                  </div>
                </div>
              );
            })}
          </div>}

          {(createMode === "vs" || selectedTeamId !== "") && <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              <Shirt size={15} />
              Kit profile
            </div>
            <p className="text-sm leading-6 text-[var(--foreground)]">{kitNotes || "Add kit colours for your custom team."}</p>
            {createMode === "vs" && (
              <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--muted)]">
                <p>{homeTeam.name} home vs {awayTeam.name} away</p>
                <p>Your side: {userTeam.name}</p>
              </div>
            )}
            {createMode === "single" && selectedKitSpec && (
              <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--muted)]">
                <p>{selectedKitSpec.manufacturer} · {selectedKitSpec.mainSponsor}</p>
                <p>{selectedKitSpec.pattern}</p>
              </div>
            )}
            {createMode === "vs" && (homeKitSpec || awayKitSpec || userKitSpec) && (
              <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs leading-5 text-[var(--muted)]">
                {homeKitSpec && <p>{homeKitSpec.team} home: {homeKitSpec.manufacturer} · {homeKitSpec.mainSponsor}</p>}
                {awayKitSpec && <p>{awayKitSpec.team} away: {awayKitSpec.manufacturer} · {awayKitSpec.mainSponsor}</p>}
              </div>
            )}
          </div>}

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Shirt name</span>
            <input
              value={shirtName}
              onChange={(event) => setShirtName(event.target.value)}
              maxLength={20}
              placeholder="Your name on the back (e.g. JONES)"
              className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
            />
            <p className="text-xs leading-5 text-[var(--muted)]">Optional. Appears on the back of the shirt in the poster.</p>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Team slogan</span>
            <input
              value={teamSlogan}
              onChange={(event) => setTeamSlogan(event.target.value)}
              maxLength={40}
              placeholder={`e.g. Toon Army, You Reds, Come On You Spurs`}
              className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
            />
            <p className="text-xs leading-5 text-[var(--muted)]">Optional. A chant or slogan woven subtly into the poster scene.</p>
          </label>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={usesMobilityAid}
                onChange={(e) => setUsesMobilityAid(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded accent-[var(--accent)]"
              />
              <span className="text-sm leading-5 text-[var(--foreground)]">
                I use a wheelchair or mobility aid
                <span className="block text-xs text-[var(--muted)]">Represent me naturally with my mobility aid — no forced standing or running poses.</span>
              </span>
            </label>
            {usesMobilityAid && (
              <input
                value={accessibilityNote}
                onChange={(e) => setAccessibilityNote(e.target.value)}
                maxLength={80}
                placeholder="Any extra detail (optional, e.g. electric wheelchair)"
                className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)]"
              />
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Poster style</span>
            <select
              value={posterStyleId}
              onChange={(event) => setPosterStyleId(event.target.value)}
              className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              {posterStyles.map((style) => (
                <option key={style.id} value={style.id} className="bg-[var(--surface)] text-[var(--foreground)]">
                  {style.name}
                </option>
              ))}
            </select>
            <p className="text-xs leading-5 text-[var(--muted)]">
              {posterStyles.find((style) => style.id === posterStyleId)?.description}
            </p>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {posterStyles.slice(0, 2).map((style, index) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setPosterStyleId(style.id)}
                className={`rounded-[14px] border bg-[var(--surface)] p-2 text-left transition ${
                  posterStyleId === style.id ? "border-[var(--accent)]" : "border-[var(--line)]"
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[10px] bg-[var(--surface-soft)] p-3">
                  <div className="kitface-ramp absolute -left-10 top-10 h-12 w-48 rotate-[-18deg] opacity-35" />
                  <div className="kitface-ramp absolute -right-12 bottom-8 h-10 w-44 rotate-[-18deg] opacity-25" />
                  <p className="font-display text-2xl leading-none text-[var(--foreground)]">
                    {index === 0 ? "Kitface" : "Matchday"}
                  </p>
                  <div className="relative mt-6 h-20 rounded-t-full bg-[var(--foreground)]/90" />
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-[var(--foreground)]">{style.name}</p>
              </button>
            ))}
          </div>
        </form>

        <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/55 p-4 text-sm leading-6 text-[var(--foreground)]">
          <div className="flex gap-3">
            <BadgeCheck size={18} className={sourceImageUrl ? "mt-1 text-[var(--accent)]" : "mt-1 text-[var(--muted)]"} />
            <span>
              {sourceImageUrl
                ? "Your photo set is ready for the poster."
                : "Take at least one photo before creating a poster."}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-[16px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-[var(--foreground)]">
            {error}
          </div>
        )}

        <Button type="button" disabled={!canSubmit || isSubmitting} onClick={submitJob} className="mt-auto w-full">
          <WandSparkles size={17} />
          {isSubmitting ? "Creating..." : "Create poster"}
        </Button>
      </section>
    </AppFrame>
  );
}
