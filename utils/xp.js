/**
 * XP / Levelling helpers
 *
 * API shape (from /get-profile):
 *   xp              – total lifetime XP accumulated
 *   level           – current level number
 *   xp_to_next_level – the xp_required of the CURRENT level (i.e. the XP
 *                      threshold at which this level starts, e.g. 300 for L1)
 *   remaining_xp    – XP still needed to reach the next level
 *   completion_xp   – XP earned within the current level band
 *
 * Levels list shape (from /content/get-levels):
 *   [{ level: 1, xp_required: 300 }, { level: 2, xp_required: 600 }, …]
 *   xp_required is the cumulative XP at which that level BEGINS.
 *
 * Derived values:
 *   bandWidth  = nextLevel.xp_required − currentLevel.xp_required  (e.g. 300)
 *   bandMax    = nextLevel.xp_required − 1                          (e.g. 599)
 *   progressPct = completionXP / bandWidth × 100
 *   label      = "300 / 599 XP"
 */

/**
 * Parse raw profile.data into a clean XP object.
 *
 * @param {object} data        – raw profile API response (profileData.data)
 * @param {Array}  levelsArray – optional array from levelsData.data; when
 *                               provided the progress % and labels are exact.
 */
export function parseXP(data, levelsArray) {
  const xp = data?.xp ?? 0;
  const level = data?.level ?? 1;
  const remainingXP = data?.remaining_xp ?? 0;
  const completionXP = data?.completion_xp ?? 0;

  // ── Derive band boundaries from the levels list ──────────────────────────
  // Each entry: { level, xp_required } where xp_required is the cumulative
  // XP threshold at which that level starts.
  const levels = Array.isArray(levelsArray) ? levelsArray : [];
  const currentLvlEntry = levels.find((l) => l.level === level);
  const nextLvlEntry = levels.find((l) => l.level === level + 1);

  // Band width: how many XP points span the current level.
  // If we have the levels list use it; otherwise fall back to remaining_xp
  // + completion_xp (= xp_to_next_level − 0, but that's actually the start
  // threshold, so remaining + completion is the true band width).
  const bandWidth =
    currentLvlEntry && nextLvlEntry
      ? nextLvlEntry.xp_required - currentLvlEntry.xp_required
      : remainingXP + completionXP > 0
      ? remainingXP + completionXP
      : data?.xp_to_next_level ?? 0;

  // bandMax: the highest XP value still within this level (one below the
  // next level's start), used for the "300 / 599 XP" display label.
  const bandMax = nextLvlEntry ? nextLvlEntry.xp_required - 1 : bandWidth > 0 ? bandWidth - 1 : 0;

  const isMaxLevel = !nextLvlEntry && levels.length > 0 ? true : data?.xp_to_next_level === 0 && levels.length === 0;

  // Progress % within the current level band (0–100).
  // bandMax = nextLevel.xp_required - 1 is the highest XP still in this level,
  // which matches the label denominator ("300 / 599 XP"), so the % is consistent.
  const progressPct = isMaxLevel ? 100 : bandMax > 0 ? Math.min(100, Math.round((completionXP / bandMax) * 100)) : 0;

  return {
    xp, // total lifetime XP
    level,
    completionXP, // XP earned within current level band
    bandWidth, // total width of this level band
    bandMax, // last XP value in this level (nextLevel.xp_required - 1)
    remainingXP, // XP left to level up
    progressPct, // 0–100, drives progress bars
    isMaxLevel,
    // legacy alias so existing destructures still compile
    xpToNextLevel: bandWidth,
  };
}

/**
 * Format XP progress label: "300 / 599 XP"
 * Shows how far the user is through the current level band.
 */
export function xpProgressLabel({ completionXP, bandMax, isMaxLevel }) {
  if (isMaxLevel) return "Max Level";
  return `${completionXP.toLocaleString()} / ${bandMax.toLocaleString()} XP`;
}

/**
 * Format remaining XP label: "299 XP to next level"
 */
export function xpRemainingLabel({ remainingXP, isMaxLevel }) {
  if (isMaxLevel) return "You're at the top!";
  return `${remainingXP.toLocaleString()} XP to next level`;
}
