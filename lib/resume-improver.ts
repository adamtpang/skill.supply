export type MarketSignal = {
  slug: string;
  name: string;
  demandScore: number;
  matchingRoles: number;
  companiesHiring: number;
};

export type ResumeScoreInput = {
  resume: string;
  targetRole?: string;
  jobDescription?: string;
  market?: MarketSignal[];
};

export type CheckStatus = "pass" | "partial" | "fail" | "limited";

export type ResumeCheck = {
  id: string;
  title: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  evidence: string;
  recommendation: string;
  acceptance: string;
};

export type ResumeScorecard = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  status: CheckStatus;
  checks: ResumeCheck[];
};

export type ResumeFinding = ResumeCheck & {
  scorecardId: string;
  scorecardTitle: string;
  pointsAvailable: number;
};

export type ResumeScore = {
  score: number;
  rawScore: number;
  cap: number | null;
  capReasons: string[];
  scorecards: ResumeScorecard[];
  findings: ResumeFinding[];
  stats: {
    words: number;
    bullets: number;
    quantifiedBullets: number;
    actionLedBullets: number;
    recognizedSections: number;
    marketSkillsMatched: number;
    marketSkillsChecked: number;
    targetKeywordsMatched: number;
    targetKeywordsChecked: number;
  };
};

type CheckDefinition = Omit<ResumeCheck, "status">;

const ACTION_VERBS = new Set([
  "achieved",
  "adapted",
  "analyzed",
  "architected",
  "automated",
  "built",
  "classified",
  "collaborated",
  "configured",
  "contributed",
  "coordinated",
  "created",
  "cut",
  "decreased",
  "debugged",
  "delivered",
  "designed",
  "diagnosed",
  "drove",
  "established",
  "evaluated",
  "extended",
  "fixed",
  "grew",
  "implemented",
  "improved",
  "increased",
  "integrated",
  "launched",
  "led",
  "managed",
  "migrated",
  "optimized",
  "owned",
  "packaged",
  "partnered",
  "reduced",
  "resolved",
  "scaled",
  "shipped",
  "sold",
  "solved",
  "streamlined",
  "tested",
  "traced",
  "transformed",
  "verified",
  "wrote",
]);

const SECTION_PATTERNS = [
  /^(summary|profile|objective)$/i,
  /^(experience|work experience|employment|professional experience)$/i,
  /^(projects|selected projects|project experience|selected work|engineering work|selected engineering work)$/i,
  /^(skills|technical skills|core skills|technologies)$/i,
  /^(education|training|certifications?)$/i,
  /^(achievements?|awards?|publications?)$/i,
];

const PROOF_SECTION_PATTERN =
  /^(experience|work experience|employment|professional experience|projects|selected projects|project experience)$/im;

const OUTCOME_PATTERN =
  /\b(automated|classified|deployed|fixed|increased|grew|reduced|decreased|cut|saved|generated|improved|accelerated|raised|converted|retained|launched|passed|resolved|shipped|delivered|verified|resulting|leading to|led to|from .{0,35} to)\b/i;

const QUANTIFIED_PATTERN =
  /(?:[$£€]\s?\d|\b\d+(?:[.,]\d+)?\s?(?:%|x\b|k\b|m\b|b\b|seconds?\b|minutes?\b|hours?\b|days?\b|weeks?\b|months?\b|years?\b|users?\b|customers?\b|clients?\b|teams?\b|people\b|engineers?\b|requests?\b|transactions?\b|commits?\b|scenarios?\b|statuses?\b|cases?\b|adapters?\b|gpus?\b|tests?\b|skips?\b|apis?\b|aggregators?\b|revenue\b|arr\b|mrr\b))/i;

const HYPE_PATTERN =
  /\b(world[- ]class|rockstar|ninja|guru|visionary|best[- ]in[- ]class|unparalleled|unmatched|genius|expert in everything)\b/gi;

const FILLER_PATTERN =
  /\b(responsible for|helped with|worked on|participated in|various|multiple tasks|results[- ]driven|hard[- ]working|team player|detail[- ]oriented|go[- ]getter)\b/gi;

const SKILL_ALIASES: Record<string, RegExp> = {
  "ai-machine-learning":
    /\b(ai|artificial intelligence|machine learning|deep learning|llm|large language model|model training|inference|pytorch|tensorflow|computer vision|nlp|evals?)\b/i,
  python: /\bpython\b/i,
  "data-analytics":
    /\b(data science|data scientist|data engineer|analytics|analyst|business intelligence|sql|experimentation|a\/b test|metabase|tableau)\b/i,
  "backend-systems":
    /\b(backend|back-end|distributed systems?|api design|microservices?|postgres|mysql|golang|rust|java|c\+\+)\b/i,
  "cloud-infrastructure":
    /\b(cloud|aws|amazon web services|azure|gcp|google cloud|kubernetes|terraform|devops|site reliability|sre|platform engineer)\b/i,
  security:
    /\b(cybersecurity|security engineer|application security|information security|infosec|threat detection|red team|blue team|soc 2|iam)\b/i,
  "typescript-javascript":
    /\b(typescript|javascript|node\.js|nodejs|react(?:\.js)?|next\.js|frontend|front-end|full[- ]stack)\b/i,
  "product-management":
    /\b(product manager|product management|product lead|product strategy|roadmap|user research|experimentation)\b/i,
  "product-design":
    /\b(product design|product designer|ux|user experience|ui design|visual design|design systems?|figma|brand design)\b/i,
  "sales-gtm":
    /\b(sales|account executive|business development|go-to-market|gtm|demand generation|growth marketing|product marketing|partnerships?|pipeline)\b/i,
  "customer-success":
    /\b(customer success|customer support|customer experience|solutions? engineer|solutions? architect|technical support|implementation|professional services|csat|nps)\b/i,
  operations:
    /\b(operations|business operations|strategy and operations|chief of staff|program manager|program management|procurement|supply chain|process automation)\b/i,
  finance: /\b(finance|financial planning|fp&a|accounting|accountant|treasury|tax|controller|audit)\b/i,
  "legal-policy": /\b(legal|lawyer|counsel|compliance|privacy|policy|regulatory|contracts?)\b/i,
  "people-recruiting":
    /\b(recruiter|recruiting|talent acquisition|people operations|human resources|hr|compensation|total rewards|workplace)\b/i,
};

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "because",
  "been",
  "before",
  "being",
  "but",
  "can",
  "company",
  "experience",
  "for",
  "from",
  "have",
  "into",
  "job",
  "looking",
  "more",
  "our",
  "role",
  "should",
  "that",
  "the",
  "their",
  "these",
  "they",
  "this",
  "through",
  "using",
  "with",
  "will",
  "you",
  "your",
]);

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function statusFor(points: number, maxPoints: number, limited = false): CheckStatus {
  if (limited) return "limited";
  if (points >= maxPoints) return "pass";
  if (points > 0) return "partial";
  return "fail";
}

function check(definition: CheckDefinition, limited = false): ResumeCheck {
  return {
    ...definition,
    points: clamp(Math.round(definition.points), 0, definition.maxPoints),
    status: statusFor(definition.points, definition.maxPoints, limited),
  };
}

function makeScorecard(id: string, title: string, checks: ResumeCheck[]): ResumeScorecard {
  const score = checks.reduce((sum, item) => sum + item.points, 0);
  const maxScore = checks.reduce((sum, item) => sum + item.maxPoints, 0);
  const statuses = checks.map((item) => item.status);
  const status: CheckStatus = statuses.every((item) => item === "limited")
    ? "limited"
    : score === maxScore
      ? "pass"
      : score === 0
        ? "fail"
        : "partial";
  return { id, title, score, maxScore, status, checks };
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z0-9+#.]{2,}/g) ?? [];
}

function countMatches(text: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...text.matchAll(new RegExp(pattern.source, flags))].length;
}

function extractTargetKeywords(text: string): string[] {
  const frequencies = new Map<string, number>();
  for (const token of words(text)) {
    if (STOP_WORDS.has(token) || token.length < 4) continue;
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return [...frequencies.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 12)
    .map(([token]) => token);
}

function readableList(items: string[], fallback: string): string {
  if (items.length === 0) return fallback;
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function extractBulletLines(lines: string[]): string[] {
  const bullets: string[] = [];
  let current = "";

  const flush = () => {
    if (current) bullets.push(current.replace(/\s+/g, " ").trim());
    current = "";
  };

  for (const line of lines) {
    const bullet = line.match(/^(?:[-*•▪◦‣]|\d+[.)])\s+(.+)/);
    if (bullet) {
      flush();
      current = bullet[1];
      continue;
    }
    const isSection = SECTION_PATTERNS.some((pattern) => pattern.test(line.replace(/:$/, "")));
    if (!line || isSection) {
      flush();
      continue;
    }
    if (current) current += ` ${line}`;
  }
  flush();
  return bullets;
}

function scoreProof(
  resume: string,
  bulletLines: string[],
  quantifiedBullets: number,
  actionLedBullets: number
): ResumeScorecard {
  const outcomeBullets = bulletLines.filter((line) => OUTCOME_PATTERN.test(line)).length;
  const hasProofSection = PROOF_SECTION_PATTERN.test(resume);
  const bulletCountPoints = bulletLines.length >= 6 ? 4 : bulletLines.length >= 3 ? 2 : 0;
  const quantifiedRatio = bulletLines.length === 0 ? 0 : quantifiedBullets / bulletLines.length;
  const actionRatio = bulletLines.length === 0 ? 0 : actionLedBullets / bulletLines.length;

  return makeScorecard("proof", "Proof and impact", [
    check({
      id: "proof-bullets",
      title: "Scannable proof bullets",
      points: bulletCountPoints,
      maxPoints: 4,
      evidence: `${bulletLines.length} achievement-style bullets detected.`,
      recommendation: "Turn dense role paragraphs into separate proof bullets.",
      acceptance: "The resume contains at least six concise bullets across experience and projects.",
    }),
    check({
      id: "quantified-results",
      title: "Quantified results",
      points: quantifiedRatio >= 0.5 ? 8 : quantifiedRatio >= 0.3 ? 5 : quantifiedRatio > 0 ? 2 : 0,
      maxPoints: 8,
      evidence: `${quantifiedBullets} of ${bulletLines.length} bullets include a number, percentage, money, time, scale, or audience.`,
      recommendation:
        "Add the smallest defensible measure of change, scale, speed, adoption, reliability, or revenue. If no number exists, name the observable before and after.",
      acceptance: "At least half of the proof bullets contain a defensible result or scale measure.",
    }),
    check({
      id: "action-led",
      title: "Action-led bullets",
      points: actionRatio >= 0.7 ? 5 : actionRatio >= 0.4 ? 3 : actionRatio > 0 ? 1 : 0,
      maxPoints: 5,
      evidence: `${actionLedBullets} of ${bulletLines.length} bullets begin with a strong action verb.`,
      recommendation: "Lead each bullet with what you owned or changed, then show the result.",
      acceptance: "At least 70% of bullets begin with a concrete action verb.",
    }),
    check({
      id: "outcome-language",
      title: "Observable outcomes",
      points: outcomeBullets >= 4 ? 4 : outcomeBullets >= 2 ? 3 : outcomeBullets === 1 ? 1 : 0,
      maxPoints: 4,
      evidence: `${outcomeBullets} bullets use outcome language such as shipped, reduced, improved, or grew.`,
      recommendation: "Finish more bullets with what changed for a user, team, system, or business.",
      acceptance: "At least four bullets state an observable outcome.",
    }),
    check({
      id: "proof-sections",
      title: "Experience or project evidence",
      points: hasProofSection ? 4 : 0,
      maxPoints: 4,
      evidence: hasProofSection
        ? "A recognizable experience or projects section is present."
        : "No recognizable experience or projects heading was detected.",
      recommendation: "Add a conventional Experience or Projects heading so evidence is easy to find.",
      acceptance: "A plain-text Experience or Projects section contains the core proof.",
    }),
  ]);
}

function scoreMarket(
  resume: string,
  targetRole: string,
  jobDescription: string,
  market: MarketSignal[]
): {
  scorecard: ResumeScorecard;
  marketMatched: number;
  marketChecked: number;
  targetMatched: number;
  targetChecked: number;
} {
  const targetText = [targetRole, jobDescription].filter(Boolean).join(" ");
  const relevantSignals = market
    .filter((signal) => SKILL_ALIASES[signal.slug]?.test(targetText))
    .slice(0, 8);
  const signalsChecked = relevantSignals.length > 0 ? relevantSignals : market.slice(0, 4);
  const matchedSignals = signalsChecked.filter((signal) => SKILL_ALIASES[signal.slug]?.test(resume));
  const totalDemand = signalsChecked.reduce(
    (sum, signal) => sum + Math.max(signal.demandScore, 1),
    0
  );
  const matchedDemand = matchedSignals.reduce(
    (sum, signal) => sum + Math.max(signal.demandScore, 1),
    0
  );
  const weightedCoverage = totalDemand === 0 ? 0 : clamp(matchedDemand / totalDemand, 0, 1);
  const proofTarget = Math.min(3, signalsChecked.length);
  const marketPoints =
    proofTarget === 0
      ? 0
      : matchedSignals.length >= proofTarget
        ? 8
        : matchedSignals.length === 2
          ? 6
          : matchedSignals.length === 1
            ? Math.max(2, Math.round(4 * weightedCoverage))
            : 0;
  const targetTokens = [...new Set(words(targetRole).filter((token) => !STOP_WORDS.has(token)))];
  const roleMatched = targetTokens.filter((token) => resume.toLowerCase().includes(token)).length;
  const roleRatio = targetTokens.length === 0 ? 0 : roleMatched / targetTokens.length;
  const rolePoints = targetTokens.length === 0 ? 0 : roleRatio >= 0.8 ? 4 : roleRatio >= 0.4 ? 2 : 0;
  const targetKeywords = extractTargetKeywords(jobDescription);
  const matchedTargetKeywords = targetKeywords.filter((keyword) =>
    resume.toLowerCase().includes(keyword)
  );
  const targetRatio =
    targetKeywords.length === 0 ? 0 : matchedTargetKeywords.length / targetKeywords.length;
  const targetPoints =
    targetKeywords.length === 0
      ? 0
      : targetRatio >= 0.75
        ? 8
        : targetRatio >= 0.5
          ? 6
          : targetRatio >= 0.25
            ? 3
            : matchedTargetKeywords.length > 0
              ? 1
              : 0;

  const marketEvidence =
    signalsChecked.length === 0
      ? "The live public-board sample was unavailable for this scan."
      : matchedSignals.length > 0
        ? `Matched ${readableList(matchedSignals.map((signal) => signal.name), "no live signals")} across ${signalsChecked.length} market signals relevant to this target.`
        : `No direct match across ${signalsChecked.length} market signals relevant to this target.`;

  return {
    marketMatched: matchedSignals.length,
    marketChecked: signalsChecked.length,
    targetMatched: matchedTargetKeywords.length,
    targetChecked: targetKeywords.length,
    scorecard: makeScorecard("market", "Role-market alignment", [
      check(
        {
          id: "live-market",
          title: "Live market vocabulary",
          points: marketPoints,
          maxPoints: 8,
          evidence: marketEvidence,
          recommendation:
            "Name only the high-demand skills you can prove, then attach each one to a project or outcome.",
          acceptance: "The resume proves at least two relevant skills visible in the current posting sample.",
        },
        signalsChecked.length === 0
      ),
      check(
        {
          id: "target-role",
          title: "Target role language",
          points: rolePoints,
          maxPoints: 4,
          evidence:
            targetTokens.length === 0
              ? "No target role was supplied."
              : `${roleMatched} of ${targetTokens.length} meaningful target-role terms appear in the resume.`,
          recommendation:
            targetTokens.length === 0
              ? "Add the role you are actually applying for above the resume."
              : "Name the target role in the headline or summary only when it is truthful.",
          acceptance:
            targetTokens.length === 0
              ? "A specific target role is supplied."
              : "The resume clearly signals the supplied target role without changing job history.",
        },
        targetTokens.length === 0
      ),
      check(
        {
          id: "target-description",
          title: "Job-description evidence",
          points: targetPoints,
          maxPoints: 8,
          evidence:
            targetKeywords.length === 0
              ? "No job description was supplied."
              : `${matchedTargetKeywords.length} of ${targetKeywords.length} repeated target terms appear: ${readableList(matchedTargetKeywords.slice(0, 6), "none")}.`,
          recommendation:
            targetKeywords.length === 0
              ? "Paste the complete target job description above to replace generic advice with role-specific evidence checks."
              : "Add missing target language only where your experience already supports it. Never copy a requirement you cannot defend.",
          acceptance:
            targetKeywords.length === 0
              ? "A complete target job description is supplied."
              : "At least half of the recurring target terms are backed by truthful resume evidence.",
        },
        targetKeywords.length === 0
      ),
    ]),
  };
}

export function scoreResume(input: ResumeScoreInput): ResumeScore {
  const resume = input.resume.trim();
  const targetRole = input.targetRole?.trim() ?? "";
  const jobDescription = input.jobDescription?.trim() ?? "";
  const market = input.market ?? [];
  const lines = resume.split(/\r?\n/).map((line) => line.trim());
  const wordCount = words(resume).length;
  const bulletLines = extractBulletLines(lines);
  const quantifiedBullets = bulletLines.filter((line) => QUANTIFIED_PATTERN.test(line)).length;
  const actionLedBullets = bulletLines.filter((line) => {
    const first = line.toLowerCase().match(/^[a-z]+/)?.[0];
    return first ? ACTION_VERBS.has(first) : false;
  }).length;
  const recognizedSections = lines.filter((line) =>
    SECTION_PATTERNS.some((pattern) => pattern.test(line.replace(/:$/, "")))
  ).length;
  const links = countMatches(
    resume,
    /(?:https?:\/\/|linkedin(?:\.com)?|github(?:\.com)?|portfolio|[a-z0-9-]+\.(?:com|dev|io|ai)\b)/i
  );
  const technologies = countMatches(
    resume,
    /\b(?:python|typescript|javascript|react|next\.js|node\.js|sql|postgres|aws|gcp|azure|kubernetes|terraform|figma|pytorch|tensorflow|claude|openai|retail|salesforce|hubspot|metabase|tableau)\b/i
  );
  const firstPerson = countMatches(resume, /\b(?:i|me|my|mine)\b/i);
  const filler = countMatches(resume, FILLER_PATTERN);
  const hype = countMatches(resume, HYPE_PATTERN);
  const bulletLengths = bulletLines.map((line) => words(line).length);
  const readableBullets = bulletLengths.filter((length) => length >= 6 && length <= 32).length;
  const readableRatio = bulletLines.length === 0 ? 0 : readableBullets / bulletLines.length;
  const hasEmail = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(resume);
  const hasContactLink = /\b(?:linkedin\.com|github\.com|https?:\/\/|[a-z0-9-]+\.(?:com|dev|io|ai)\b)/i.test(
    resume
  );
  const hasIdentityLine = lines.slice(0, 4).some((line) => line.split(/\s+/).length >= 2);

  const proof = scoreProof(resume, bulletLines, quantifiedBullets, actionLedBullets);
  const marketResult = scoreMarket(resume, targetRole, jobDescription, market);

  const ownershipTerms = countMatches(
    resume,
    /\b(?:owned|led|founded|built|designed|architected|launched|shipped|managed|created|drove|implemented|migrated|scaled)\b/i
  );
  const scopeTerms = countMatches(
    resume,
    /\b(?:team|cross-functional|customers?|clients?|users?|revenue|arr|mrr|budget|production|platform|organization|company-wide|end-to-end)\b/i
  );
  const ownership = makeScorecard("ownership", "Ownership and scope", [
    check({
      id: "ownership-language",
      title: "Clear ownership",
      points: ownershipTerms >= 6 ? 8 : ownershipTerms >= 3 ? 5 : ownershipTerms > 0 ? 2 : 0,
      maxPoints: 8,
      evidence: `${ownershipTerms} ownership verbs detected.`,
      recommendation: "Replace contribution fog with the part you personally owned and the decision you made.",
      acceptance: "At least six bullets make your ownership explicit without overstating team work.",
    }),
    check({
      id: "scope-language",
      title: "Scope is visible",
      points: scopeTerms >= 5 ? 7 : scopeTerms >= 3 ? 5 : scopeTerms > 0 ? 2 : 0,
      maxPoints: 7,
      evidence: `${scopeTerms} scope cues detected across users, teams, systems, production, or business outcomes.`,
      recommendation: "State who or what the work affected and the scale at which it ran.",
      acceptance: "At least three major achievements name an audience, system, team, or business scope.",
    }),
  ]);

  const clarity = makeScorecard("clarity", "Clarity and brevity", [
    check({
      id: "resume-length",
      title: "Useful amount of evidence",
      points: wordCount >= 300 && wordCount <= 900 ? 5 : wordCount >= 180 && wordCount <= 1100 ? 3 : 0,
      maxPoints: 5,
      evidence: `${wordCount} words detected.`,
      recommendation:
        wordCount < 300
          ? "Add the missing proof before polishing wording."
          : "Cut low-signal detail until the strongest evidence is easy to scan.",
      acceptance: "The resume contains roughly 300 to 900 words of relevant evidence.",
    }),
    check({
      id: "bullet-length",
      title: "Readable bullet length",
      points: readableRatio >= 0.8 ? 5 : readableRatio >= 0.5 ? 3 : readableRatio > 0 ? 1 : 0,
      maxPoints: 5,
      evidence: `${readableBullets} of ${bulletLines.length} bullets are between 6 and 32 words.`,
      recommendation: "Split long bullets at the second idea and expand fragments just enough to show action and result.",
      acceptance: "At least 80% of bullets are one scannable idea between 6 and 32 words.",
    }),
    check({
      id: "direct-language",
      title: "Direct professional language",
      points: firstPerson === 0 && filler === 0 ? 5 : firstPerson <= 2 && filler <= 2 ? 3 : 0,
      maxPoints: 5,
      evidence: `${firstPerson} first-person pronouns and ${filler} filler phrases detected.`,
      recommendation: "Remove first-person framing and replace generic traits with evidence.",
      acceptance: "No first-person narration or generic filler remains in achievement bullets.",
    }),
  ]);

  const structure = makeScorecard("structure", "Structure and portability", [
    check({
      id: "identity-contact",
      title: "Identity and contact path",
      points: hasIdentityLine && hasEmail && hasContactLink ? 4 : hasIdentityLine && (hasEmail || hasContactLink) ? 2 : 0,
      maxPoints: 4,
      evidence: `${hasIdentityLine ? "Identity line" : "No clear identity line"}, ${hasEmail ? "email" : "no email"}, and ${hasContactLink ? "professional link" : "no professional link"} detected.`,
      recommendation: "Put your name, email, and strongest professional proof link in the first lines.",
      acceptance: "The header contains a name, email, and LinkedIn, GitHub, or portfolio link.",
    }),
    check({
      id: "conventional-sections",
      title: "Conventional section labels",
      points: recognizedSections >= 4 ? 4 : recognizedSections >= 3 ? 3 : recognizedSections >= 2 ? 1 : 0,
      maxPoints: 4,
      evidence: `${recognizedSections} conventional section headings detected.`,
      recommendation: "Use familiar headings such as Summary, Experience, Projects, Skills, and Education.",
      acceptance: "At least three relevant sections use conventional plain-text headings.",
    }),
    check({
      id: "plain-text-portability",
      title: "Plain-text portability",
      points: bulletLines.length >= 3 && lines.length >= 12 ? 2 : bulletLines.length > 0 ? 1 : 0,
      maxPoints: 2,
      evidence: `${lines.length} text lines and ${bulletLines.length} recognizable bullets survived paste.`,
      recommendation: "Use real text and standard bullets so the resume survives copy and paste.",
      acceptance: "Headings and at least three bullets remain readable as plain text.",
    }),
  ]);

  const specificity = makeScorecard("specificity", "Technical and domain specificity", [
    check({
      id: "named-tools",
      title: "Named tools and methods",
      points: technologies >= 8 ? 5 : technologies >= 4 ? 3 : technologies > 0 ? 1 : 0,
      maxPoints: 5,
      evidence: `${technologies} named tool, stack, or method mentions detected.`,
      recommendation: "Name the tools and methods that materially enabled the result, not every technology you touched.",
      acceptance: "Core achievements name the relevant stack or method where it adds proof.",
    }),
    check({
      id: "proof-links",
      title: "Inspectable proof",
      points: links >= 3 ? 5 : links >= 2 ? 4 : links === 1 ? 2 : 0,
      maxPoints: 5,
      evidence: `${links} portfolio, GitHub, product, publication, or professional links detected.`,
      recommendation: "Link to the strongest public artifact that lets a reviewer inspect the work.",
      acceptance: "The resume includes at least two relevant proof links, or one strong portfolio with multiple artifacts.",
    }),
  ]);

  const quantifiedWithContext = bulletLines.filter(
    (line) => QUANTIFIED_PATTERN.test(line) && OUTCOME_PATTERN.test(line)
  ).length;
  const integrity = makeScorecard("integrity", "Claim integrity cues", [
    check({
      id: "defensible-tone",
      title: "Defensible tone",
      points: hype === 0 ? 2 : 0,
      maxPoints: 2,
      evidence: `${hype} unsupported superlative or hype phrases detected.`,
      recommendation: "Replace self-ranking language with the evidence a reviewer can inspect.",
      acceptance: "No unsupported superlatives remain.",
    }),
    check({
      id: "metrics-in-context",
      title: "Metrics have context",
      points: quantifiedWithContext >= 3 ? 3 : quantifiedWithContext >= 1 ? 2 : 0,
      maxPoints: 3,
      evidence: `${quantifiedWithContext} bullets pair a number with outcome language. This checks context, not factual truth.`,
      recommendation: "Tie each important number to what changed and be ready to explain how it was measured.",
      acceptance: "At least three metrics are attached to a clear action and outcome you can defend in an interview.",
    }),
  ]);

  const scorecards = [proof, marketResult.scorecard, ownership, clarity, structure, specificity, integrity];
  const rawScore = scorecards.reduce((sum, card) => sum + card.score, 0);
  const capReasons: string[] = [];
  let cap = 100;
  if (wordCount < 120) {
    cap = Math.min(cap, 49);
    capReasons.push("Fewer than 120 words leaves too little evidence for a reliable resume score.");
  }
  if (!PROOF_SECTION_PATTERN.test(resume)) {
    cap = Math.min(cap, 59);
    capReasons.push("No recognizable Experience or Projects section was found.");
  }
  if (!targetRole && !jobDescription) {
    cap = Math.min(cap, 88);
    capReasons.push("No target role or job description was supplied, so target alignment is untested.");
  } else if (!jobDescription) {
    cap = Math.min(cap, 92);
    capReasons.push("No job description was supplied, so role-specific evidence coverage is untested.");
  }
  if (market.length === 0) {
    cap = Math.min(cap, 92);
    capReasons.push("The live public-board market sample was unavailable for this scan.");
  }

  const findings = scorecards
    .flatMap((scorecard) =>
      scorecard.checks
        .filter((item) => item.points < item.maxPoints)
        .map((item): ResumeFinding => ({
          ...item,
          scorecardId: scorecard.id,
          scorecardTitle: scorecard.title,
          pointsAvailable: item.maxPoints - item.points,
        }))
    )
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable || a.title.localeCompare(b.title));

  return {
    score: Math.min(rawScore, cap),
    rawScore,
    cap: cap < 100 ? cap : null,
    capReasons,
    scorecards,
    findings,
    stats: {
      words: wordCount,
      bullets: bulletLines.length,
      quantifiedBullets,
      actionLedBullets,
      recognizedSections,
      marketSkillsMatched: marketResult.marketMatched,
      marketSkillsChecked: marketResult.marketChecked,
      targetKeywordsMatched: marketResult.targetMatched,
      targetKeywordsChecked: marketResult.targetChecked,
    },
  };
}

export function improvementBrief(finding: ResumeFinding): string {
  return [
    `Resume improvement: ${finding.title}`,
    `Observed evidence: ${finding.evidence}`,
    `Smallest truthful change: ${finding.recommendation}`,
    `Done when: ${finding.acceptance}`,
    "Constraint: do not invent metrics, responsibilities, employers, technologies, or outcomes.",
  ].join("\n");
}
