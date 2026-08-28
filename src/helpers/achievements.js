// The rules of the backend core/achievements.py, worth most first.
// The season ladder answer carries only the rules a player earned, so the catalogue the
// locked list needs is kept here until the endpoint returns the unearned ones as well.
export const achievementRules = [
  { id: 'double_up', points: 1000, name: 'Double Up On The Bubble Up', description: 'Reach this seasons ladder goal! TWICE!', icon: 'mdi-chart-bubble' },
  { id: 'ladder_goal', points: 500, name: 'The end of a journey holds the seed of new dreams!', description: 'Reach this seasons ladder goal!', icon: 'mdi-seed-plus' },
  { id: 'i_am_the_captain_now', points: 100, name: "I'm the captain now!", description: 'Win a ladder game vs. a GNL coach!', icon: 'mdi-ferry' },
  { id: 'addicted', points: 100, name: 'Better Living Through Chemistry', description: 'Play 30 games in 24-hour span', icon: 'mdi-flask' },
  { id: 'elite', points: 100, name: '1337', description: 'Get your MMR to 1337', icon: 'mdi-emoticon-cool-outline' },
  { id: 'winner_winner', points: 50, name: 'Winner winner chicken dinner!', description: 'Win 100 games', icon: 'mdi-food-drumstick' },
  { id: 'sad_trombone', points: 50, name: 'Sad Trombone', description: 'Lose 100 games', icon: 'mdi-trumpet' },
  { id: 'dats_fakt_ap', points: 50, name: 'DATS FAKT AP', description: 'Lose 10 games in a row', icon: 'mdi-egg' },
  { id: 'win_streak_2', points: 50, name: 'Who can stop me?!', description: 'Win 10 games in a row', icon: 'mdi-karate' },
  { id: 'lose_first', points: 25, name: "When I'm In Command, Every Mission Is A Suicide Mission.", description: 'Lose your first GNL game', icon: 'mdi-skull' },
  { id: 'win_streak', points: 25, name: 'Connect Five!', description: 'Win 5 games in a row', icon: 'mdi-tally-mark-5' },
  { id: 'win_every_map', points: 25, name: 'Dora the explorer', description: 'Win a game on every ladder map', icon: 'mdi-map-check' },
  { id: 'rising_star', points: 25, name: 'I know kung fu', description: 'Earn over 100 MMR in a single day', icon: 'mdi-brain' },
  { id: 'falling_star', points: 25, name: 'Did you even say thank you?', description: 'Lose over 100 MMR in a single day', icon: 'mdi-account-tie' },
  { id: 'win_first', points: 15, name: 'I am the danger!', description: 'Win your first GNL game', icon: 'mdi-redhat' },
  { id: 'duck_hunting', points: 10, name: 'Hunting Season!', description: 'Defeat a player from an opposing team', icon: 'mdi-target-account' },
  { id: 'night_elf', points: 10, name: 'Destroyer of Trees', description: 'Win 10+ games vs. Night Elf', icon: 'mdi-shield-moon' },
  { id: 'undead', points: 10, name: 'Bane of the Scourge', description: 'Win 10+ games vs. Undead', icon: 'mdi-ghost-outline' },
  { id: 'orc', points: 10, name: 'Reaper of Greenskins', description: 'Win 10+ games vs. Orc', icon: 'mdi-paw-outline' },
  { id: 'human', points: 10, name: 'A plague upon Humanity', description: 'Win 10+ games vs. Human', icon: 'mdi-wizard-hat' },
  { id: 'join_them', points: 10, name: "If you can't beat them...", description: 'Win and Lose a game that lasted over 30min', icon: 'mdi-handshake' },
  { id: 'winter', points: 10, name: 'A true Stark', description: 'Win a game on every winter map', icon: 'mdi-weather-snowy-heavy' },
  { id: 'holiday', points: 5, name: "I'm on holiday!", description: 'Win a game on Tide Hunters', icon: 'mdi-palm-tree' },
  { id: 'newbie', points: 5, name: 'Don’t be afraid to try something new!', description: 'Win a game on every NEW map!', icon: 'mdi-new-box' },
];

// What the earned badges add to the ladder points
export function achievementPoints(earned) {
  return (earned ?? []).reduce((sum, badge) => sum + badge.points, 0);
}

// The rules the player has not earned yet, so the panel reads as the catalogue
export function lockedAchievements(earned) {
  const won = new Set((earned ?? []).map(badge => badge.id));
  return achievementRules.filter(rule => !won.has(rule.id));
}
