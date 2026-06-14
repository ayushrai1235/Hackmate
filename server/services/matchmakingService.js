/**
 * AI Matchmaking Engine
 *
 * Computes a compatibility score between two users based on five weighted factors.
 * Returns { score: 0–100, reasons: string[] } with human-readable explanations for
 * the top 3 contributing factors.
 *
 * Scoring Rubric
 * ──────────────────────────────────
 * Factor                  Max pts
 * ──────────────────────────────────
 * Complementary skills       30
 * Role match                 25
 * Experience compatibility   20
 * Shared hackathon interests 15
 * GitHub score proximity     10
 * ──────────────────────────────────
 */

// ── Factor helpers ──────────────────────────────────────────────────────────

/**
 * Complementary skills (max 30 pts)
 * Skills in userA's `lookingFor` that userB actually has.
 */
function scoreComplementarySkills(userA, userB) {
  const looking = (userA.lookingFor || []).map((s) => s.toLowerCase());
  const bSkills = (userB.skills || []).map((s) => s.toLowerCase());

  if (looking.length === 0 || bSkills.length === 0) {
    return { points: 0, reason: null };
  }

  const complementary = looking.filter((s) => bSkills.includes(s));
  const ratio = complementary.length / looking.length;
  const points = Math.round(ratio * 30);

  const reason =
    complementary.length > 0
      ? `${userB.name || 'They'} bring${complementary.length > 1 ? '' : 's'} ${complementary.length} skill${complementary.length > 1 ? 's' : ''} you're looking for: ${complementary.slice(0, 3).join(', ')}`
      : null;

  return { points, reason };
}

/**
 * Role match (max 25 pts)
 * Full credit if B's role is explicitly in A's `lookingFor`.
 * Half credit if there's a reverse match (A's role in B's lookingFor).
 */
function scoreRoleMatch(userA, userB) {
  const lookingNorm = (userA.lookingFor || []).map((l) => l.toLowerCase());
  const bRole = (userB.role || '').toLowerCase();

  if (!bRole || lookingNorm.length === 0) {
    return { points: 0, reason: null };
  }

  if (lookingNorm.includes(bRole)) {
    return {
      points: 25,
      reason: `${userB.name || 'They'} fill${userB.name ? 's' : ''} the ${userB.role} role you need`,
    };
  }

  // Check reverse match
  const bLooking = (userB.lookingFor || []).map((l) => l.toLowerCase());
  const aRole = (userA.role || '').toLowerCase();
  if (aRole && bLooking.includes(aRole)) {
    return {
      points: 12,
      reason: `${userB.name || 'They'} ${userB.name ? 'is' : 'are'} looking for your ${userA.role} skills`,
    };
  }

  return { points: 0, reason: null };
}

/**
 * Experience compatibility (max 20 pts)
 * Same level → full 20, adjacent level → 12, two apart → 4.
 */
function scoreExperience(userA, userB) {
  const LEVELS = ['beginner', 'intermediate', 'advanced'];
  const aIdx = LEVELS.indexOf((userA.experienceLevel || '').toLowerCase());
  const bIdx = LEVELS.indexOf((userB.experienceLevel || '').toLowerCase());

  if (aIdx < 0 || bIdx < 0) {
    return { points: 0, reason: null };
  }

  const diff = Math.abs(aIdx - bIdx);
  let points, reason;

  if (diff === 0) {
    points = 20;
    reason = `Both at ${userA.experienceLevel} level — great synergy`;
  } else if (diff === 1) {
    points = 12;
    reason = `Nearby experience levels (${userA.experienceLevel} ↔ ${userB.experienceLevel}) — complementary`;
  } else {
    points = 4;
    reason = `Different experience levels — can mentor each other`;
  }

  return { points, reason };
}

/**
 * Shared hackathon interests (max 15 pts)
 * Overlap in `techStack` arrays (Jaccard-style ratio).
 */
function scoreSharedInterests(userA, userB) {
  const aStack = (userA.techStack || []).map((t) => t.toLowerCase());
  const bStack = (userB.techStack || []).map((t) => t.toLowerCase());

  if (aStack.length === 0 || bStack.length === 0) {
    return { points: 0, reason: null };
  }

  const overlap = aStack.filter((t) => bStack.includes(t));
  const union = new Set([...aStack, ...bStack]).size;
  const ratio = union > 0 ? overlap.length / union : 0;
  const points = Math.round(ratio * 15);

  const reason =
    overlap.length > 0
      ? `${overlap.length} shared tech interest${overlap.length > 1 ? 's' : ''}: ${overlap.slice(0, 3).join(', ')}`
      : null;

  return { points, reason };
}

/**
 * GitHub score proximity (max 10 pts)
 * Inverse of the normalized delta between the two users' GitHub scores.
 * If both have 0 or missing scores, return neutral 5 pts.
 */
function scoreGithubProximity(userA, userB) {
  const aScore = userA.githubScore ?? 0;
  const bScore = userB.githubScore ?? 0;

  if (aScore === 0 && bScore === 0) {
    return { points: 5, reason: null };
  }

  const delta = Math.abs(aScore - bScore);
  // Cap delta at 100 — scores beyond that yield 0 pts
  const points = Math.max(0, Math.round(10 * (1 - delta / 100)));

  const reason =
    points >= 7
      ? `Similar GitHub activity levels (scores: ${aScore} vs ${bScore})`
      : null;

  return { points, reason };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute a match score between two user documents.
 *
 * @param {Object} userA  - Mongoose user document (the requester)
 * @param {Object} userB  - Mongoose user document (the candidate)
 * @returns {{ score: number, reasons: string[] }}
 */
export function computeMatchScore(userA, userB) {
  const factors = [
    { ...scoreComplementarySkills(userA, userB), label: 'complementary_skills' },
    { ...scoreRoleMatch(userA, userB), label: 'role_match' },
    { ...scoreExperience(userA, userB), label: 'experience' },
    { ...scoreSharedInterests(userA, userB), label: 'shared_interests' },
    { ...scoreGithubProximity(userA, userB), label: 'github_proximity' },
  ];

  const totalPoints = factors.reduce((sum, f) => sum + f.points, 0);

  // Normalize to 0–100 (max possible is 30+25+20+15+10 = 100)
  const score = Math.min(100, Math.max(0, totalPoints));

  // Pick up to 3 reasons from the highest-scoring factors (skip null reasons)
  const reasons = factors
    .filter((f) => f.reason !== null)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((f) => f.reason);

  return { score, reasons };
}
