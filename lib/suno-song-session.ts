export const ROLE_ORDER = ["beat", "bass", "guitar", "texture"] as const;

export type CandidateRole = (typeof ROLE_ORDER)[number];

export type SessionCandidate = {
  id: string;
  role: CandidateRole;
  name: string;
  intent: string;
  shape: string;
  keyFit: string;
  source: "Synthetic demo";
};

export type SessionSelections = Partial<Record<CandidateRole, string>>;

export const ROLE_LABELS: Record<CandidateRole, string> = {
  beat: "Beat",
  bass: "Bass",
  guitar: "Guitar",
  texture: "Texture",
};

export const SESSION_SPEC = {
  title: "Afterglow, version 03",
  brief: "An intimate electronic pop sketch that opens small, earns its lift, and leaves room for the vocal.",
  tempo: "104 BPM",
  key: "C major",
  duration: "02:32 target",
  progression: [
    { symbol: "Cmaj7", midi: ["C3", "E3", "G3", "B3"] },
    { symbol: "Am7", midi: ["A2", "C3", "E3", "G3"] },
    { symbol: "Fmaj7", midi: ["F2", "A2", "C3", "E3"] },
    { symbol: "G6", midi: ["G2", "B2", "D3", "E3"] },
  ],
  openDecisions: [
    "Should the first chorus arrive dry or wide?",
    "Does the guitar answer the vocal or stay textural?",
    "Which low-end shape preserves space for the hook?",
  ],
} as const;

export const SESSION_CANDIDATES: readonly SessionCandidate[] = [
  {
    id: "beat-pocket-kick",
    role: "beat",
    name: "Pocket kick",
    intent: "Understate the verse, then add weight without increasing density.",
    shape: "Dry / syncopated",
    keyFit: "Tempo matched",
    source: "Synthetic demo",
  },
  {
    id: "beat-tape-pulse",
    role: "beat",
    name: "Warm tape pulse",
    intent: "Give the sketch motion through texture instead of extra percussion.",
    shape: "Soft / continuous",
    keyFit: "Tempo matched",
    source: "Synthetic demo",
  },
  {
    id: "bass-round-anchor",
    role: "bass",
    name: "Round anchor",
    intent: "Follow the roots and protect the vocal pocket.",
    shape: "Mono / short tail",
    keyFit: "C major",
    source: "Synthetic demo",
  },
  {
    id: "bass-late-bloom",
    role: "bass",
    name: "Late bloom",
    intent: "Delay the note entrance so the chords keep their emotional lead.",
    shape: "Sub / slow attack",
    keyFit: "C major",
    source: "Synthetic demo",
  },
  {
    id: "guitar-glass-bloom",
    role: "guitar",
    name: "Glass guitar bloom",
    intent: "Answer only at phrase endings and avoid crowding the lyric.",
    shape: "Wide / sparse",
    keyFit: "C major",
    source: "Synthetic demo",
  },
  {
    id: "guitar-muted-thread",
    role: "guitar",
    name: "Muted thread",
    intent: "Add a quiet rhythmic counterpoint beneath the pre-chorus.",
    shape: "Narrow / percussive",
    keyFit: "C major",
    source: "Synthetic demo",
  },
  {
    id: "texture-air-bed",
    role: "texture",
    name: "Air texture",
    intent: "Create depth at the edges while keeping the center empty.",
    shape: "High / diffuse",
    keyFit: "Non-tonal",
    source: "Synthetic demo",
  },
  {
    id: "texture-room-grain",
    role: "texture",
    name: "Room grain",
    intent: "Make the production feel inhabited without adding a new part.",
    shape: "Mid / intermittent",
    keyFit: "Non-tonal",
    source: "Synthetic demo",
  },
] as const;

export const ARRANGEMENT_PLAN = [
  { section: "Intro", bars: "1 to 8", move: "Chords and texture only", reason: "Establish intimacy" },
  { section: "Verse", bars: "9 to 24", move: "Add beat, hold bass", reason: "Protect the first vocal" },
  { section: "Pre", bars: "25 to 32", move: "Bass enters, guitar answers", reason: "Create earned lift" },
  { section: "Chorus", bars: "33 to 48", move: "Open width, keep part count fixed", reason: "Increase scale, not clutter" },
  { section: "Outro", bars: "49 to 56", move: "Return to chords and room", reason: "Leave an afterimage" },
] as const;

export const FACTORY_RECEIPT = [
  { value: "31 / 31", label: "workflow checks passed" },
  { value: "20", label: "bounded MCP tools" },
  { value: "99", label: "indexed sounds" },
  { value: "84", label: "indexed song specs" },
  { value: "6", label: "generated test assets" },
] as const;

export function candidatesFor(role: CandidateRole): readonly SessionCandidate[] {
  return SESSION_CANDIDATES.filter((candidate) => candidate.role === role);
}

export function getCandidate(id: string | undefined): SessionCandidate | undefined {
  return SESSION_CANDIDATES.find((candidate) => candidate.id === id);
}

export function isSelectionComplete(selections: SessionSelections): boolean {
  return ROLE_ORDER.every((role) => Boolean(selections[role]));
}
