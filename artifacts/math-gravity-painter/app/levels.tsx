import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { LevelNode } from "@/components/ui/LevelNode";
import { WORLDS } from "@/data/worlds";
import { getLevelsForWorld } from "@/data/levels";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

const DIFFICULTY_LABELS: Record<string, string> = {
  veryEasy: "Very Easy",
  easy: "Easy",
  medium: "Medium",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  veryEasy: colors.green,
  easy: colors.gold,
  medium: colors.orange,
};

export default function LevelsScreen() {
  const { worldId } = useLocalSearchParams<{ worldId: string }>();
  const router = useRouter();
  const { levelProgress, isLevelUnlocked } = useGame();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const wid = parseInt(worldId ?? "1");
  const world = WORLDS.find(w => w.id === wid) ?? WORLDS[0];
  const levels = getLevelsForWorld(wid);

  const groups = [
    { label: "Levels 1-5 · Very Easy", diff: "veryEasy", nums: [1,2,3,4,5] },
    { label: "Levels 6-10 · Easy", diff: "easy", nums: [6,7,8,9,10] },
    { label: "Levels 11-15 · Medium", diff: "medium", nums: [11,12,13,14,15] },
  ];

  const handleLevelPress = (levelNumber: number) => {
    router.push({ pathname: "/challenge", params: { worldId: wid, levelNumber } });
  };

  return (
    <SpaceBackground>
      <CoinBar title={world.name} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* World banner */}
        <View style={[styles.banner, { backgroundColor: world.color + "20", borderColor: world.color + "40" }]}>
          <Text style={styles.bannerEmoji}>{world.emoji}</Text>
          <View>
            <Text style={[styles.bannerName, { color: world.color }]}>{world.name}</Text>
            <Text style={styles.bannerTopic}>{world.topic}</Text>
          </View>
        </View>

        {groups.map(group => (
          <View key={group.diff} style={styles.group}>
            <View style={styles.groupHeader}>
              <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLORS[group.diff] }]} />
              <Text style={[styles.groupLabel, { color: DIFFICULTY_COLORS[group.diff] }]}>{group.label}</Text>
            </View>
            <View style={styles.nodesRow}>
              {group.nums.map(num => {
                const lvl = levels.find(l => l.levelNumber === num);
                if (!lvl) return null;
                const progress = levelProgress[lvl.id];
                const unlocked = isLevelUnlocked(wid, num);
                return (
                  <LevelNode
                    key={num}
                    levelNumber={num}
                    stars={progress?.stars ?? 0}
                    unlocked={unlocked}
                    completed={!!progress?.completed}
                    worldColor={world.color}
                    onPress={() => handleLevelPress(num)}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 24 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  bannerEmoji: { fontSize: 40 },
  bannerName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  bannerTopic: { fontSize: 13, color: colors.textMuted },
  group: { gap: 14 },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  diffDot: { width: 10, height: 10, borderRadius: 5 },
  groupLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  nodesRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
});
