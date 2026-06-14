import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface LevelProgress {
  completed: boolean;
  stars: number; // 0-3
  bestScore: number;
}

interface Stats {
  totalPlayTime: number;
  levelsCompleted: number;
  questionsAnswered: number;
  questionsCorrect: number;
  starsCollected: number;
  coinsEarned: number;
  perfectLevels: number;
  worldsCompleted: number;
  worldsPlayed: Set<number>;
  currentStreak: number;
}

interface GameState {
  username: string;
  coins: number;
  totalStars: number;
  levelProgress: Record<string, LevelProgress>;
  ownedItems: string[];
  equippedItems: Record<string, string>;
  stats: Stats;
  unlockedAchievements: string[];
}

interface GameContextType extends GameState {
  setUsername: (name: string) => void;
  completeLevelAction: (levelId: string, stars: number, coinsEarned: number) => void;
  answerQuestion: (correct: boolean) => void;
  buyItem: (itemId: string, price: number) => boolean;
  equipItem: (category: string, itemId: string) => void;
  addPlayTime: (seconds: number) => void;
  resetProgress: () => void;
  hasLevelProgress: (levelId: string) => boolean;
  isLevelUnlocked: (worldId: number, levelNumber: number) => boolean;
  getWorldProgress: (worldId: number) => { completed: number; total: number; stars: number };
}

const GameContext = createContext<GameContextType | null>(null);
const STORAGE_KEY = "mgp_gamestate";

const defaultStats: Stats = {
  totalPlayTime: 0,
  levelsCompleted: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  starsCollected: 0,
  coinsEarned: 0,
  perfectLevels: 0,
  worldsCompleted: 0,
  worldsPlayed: new Set<number>(),
  currentStreak: 0,
};

const defaultState: GameState = {
  username: "",
  coins: 0,
  totalStars: 0,
  levelProgress: {},
  ownedItems: ["ball_blue", "trail_none", "portal_blue", "bg_space"],
  equippedItems: { ball: "ball_blue", trail: "trail_none", portal: "portal_blue", background: "bg_space" },
  stats: defaultStats,
  unlockedAchievements: [],
};

function serializeState(state: GameState): string {
  return JSON.stringify({
    ...state,
    stats: { ...state.stats, worldsPlayed: Array.from(state.stats.worldsPlayed) },
  });
}

function deserializeState(raw: string): Partial<GameState> {
  const parsed = JSON.parse(raw);
  if (parsed.stats?.worldsPlayed) {
    parsed.stats.worldsPlayed = new Set(parsed.stats.worldsPlayed);
  }
  return parsed;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(defaultState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = deserializeState(raw);
          setState(s => ({
            ...s,
            ...parsed,
            stats: { ...defaultStats, ...parsed.stats },
          }));
        } catch {}
      }
    });
  }, []);

  const save = useCallback((next: GameState) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, serializeState(next));
  }, []);

  const setUsername = useCallback((name: string) => {
    save({ ...state, username: name });
  }, [state, save]);

  const completeLevelAction = useCallback((levelId: string, stars: number, coinsEarned: number) => {
    const prev = state.levelProgress[levelId];
    const isNew = !prev?.completed;
    const betterStars = !prev || stars > prev.stars;
    const starsDiff = betterStars ? stars - (prev?.stars ?? 0) : 0;

    const worldsPlayed = new Set(state.stats.worldsPlayed);
    const worldId = parseInt(levelId.replace(/w(\d+)l.*/, "$1"));
    worldsPlayed.add(worldId);

    const newStats: Stats = {
      ...state.stats,
      levelsCompleted: state.stats.levelsCompleted + (isNew ? 1 : 0),
      starsCollected: state.stats.starsCollected + Math.max(0, starsDiff),
      coinsEarned: state.stats.coinsEarned + coinsEarned,
      perfectLevels: state.stats.perfectLevels + (stars === 3 && !prev?.completed ? 1 : 0),
      currentStreak: state.stats.currentStreak + (isNew ? 1 : 0),
      worldsPlayed,
    };

    const newProgress = {
      ...state.levelProgress,
      [levelId]: { completed: true, stars: Math.max(prev?.stars ?? 0, stars), bestScore: Math.max(prev?.bestScore ?? 0, coinsEarned) },
    };

    save({
      ...state,
      coins: state.coins + coinsEarned,
      totalStars: state.totalStars + Math.max(0, starsDiff),
      levelProgress: newProgress,
      stats: newStats,
    });
  }, [state, save]);

  const answerQuestion = useCallback((correct: boolean) => {
    const newStats: Stats = {
      ...state.stats,
      questionsAnswered: state.stats.questionsAnswered + 1,
      questionsCorrect: state.stats.questionsCorrect + (correct ? 1 : 0),
    };
    save({ ...state, stats: newStats });
  }, [state, save]);

  const buyItem = useCallback((itemId: string, price: number): boolean => {
    if (state.coins < price || state.ownedItems.includes(itemId)) return false;
    save({
      ...state,
      coins: state.coins - price,
      ownedItems: [...state.ownedItems, itemId],
    });
    return true;
  }, [state, save]);

  const equipItem = useCallback((category: string, itemId: string) => {
    if (!state.ownedItems.includes(itemId)) return;
    save({
      ...state,
      equippedItems: { ...state.equippedItems, [category]: itemId },
    });
  }, [state, save]);

  const addPlayTime = useCallback((seconds: number) => {
    save({ ...state, stats: { ...state.stats, totalPlayTime: state.stats.totalPlayTime + seconds } });
  }, [state, save]);

  const resetProgress = useCallback(() => {
    save({ ...defaultState, username: state.username });
  }, [state.username, save]);

  const hasLevelProgress = useCallback((levelId: string) => {
    return !!state.levelProgress[levelId];
  }, [state.levelProgress]);

  const isLevelUnlocked = useCallback((worldId: number, levelNumber: number): boolean => {
    if (levelNumber === 1) return true;
    const prevId = `w${worldId}l${levelNumber - 1}`;
    return !!state.levelProgress[prevId]?.completed;
  }, [state.levelProgress]);

  const getWorldProgress = useCallback((worldId: number) => {
    const total = 15;
    let completed = 0;
    let stars = 0;
    for (let i = 1; i <= total; i++) {
      const p = state.levelProgress[`w${worldId}l${i}`];
      if (p?.completed) { completed++; stars += p.stars; }
    }
    return { completed, total, stars };
  }, [state.levelProgress]);

  return (
    <GameContext.Provider value={{
      ...state,
      setUsername,
      completeLevelAction,
      answerQuestion,
      buyItem,
      equipItem,
      addPlayTime,
      resetProgress,
      hasLevelProgress,
      isLevelUnlocked,
      getWorldProgress,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}
