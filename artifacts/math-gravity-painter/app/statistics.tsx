import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { WORLDS } from "@/data/worlds";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export default function StatisticsScreen() {
  const { stats, totalStars, coins, getWorldProgress } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const accuracy = stats.questionsAnswered > 0
    ? Math.round(stats.questionsCorrect / stats.questionsAnswered * 100) : 0;

  const overallStats = [
    { label: "Levels Completed", value: stats.levelsCompleted.toString(), icon: "layers", color: colors.primary },
    { label: "Stars Collected", value: totalStars.toString(), icon: "star", color: colors.gold },
    { label: "Coins Earned", value: stats.coinsEarned.toString(), icon: "circle", color: colors.goldLight },
    { label: "Questions Answered", value: stats.questionsAnswered.toString(), icon: "help-circle", color: colors.accent },
    { label: "Math Accuracy", value: `${accuracy}%`, icon: "percent", color: colors.green },
    { label: "Perfect Levels", value: stats.perfectLevels.toString(), icon: "award", color: colors.orange },
    { label: "Play Time", value: formatTime(stats.totalPlayTime), icon: "clock", color: colors.pink },
    { label: "Best Streak", value: `${stats.currentStreak} levels`, icon: "zap", color: colors.primaryLight },
  ];

  return (
    <SpaceBackground>
      <CoinBar title="Statistics" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress */}
        <View style={styles.overallCard}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPct}>{Math.round(stats.levelsCompleted / 75 * 100)}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.round(stats.levelsCompleted / 75 * 100)}%` as any }]} />
              </View>
              <Text style={styles.progressDesc}>{stats.levelsCompleted} of 75 levels</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {overallStats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Per World Progress */}
        <Text style={styles.sectionTitle}>World Progress</Text>
        {WORLDS.map(world => {
          const prog = getWorldProgress(world.id);
          const pct = Math.round(prog.completed / 15 * 100);
          return (
            <View key={world.id} style={styles.worldRow}>
              <Text style={styles.worldEmoji}>{world.emoji}</Text>
              <View style={styles.worldInfo}>
                <Text style={styles.worldName}>{world.name}</Text>
                <View style={styles.worldProg}>
                  <View style={styles.worldProgBg}>
                    <View style={[styles.worldProgFill, { width: `${pct}%` as any, backgroundColor: world.color }]} />
                  </View>
                  <Text style={[styles.worldPct, { color: world.color }]}>{pct}%</Text>
                </View>
              </View>
              <View style={styles.worldStars}>
                <Feather name="star" size={12} color={colors.gold} />
                <Text style={styles.worldStarsText}>{prog.stars}/{15 * 3}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.textMuted },
  overallCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  progressCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  progressPct: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.white },
  progressLabel: { fontSize: 10, color: colors.textMuted },
  progressDetails: { flex: 1, gap: 8 },
  progressBg: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  progressDesc: { fontSize: 13, color: colors.textMuted },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", backgroundColor: colors.card, borderRadius: 18, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
  worldRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.border },
  worldEmoji: { fontSize: 24 },
  worldInfo: { flex: 1, gap: 6 },
  worldName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.white },
  worldProg: { flexDirection: "row", alignItems: "center", gap: 8 },
  worldProgBg: { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: "hidden" },
  worldProgFill: { height: "100%", borderRadius: 3 },
  worldPct: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 36, textAlign: "right" },
  worldStars: { flexDirection: "row", alignItems: "center", gap: 3 },
  worldStarsText: { fontSize: 12, color: colors.textMuted },
});
