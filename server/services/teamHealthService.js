import User from '../models/User.js';

/**
 * Team Health Analysis Engine
 *
 * Evaluates a team's composition and returns:
 * - healthScore: 0–100
 * - strengths: what the team already has covered
 * - weaknesses: gaps in roles / skills
 * - recommendations: for each missing role, the top 3 matching users from the DB
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Determine which requiredRoles are filled vs missing based on current members.
 */
function analyzeRoleCoverage(requiredRoles, members) {
  const memberRoles = members
    .map((m) => (m.role || '').toLowerCase())
    .filter(Boolean);

  const filled = [];
  const missing = [];

  for (const role of requiredRoles) {
    const roleNorm = role.toLowerCase();
    if (memberRoles.includes(roleNorm)) {
      filled.push(role);
    } else {
      missing.push(role);
    }
  }

  return { filled, missing };
}

/**
 * Calculate skill diversity across all members.
 * Returns a ratio of unique skills vs total skills present (0–1).
 */
function calcSkillDiversity(members) {
  const allSkills = members.flatMap((m) => (m.skills || []).map((s) => s.toLowerCase()));
  if (allSkills.length === 0) return 0;

  const uniqueSkills = new Set(allSkills);
  // High diversity → many unique skills relative to total
  return uniqueSkills.size / allSkills.length;
}

/**
 * Calculate team size score — teams with a healthy count get a bonus.
 * Ideal range: 3–6 members.
 */
function calcTeamSizeScore(memberCount) {
  if (memberCount >= 3 && memberCount <= 6) return 1;
  if (memberCount === 2 || memberCount === 7) return 0.7;
  if (memberCount === 1) return 0.3;
  return 0.5; // 8+ members
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute team health metrics.
 *
 * @param {Object}   team    - Mongoose Team document (must have requiredRoles, members populated)
 * @param {Object[]} members - Array of fully-populated User documents for team members
 * @returns {Promise<{
 *   healthScore: number,
 *   strengths: string[],
 *   weaknesses: string[],
 *   recommendations: { role: string, users: Object[] }[]
 * }>}
 */
export async function computeTeamHealth(team, members) {
  const requiredRoles = team.requiredRoles || [];
  const { filled, missing } = analyzeRoleCoverage(requiredRoles, members);

  // ── Score components ──
  // 1. Role coverage (50% of total)
  const coverageRatio =
    requiredRoles.length > 0 ? filled.length / requiredRoles.length : 1;
  const coverageScore = coverageRatio * 50;

  // 2. Skill diversity (30% of total)
  const diversity = calcSkillDiversity(members);
  const diversityScore = diversity * 30;

  // 3. Team size (20% of total)
  const sizeScore = calcTeamSizeScore(members.length) * 20;

  const healthScore = Math.round(coverageScore + diversityScore + sizeScore);

  // ── Strengths ──
  const strengths = [];
  if (filled.length > 0) {
    strengths.push(`Roles filled: ${filled.join(', ')}`);
  }
  if (diversity >= 0.7) {
    strengths.push('Excellent skill diversity across members');
  } else if (diversity >= 0.4) {
    strengths.push('Good skill variety among team members');
  }
  if (members.length >= 3 && members.length <= 6) {
    strengths.push(`Team size (${members.length}) is ideal for a hackathon`);
  }

  // ── Weaknesses ──
  const weaknesses = [];
  if (missing.length > 0) {
    weaknesses.push(`Missing roles: ${missing.join(', ')}`);
  }
  if (diversity < 0.4) {
    weaknesses.push('Low skill diversity — members share many of the same skills');
  }
  if (members.length < 2) {
    weaknesses.push('Team needs more members');
  }

  // ── Recommendations: for each missing role, query top 3 users ──
  const memberIds = members.map((m) => m._id);
  const recommendations = [];

  for (const role of missing) {
    const candidates = await User.find({
      _id: { $nin: memberIds },
      role: { $regex: new RegExp(`^${escapeRegex(role)}$`, 'i') },
      onboardingComplete: true,
      profileVisibility: true,
    })
      .sort({ githubScore: -1, lastActive: -1 })
      .limit(3)
      .select('name avatar role skills experienceLevel githubScore techStack');

    recommendations.push({
      role,
      users: candidates,
    });
  }

  return { healthScore, strengths, weaknesses, recommendations };
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
