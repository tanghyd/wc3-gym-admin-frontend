// The scoring rule, said once and shown wherever a scored number is
export const SCORED_NOTE =
  'Ladder points and achievements count only games longer than 2 minutes.';

// MMR is w3champions data, so it does not follow the scoring rule
export const MMR_NOTE =
  'MMR comes from w3champions and moves on every game, including the ones too short to score.';

// What the earned badges add to the ladder points
export function achievementPoints(earned) {
  return (earned ?? []).reduce((sum, badge) => sum + badge.points, 0);
}
