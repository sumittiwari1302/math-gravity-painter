export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: { type: string; value: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_level", title: "First Steps", description: "Complete your first level", icon: "star", requirement: { type: "levels_completed", value: 1 } },
  { id: "level_5", title: "Rising Star", description: "Complete 5 levels", icon: "star", requirement: { type: "levels_completed", value: 5 } },
  { id: "level_10", title: "Space Explorer", description: "Complete 10 levels", icon: "star", requirement: { type: "levels_completed", value: 10 } },
  { id: "level_25", title: "Gravity Master", description: "Complete 25 levels", icon: "award", requirement: { type: "levels_completed", value: 25 } },
  { id: "level_50", title: "Math Champion", description: "Complete 50 levels", icon: "award", requirement: { type: "levels_completed", value: 50 } },
  { id: "level_75", title: "Universe Solver", description: "Complete all 75 levels!", icon: "award", requirement: { type: "levels_completed", value: 75 } },
  { id: "first_world", title: "World Conqueror", description: "Complete your first world", icon: "globe", requirement: { type: "worlds_completed", value: 1 } },
  { id: "all_worlds", title: "Galaxy Champion", description: "Complete all 5 worlds", icon: "globe", requirement: { type: "worlds_completed", value: 5 } },
  { id: "stars_50", title: "Star Collector", description: "Collect 50 stars", icon: "star", requirement: { type: "stars_collected", value: 50 } },
  { id: "stars_100", title: "Star Hoarder", description: "Collect 100 stars", icon: "star", requirement: { type: "stars_collected", value: 100 } },
  { id: "stars_200", title: "Galaxy of Stars", description: "Collect 200 stars", icon: "star", requirement: { type: "stars_collected", value: 200 } },
  { id: "questions_10", title: "Math Student", description: "Answer 10 questions correctly", icon: "book", requirement: { type: "questions_correct", value: 10 } },
  { id: "questions_50", title: "Math Genius", description: "Answer 50 questions correctly", icon: "book", requirement: { type: "questions_correct", value: 50 } },
  { id: "questions_100", title: "Math Master", description: "Answer 100 questions correctly", icon: "book", requirement: { type: "questions_correct", value: 100 } },
  { id: "coins_100", title: "Space Shopper", description: "Earn 100 coins", icon: "dollar-sign", requirement: { type: "coins_earned", value: 100 } },
  { id: "coins_500", title: "Cosmic Millionaire", description: "Earn 500 coins", icon: "dollar-sign", requirement: { type: "coins_earned", value: 500 } },
  { id: "perfect_level", title: "Perfect!", description: "Get 3 stars on any level", icon: "award", requirement: { type: "perfect_levels", value: 1 } },
  { id: "perfect_5", title: "Perfectionist", description: "Get 3 stars on 5 levels", icon: "award", requirement: { type: "perfect_levels", value: 5 } },
  { id: "math_explorer", title: "Math Explorer", description: "Play all 5 worlds", icon: "compass", requirement: { type: "worlds_played", value: 5 } },
  { id: "streak_5", title: "On Fire!", description: "Complete 5 levels in a row", icon: "zap", requirement: { type: "streak", value: 5 } },
];
