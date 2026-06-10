"use client";

import { BadgeCheck, ImagePlus, WandSparkles, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/AppFrame";
import { Button } from "@/components/Button";
import { choosePrimaryReferenceCapture, chooseSupportingReferenceUrls } from "@/lib/captureReferences";
import { describeKitSpec, getKitSpec, kitVariants, type KitVariant } from "@/lib/kitSpecs";
import { getDefaultPosterStyleIdForCreateMode, posterStyles } from "@/lib/posterTemplates";
import { validatePosterPersonalisation } from "@/lib/safety/profanity";
import { customTeamId, getTeamProfile, teamProfiles } from "@/lib/teamProfiles";
import { validateImageBlob } from "@/lib/validation";
import type { CaptureStepType } from "@/types/capture";

type LocalCapture = {
  type: CaptureStepType;
  objectUrl?: string;
  imageUrl?: string;
};

type Usage = {
  used: number;
  freeLimit: number;
  remainingFree: number;
  credits: number;
  exempt: boolean;
};

type CreateMode = "single" | "vs";
type MatchSide = "home" | "away";
type OpponentMode = "club-players" | "another-person";
type TeamGroup = (typeof teamProfiles)[number]["group"];

const visibleKitVariants = kitVariants.filter((variant) => variant.id !== "third");
const teamGroupOrder: TeamGroup[] = [
  "World Cup 2026",
  "Premier League",
  "International Giants",
  "International",
  "EFL League One",
  "Custom"
];
const teamOrderByGroup: Partial<Record<TeamGroup, string[]>> = {
  "World Cup 2026": [
    "england-wc",
    "scotland",
    "brazil",
    "argentina",
    "france",
    "germany",
    "spain",
    "portugal",
    "netherlands",
    "belgium",
    "croatia",
    "uruguay",
    "colombia",
    "mexico",
    "usa",
    "japan",
    "canada",
    "morocco",
    "senegal",
    "ghana",
    "australia",
    "new-zealand"
  ],
  "Premier League": [
    "man-united",
    "liverpool",
    "arsenal",
    "man-city",
    "chelsea",
    "tottenham",
    "newcastle",
    "aston-villa",
    "nottingham-forest",
    "west-ham",
    "everton",
    "leeds",
    "brighton",
    "crystal-palace",
    "fulham",
    "brentford",
    "wolves",
    "sunderland",
    "burnley",
    "bournemouth"
  ],
  "International Giants": ["real-madrid", "barcelona", "bayern-munich"],
  International: ["england"],
  "EFL League One": ["mansfield"],
  Custom: [customTeamId]
};

function compareTeamsWithinGroup(group: TeamGroup, a: (typeof teamProfiles)[number], b: (typeof teamProfiles)[number]) {
  const order = teamOrderByGroup[group] ?? [];
  const aIndex = order.indexOf(a.id);
  const bIndex = order.indexOf(b.id);

  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  }

  return a.name.localeCompare(b.name);
}

function buildOrderedTeamGroups<T extends (typeof teamProfiles)[number]>(teams: T[]) {
  const grouped = teams.reduce<Record<TeamGroup, T[]>>((groups, team) => {
    groups[team.group] = [...(groups[team.group] ?? []), team];
    return groups;
  }, {} as Record<TeamGroup, T[]>);

  return teamGroupOrder
    .filter((group) => grouped[group]?.length)
    .map((group) => [group, [...grouped[group]].sort((a, b) => compareTeamsWithinGroup(group, a, b))] as const);
}

function getOpponentUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (/expected pattern/i.test(message)) {
    return "That photo could not be read by this browser. Try a JPEG or PNG from your camera roll.";
  }

  if (/capture session expired/i.test(message)) {
    return "Your capture session expired. Restart capture, then try this photo again.";
  }

  return message || "Other person photo upload failed.";
}

function PosterStylePreview({
  styleId,
  primary,
  accent,
}: {
  styleId: string;
  primary: string;
  accent: string;
}) {
  const baseStyle = {
    "--preview-primary": primary,
    "--preview-accent": accent,
  } as CSSProperties;

  if (styleId === "matchday") {
    return (
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[10px] border border-white/60 bg-[linear-gradient(115deg,var(--preview-primary)_0_48%,var(--preview-accent)_52%_100%)]"
        style={baseStyle}
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/70" />
        <div className="absolute left-2 top-2 h-10 w-7 rounded-full bg-white/75 shadow-sm" />
        <div className="absolute bottom-2 right-2 h-10 w-7 rounded-full bg-white/75 shadow-sm" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-black leading-none text-[var(--foreground)] shadow-sm">
            VS
          </span>
        </div>
      </div>
    );
  }

  if (styleId === "player-reveal") {
    return (
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-[10px] border border-white/60 bg-[radial-gradient(circle_at_50%_20%,white_0_14%,transparent_38%),linear-gradient(135deg,var(--preview-primary),var(--preview-accent))]"
        style={baseStyle}
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 bottom-0 h-7 bg-white/25" />
        <div className="absolute left-1/2 top-4 h-14 w-10 -translate-x-1/2 rounded-t-full bg-white/85 shadow-sm" />
        <div className="absolute bottom-2 left-2 h-7 w-5 rounded-t-full bg-white/70" />
        <div className="absolute bottom-2 right-2 h-7 w-5 rounded-t-full bg-white/70" />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[10px] border border-white/60 bg-[linear-gradient(145deg,white_0_18%,var(--preview-primary)_19%_66%,var(--preview-accent)_67%_100%)]"
      style={baseStyle}
      aria-hidden="true"
    >
      <div className="absolute inset-2 rounded-[8px] border border-white/75" />
      <div className="absolute left-1/2 top-3 h-12 w-9 -translate-x-1/2 rounded-t-full bg-white/85 shadow-sm" />
      <div className="absolute bottom-3 left-3 right-3 h-3 rounded-full bg-white/80" />
    </div>
  );
}

export default function CreatePage() {
  const [createMode, setCreateMode] = useState<CreateMode>("single");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [customTeamName, setCustomTeamName] = useState("");
  const [customKitNotes, setCustomKitNotes] = useState("");
  const [kitVariant, setKitVariant] = useState<KitVariant>("home");
  const [homeTeamId, setHomeTeamId] = useState("england-wc");
  const [awayTeamId, setAwayTeamId] = useState("scotland");
  const [homeKitVariant, setHomeKitVariant] = useState<KitVariant>("home");
  const [awayKitVariant, setAwayKitVariant] = useState<KitVariant>("away");
  const [userSide, setUserSide] = useState<MatchSide>("away");
  const [opponentMode, setOpponentMode] = useState<OpponentMode>("club-players");
  const [matchdayNotes, setMatchdayNotes] = useState("");
  const [isFetchingTeamNews, setIsFetchingTeamNews] = useState(false);
  const [teamNewsError, setTeamNewsError] = useState<string | null>(null);
  const [posterStyleId, setPosterStyleId] = useState(posterStyles[0].id);
  const [captures, setCaptures] = useState<LocalCapture[]>([]);
  const [opponentImageUrl, setOpponentImageUrl] = useState<string | undefined>();
  const [opponentPreviewUrl, setOpponentPreviewUrl] = useState<string | undefined>();
  const [isUploadingOpponent, setIsUploadingOpponent] = useState(false);
  const [opponentUploadError, setOpponentUploadError] = useState<string | null>(null);
  const [invalidSourceImageUrl, setInvalidSourceImageUrl] = useState<string | null>(null);
  const [failedKitImages, setFailedKitImages] = useState<Record<string, true>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shirtName, setShirtName] = useState("");
  const [teamSlogan, setTeamSlogan] = useState("");
  const [usesMobilityAid, setUsesMobilityAid] = useState(false);
  const [accessibilityNote, setAccessibilityNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [creditMessage, setCreditMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadUsage() {
      try {
        const res = await fetch("/api/usage", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as Usage;
        if (active) setUsage(data);
      } catch {
        // The usage badge is non-critical and must never block the create screen.
      }
    }
    loadUsage();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const credits = params.get("credits");
    if (credits === "success") {
      setCreditMessage("Payment received — your credits have been added.");
    } else if (credits === "cancel") {
      setCreditMessage("Checkout cancelled. No payment was taken.");
    }
  }, []);

  async function startUpgrade() {
    setIsUpgrading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/credits", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login?next=/create";
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (upgradeError) {
      setError(upgradeError instanceof Error ? upgradeError.message : "Could not start checkout.");
      setIsUpgrading(false);
    }
  }
  const [isRetryingUploads, setIsRetryingUploads] = useState(false);


  const selectedTeam = getTeamProfile(selectedTeamId);
  const isCustomTeam = selectedTeamId === customTeamId;
  const selectedKitSpec = getKitSpec(selectedTeamId, kitVariant);
  const homeTeam = getTeamProfile(homeTeamId);
  const awayTeam = getTeamProfile(awayTeamId);
  const matchTeams = teamProfiles.filter((team) => team.id !== customTeamId);
  const userTeamId = createMode === "vs" ? (userSide === "home" ? homeTeamId : awayTeamId) : selectedTeamId;
  const userTeam = createMode === "vs" ? getTeamProfile(userTeamId) : selectedTeam;
  const userKitVariant: KitVariant = createMode === "vs" ? (userSide === "home" ? homeKitVariant : awayKitVariant) : kitVariant;
  const userKitSpec = getKitSpec(userTeamId, userKitVariant);
  const homeKitSpec = getKitSpec(homeTeamId, homeKitVariant);
  const awayKitSpec = getKitSpec(awayTeamId, awayKitVariant);
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

    if (variant === "retro") {
      if (spec) return describeKitSpec(spec, variant);
      return `Classic/retro era ${team.name} kit (use a vintage football shirt aesthetic — worn fabric texture, bold retro badge, no modern sponsor branding). Base color: ${team.primary}. Accent color: ${team.accent}.`;
    }

    return spec
      ? describeKitSpec(spec, variant)
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
          kitNotes: describeTeamKit(homeTeamId, homeKitVariant),
          group: homeTeam.group,
          nickname: homeTeam.nickname,
          visualMotifs: homeTeam.visualMotifs,
          kitVariant: homeKitVariant
        },
        awayTeam: {
          id: awayTeamId,
          name: awayTeam.name,
          primary: awayTeam.primary,
          accent: awayTeam.accent,
          kitNotes: describeTeamKit(awayTeamId, awayKitVariant),
          group: awayTeam.group,
          nickname: awayTeam.nickname,
          visualMotifs: awayTeam.visualMotifs,
          kitVariant: awayKitVariant
        },
        userSide,
        opponentMode,
        opponentSourceImageUrl: opponentMode === "another-person" ? opponentImageUrl : undefined,
        matchdayNotes: matchdayNotes.trim().slice(0, 420) || undefined
      }
    : undefined;
  const groupedTeams = useMemo(() => buildOrderedTeamGroups(teamProfiles), []);
  const groupedMatchTeams = useMemo(() => buildOrderedTeamGroups(matchTeams), [matchTeams]);
  const sourceImageUrl = useMemo(
    () => {
      const primaryCapture = choosePrimaryReferenceCapture(captures);
      const uploadedCapture = captures.find((capture) => capture.imageUrl && capture.type !== "opponent_front");
      return (
        primaryCapture?.imageUrl ??
        uploadedCapture?.imageUrl
      );
    },
    [captures]
  );
  const supportingReferenceImageUrls = useMemo(
    () => createMode === "single" ? chooseSupportingReferenceUrls(captures, sourceImageUrl) : [],
    [captures, createMode, sourceImageUrl]
  );
  const hasUsableSourceImage = Boolean(sourceImageUrl && sourceImageUrl !== invalidSourceImageUrl);
  const hasTeamSelected = createMode !== "single" || selectedTeamId !== "";
  const hasValidMatch = createMode === "single" || homeTeamId !== awayTeamId;
  const needsOpponentImage = createMode === "vs" && opponentMode === "another-person";
  const hasOpponentImage = !needsOpponentImage || Boolean(opponentImageUrl);
  const hasAnyCapture = captures.some((c) => c.objectUrl || c.imageUrl);
  const personalisationSafetyError = validatePosterPersonalisation({ shirtName, teamSlogan });
  const canSubmit = !personalisationSafetyError && !isRetryingUploads && hasTeamSelected && teamName && kitNotes && posterStyleId && hasUsableSourceImage && sessionId && hasValidMatch && hasOpponentImage;
  const missingSubmitReason = isRetryingUploads
    ? "Uploading your photos..."
    : personalisationSafetyError
      ? personalisationSafetyError.message
    : !hasUsableSourceImage || !sessionId
      ? "Take photos first."
      : !hasTeamSelected || !teamName || !kitNotes
        ? "Choose a kit first."
        : !posterStyleId
          ? "Choose a poster style."
          : !hasValidMatch
            ? "Choose two different teams."
            : !hasOpponentImage
              ? "Add the opponent photo."
              : null;

  useEffect(() => {
    const sid = localStorage.getItem("fan-hero-session-id");
    setSessionId(sid);
    const storedCaptures = JSON.parse(localStorage.getItem("fan-hero-captures") ?? "[]") as LocalCapture[];
    const storedOpponent = storedCaptures.find((capture) => capture.type === "opponent_front");
    setCaptures(storedCaptures);
    setOpponentImageUrl(storedOpponent?.imageUrl);
    setOpponentPreviewUrl(storedOpponent?.imageUrl ?? storedOpponent?.objectUrl);
    localStorage.setItem("fan-hero-captures", JSON.stringify(storedCaptures));

    if (!sid) return;
    const needsUpload = storedCaptures.filter(
      (c) => c.objectUrl && c.type !== "opponent_front"
    );
    if (needsUpload.length === 0) return;

    setIsRetryingUploads(true);
    Promise.all(
      needsUpload.map(async (capture) => {
        try {
          const blobRes = await fetch(capture.objectUrl!);
          const blob = await blobRes.blob();
          const form = new FormData();
          form.append("file", blob, `${capture.type}.jpg`);
          form.append("sessionId", sid);
          form.append("type", capture.type);
          form.append("validationStatus", "manual_review");
          form.append("validationResults", "{}");
          const res = await fetch("/api/captures", { method: "POST", body: form });
          if (res.ok) {
            const data = (await res.json()) as { imageUrl?: string };
            if (data.imageUrl) return { ...capture, imageUrl: data.imageUrl };
          }
        } catch {
          // blob may have expired; user will need to retake
        }
        return capture.imageUrl ? capture : { ...capture, imageUrl: undefined };
      })
    ).then((retried) => {
      setCaptures((prev) => {
        const next = prev.map((c) => retried.find((r) => r.type === c.type) ?? c);
        localStorage.setItem("fan-hero-captures", JSON.stringify(next));
        return next;
      });
      setIsRetryingUploads(false);
    });
  }, []);

  async function handleOpponentPhotoChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !sessionId) return;

    setIsUploadingOpponent(true);
    setOpponentUploadError(null);

    let objectUrl: string | undefined;
    let imageUrl: string | undefined;

    try {
      objectUrl = URL.createObjectURL(file);
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
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setOpponentUploadError(getOpponentUploadErrorMessage(uploadError));
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
            personReferenceImageUrls: supportingReferenceImageUrls,
            teamId: userTeamId,
            posterStyleId,
            model: "gpt-image-2",
            gptImageTestMode: "final-2k-high",
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
        if (data.error?.includes("selected face reference image")) {
          setInvalidSourceImageUrl(sourceImageUrl);
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
          <h1 className="font-display text-[34px] leading-none text-[var(--foreground)]">Choose your poster.</h1>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Pick a kit, add optional details, then make the poster.
          </p>
        </div>

        {creditMessage && (
          <div className="rounded-[14px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm leading-5 text-[var(--foreground)]">
            {creditMessage}
          </div>
        )}

        {usage && !usage.exempt && (
          <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface-soft)]/65 px-4 py-3">
            <div className="text-sm leading-5">
              {usage.remainingFree > 0 ? (
                <>
                  <span className="font-semibold text-[var(--foreground)]">
                    {usage.used}/{usage.freeLimit}
                  </span>{" "}
                  <span className="text-[var(--muted)]">free posters used</span>
                </>
              ) : usage.credits > 0 ? (
                <>
                  <span className="font-semibold text-[var(--foreground)]">{usage.credits}</span>{" "}
                  <span className="text-[var(--muted)]">credits left</span>
                </>
              ) : (
                <span className="font-semibold text-[var(--foreground)]">Free posters used up</span>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={startUpgrade}
              disabled={isUpgrading}
              className="shrink-0"
            >
              <Zap size={15} />
              {isUpgrading ? "Opening…" : "Buy credits"}
            </Button>
          </div>
        )}

        <form className="space-y-4">

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
                className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              >
                <option value="" disabled className="bg-[var(--surface)] text-[var(--muted)]">World Cup teams</option>
                {groupedTeams
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
                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Home team</span>
                    <select
                      value={homeTeamId}
                      onChange={(event) => setHomeTeamId(event.target.value)}
                      className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    >
                      {groupedMatchTeams
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
                  <div className="grid grid-cols-3 gap-1">
                    {visibleKitVariants.map((v) => (
                      <button key={v.id} type="button" onClick={() => setHomeKitVariant(v.id)}
                        className={`h-9 rounded-[10px] border text-xs font-semibold transition ${
                          homeKitVariant === v.id
                            ? v.id === "retro"
                              ? "border-amber-400 bg-amber-400/15 text-amber-300"
                              : "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                            : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                        }`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Away team</span>
                    <select
                      value={awayTeamId}
                      onChange={(event) => setAwayTeamId(event.target.value)}
                      className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                    >
                      {groupedMatchTeams
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
                  <div className="grid grid-cols-3 gap-1">
                    {visibleKitVariants.map((v) => (
                      <button key={v.id} type="button" onClick={() => setAwayKitVariant(v.id)}
                        className={`h-9 rounded-[10px] border text-xs font-semibold transition ${
                          awayKitVariant === v.id
                            ? v.id === "retro"
                              ? "border-amber-400 bg-amber-400/15 text-amber-300"
                              : "border-[var(--accent)] bg-[var(--accent)] text-[var(--foreground)]"
                            : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                        }`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                  className="min-h-24 w-full resize-none rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
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
                {isFetchingTeamNews ? "Checking team news..." : "Add squad context"}
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
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Kit variant</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {visibleKitVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setKitVariant(v.id)}
                    className={`flex h-11 items-center justify-center rounded-[12px] border text-xs font-semibold transition ${
                      kitVariant === v.id
                        ? v.id === "retro"
                          ? "border-amber-400 bg-amber-400/15 text-amber-300"
                          : "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs leading-5 text-[var(--muted)]">
                {kitVariant === "retro"
                  ? selectedKitSpec?.referenceImageUrl
                    ? `Retro kit reference ready — ${selectedKitSpec.season}.`
                    : "Retro variant selected. AI will use classic colours if no reference image is found."
                  : selectedKitSpec?.referenceImageUrl
                    ? `${selectedKitSpec.season} ${selectedKitSpec.variant} kit reference ready.`
                    : selectedKitSpec
                      ? `${selectedKitSpec.season} ${selectedKitSpec.variant} kit metadata ready; image reference still needed.`
                      : "No exact kit reference is curated yet for this team, so the app will use the written kit profile."}
              </p>
            </fieldset>
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
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Kit notes</span>
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
                  <div className="flex aspect-[2/3] w-full items-center justify-center overflow-hidden rounded-[10px] border border-dashed border-[var(--line)] bg-[var(--surface-soft)]" aria-hidden="true">
                    {visibleImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={visibleImageUrl}
                        alt=""
                        className="h-full w-full object-cover object-top"
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

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Poster style</legend>
            <div className="grid grid-cols-3 gap-2">
              {posterStyles.map((style) => {
                const isSelected = posterStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setPosterStyleId(style.id)}
                    className={`min-w-0 rounded-[14px] border p-1.5 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 active:scale-[0.98] ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent)]/12 shadow-[0_10px_24px_rgba(49,240,213,0.18)]"
                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]/60"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <PosterStylePreview styleId={style.id} primary={userTeam.primary} accent={userTeam.accent} />
                    <span className={`mt-2 block text-center text-[11px] font-bold leading-4 ${
                      isSelected ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}>
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs leading-5 text-[var(--muted)]">
              {posterStyles.find((style) => style.id === posterStyleId)?.description}
            </p>
          </fieldset>

          <details className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/45 p-4">
            <summary className="cursor-pointer text-sm font-bold text-[var(--foreground)]">
              Add details
            </summary>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Shirt name</span>
                <input
                  value={shirtName}
                  onChange={(event) => setShirtName(event.target.value)}
                  maxLength={20}
                  placeholder="Your name on the back (e.g. JONES)"
                  className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
                <p className="text-xs leading-5 text-[var(--muted)]">Optional. Appears on the back of the shirt in the poster.</p>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Team slogan</span>
                <input
                  value={teamSlogan}
                  onChange={(event) => setTeamSlogan(event.target.value)}
                  maxLength={40}
                  placeholder="e.g. Toon Army, You Reds, Come On You Spurs"
                  className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                />
                <p className="text-xs leading-5 text-[var(--muted)]">Optional. A chant or slogan woven subtly into the poster scene.</p>
              </label>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={usesMobilityAid}
                    onChange={(e) => setUsesMobilityAid(e.target.checked)}
                    className="mt-0.5 h-5 w-5 flex-shrink-0 rounded accent-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  />
                  <span className="text-sm leading-5 text-[var(--foreground)]">
                    Include my wheelchair or mobility aid
                    <span className="block text-xs text-[var(--muted)]">Show me naturally with it. No forced standing or running poses.</span>
                  </span>
                </label>
                {usesMobilityAid && (
                  <input
                    value={accessibilityNote}
                    onChange={(e) => setAccessibilityNote(e.target.value)}
                    maxLength={80}
                    placeholder="Any extra detail (optional, e.g. electric wheelchair)"
                    className="h-13 w-full rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[rgba(140,134,163,0.55)] focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  />
                )}
              </div>
            </div>
          </details>


        </form>

        <div className="rounded-[16px] border border-[var(--line)] bg-[var(--surface-soft)]/55 p-4 text-sm leading-6 text-[var(--foreground)]">
          <div className="flex gap-3">
            <BadgeCheck size={18} className={hasUsableSourceImage ? "mt-1 text-[var(--accent)]" : "mt-1 text-[var(--muted)]"} />
            <span>
              {isRetryingUploads
                ? "Uploading your photos…"
                : hasUsableSourceImage
                  ? "Your photo set is ready for the poster."
                  : hasAnyCapture
                    ? <>Upload failed. <a href="/capture" className="underline">Retake photos</a> to continue.</>
                    : <>No photos yet. <a href="/capture" className="underline">Take photos</a> first.</>}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-[16px] border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-6 text-[var(--foreground)]">
            {error}
          </div>
        )}

        <div className="mt-auto space-y-2">
          {(!canSubmit || isSubmitting) && missingSubmitReason && (
            <p className="text-center text-xs font-semibold leading-5 text-[var(--muted)]">{missingSubmitReason}</p>
          )}
          <Button type="button" disabled={!canSubmit || isSubmitting} onClick={submitJob} className="w-full">
            <WandSparkles size={17} />
            {isSubmitting ? "Creating..." : isRetryingUploads ? "Uploading photos..." : "Make poster"}
          </Button>
        </div>
      </section>
    </AppFrame>
  );
}
