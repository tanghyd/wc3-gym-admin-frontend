// What the earned badges add to the ladder points
export function achievementPoints(earned) {
  return (earned ?? []).reduce((sum, badge) => sum + badge.points, 0);
}
