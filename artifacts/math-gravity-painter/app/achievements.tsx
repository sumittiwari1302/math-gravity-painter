import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { ACHIEVEMENTS } from "@/data/achievements";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

function getProgress(type: string, value: number, stats: any, levelsCompleted: number): number {
  switch (type) {
    case "levels_completed": return Math.min(levelsCompleted / value, 1);
    case "worlds_completed": return Math.min(stats.worldsCompleted / value, 1);
    case "stars_collected": return Math.min(stats.starsCollected / value, 1);
    case "questions_correct": return Math.min(stats.questionsCorrect / value, 1);
    case "coins_earned": return Math.min(stats.coinsEarned / value, 1);
    case "perfect_levels": return Math.min(stats.perfectLevels / value, 1);
    case "worlds_played": return Math.min(stats.worldsPlayed.size / value, 1);
    case "streak": return Math.min(stats.currentStreak / value, 1);
    default: return 0;
  }
}

function getCurrentValue(type: string, stats: any, levelsCompleted: number): number {
  switch (type) {
    case "levels_completed": return levelsCompleted;
    case "worlds_completed": return stats.worldsCompleted;
    case "stars_collected": return stats.starsCollected;
    case "questions_correct": return stats.questionsCorrect;
    case "coins_earned": return stats.coinsEarned;
    case "perfect_levels": return stats.perfectLevels;
    case "worlds_played": return stats.worldsPlayed.size;
    case "streak": return stats.currentStreak;
    default: return 0;
  }
}

export default function AchievementsScreen() {
  const { unlockedAchievements, stats, stats: { levelsCompleted } } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const unlocked = ACHIEVEMENTS.filter(a => {
    const prog = getProgress(a.requirement.type, a.requirement.value, stats, levelsCompleted);
    return prog >= 1;
  });
  const inProgress = ACHIEVEMENTS.filter(a => {
    const prog = getProgress(a.requirement.type, a.requirement.value, stats, levelsCompleted);
    return prog > 0 && prog < 1;
  });
  const locked = ACHIEVEMENTS.filter(a => {
    const prog = getProgress(a.requirement.type, a.requirement.value, stats, levelsCompleted);
    return prog === 0;
  });

  const renderAchievement = (ach: typeof ACHIEVEMENTS[0], achieved: boolean) => {
    const prog = getProgress(ach.requirement.type, ach.requirement.value, stats, levelsCompleted);
    const current = getCurrentValue(ach.requirement.type, stats, levelsCompleted);

    return (
      <View key={ach.id} style={[styles.card, achieved && styles.cardAchieved]}>
        <View style={[styles.iconWrap, { backgroundColor: achieved ? colors.gold + "30" : colors.surface }]}>
          <Feather name={ach.icon as any} size={24} color={achieved ? colors.gold : colors.textDim} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: achieved ? colors.white : colors.textMuted }]}>{ach.title}</Text>
          <Text style={styles.desc}>{ach.description}</Text>
          {!achieved && (
            <View style={styles.progressRow}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.round(prog * 100)}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>{current}/{ach.requirement.value}</Text>
            </View>
          )}
        </View>
        {achieved && <Feather name="check-circle" size={22} color={colors.gold} />}
      </View>
    );
  };

  return (
    <SpaceBackground>
      <CoinBar title="Achievements" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{unlocked.length}</Text>
            <Text style={styles.summaryLabel}>Earned</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNum, { color: colors.accent }]}>{ACHIEVEMENTS.length - unlocked.length}</Text>
            <Text style={styles.summaryLabel}>Remaining</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNum, { color: colors.gold }]}>{Math.round(unlocked.length / ACHIEVEMENTS.length * 100)}%</Text>
            <Text style={styles.summaryLabel}>Complete</Text>
          </View>
        </View>

        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earned ({unlocked.length})</Text>
            {unlocked.map(a => renderAchievement(a, true))}
          </>
        )}

        {inProgress.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>In Progress ({inProgress.length})</Text>
            {inProgress.map(a => renderAchievement(a, false))}
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Locked ({locked.length})</Text>
            {locked.map(a => renderAchievement(a, false))}
          </>
        )}
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  summaryNum: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.white },
  summaryLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.textMuted, marginTop: 10, marginBottom: 4 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardAchieved: { borderColor: colors.gold + "50" },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  title: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  desc: { fontSize: 12, color: colors.textMuted },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  progressBg: { flex: 1, height: 5, backgroundColor: colors.surface, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 3 },
  progressLabel: { fontSize: 11, color: colors.textMuted, minWidth: 40, textAlign: "right" },
});
