import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { GlowButton } from "@/components/ui/GlowButton";
import { WORLDS } from "@/data/worlds";
import { MATH_CHALLENGES } from "@/data/mathChallenges";
import colors from "@/constants/colors";

export default function ChallengeScreen() {
  const { worldId, levelNumber } = useLocalSearchParams<{ worldId: string; levelNumber: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const wid = parseInt(worldId ?? "1");
  const lnum = parseInt(levelNumber ?? "1");
  const world = WORLDS.find(w => w.id === wid) ?? WORLDS[0];
  const challenges = MATH_CHALLENGES[wid] ?? MATH_CHALLENGES[1];
  const challengeIdx = Math.min(lnum - 1, challenges.length - 1);
  const challenge = challenges[challengeIdx];

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleContinue = () => {
    router.push({ pathname: "/game", params: { worldId: wid, levelNumber: lnum } });
  };

  const difficultyLabel = lnum <= 5 ? "Very Easy" : lnum <= 10 ? "Easy" : "Medium";
  const difficultyColor = lnum <= 5 ? colors.green : lnum <= 10 ? colors.gold : colors.orange;

  return (
    <SpaceBackground>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topRow}>
            <Feather name="chevron-left" size={26} color={colors.white} onPress={() => router.back()} />
            <View style={styles.levelBadge}>
              <Text style={[styles.levelText, { color: world.color }]}>{world.emoji} Level {lnum}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: difficultyColor + "30" }]}>
              <Text style={[styles.diffText, { color: difficultyColor }]}>{difficultyLabel}</Text>
            </View>
          </View>

          {/* World Info */}
          <View style={[styles.worldCard, { borderColor: world.color + "50" }]}>
            <LinearGradient colors={[world.color + "30", "transparent"]} style={styles.gradient}>
              <Text style={styles.worldTitle}>{world.name}</Text>
              <Text style={styles.worldTopic}>Topic: {world.topic}</Text>
            </LinearGradient>
          </View>

          {/* Fun Fact */}
          <View style={styles.factCard}>
            <View style={styles.factHeader}>
              <Text style={styles.factIcon}>🧠</Text>
              <Text style={styles.factTitle}>Fun Fact</Text>
            </View>
            <Text style={styles.factText}>{challenge.funFact}</Text>
          </View>

          {/* Math Puzzle Preview */}
          <View style={[styles.puzzleCard, { borderColor: world.color + "40" }]}>
            <View style={styles.puzzleHeader}>
              <Feather name="zap" size={16} color={world.color} />
              <Text style={[styles.puzzleTitle, { color: world.color }]}>Math Challenge Preview</Text>
            </View>
            <Text style={styles.puzzleQuestion}>{challenge.question}</Text>
            <Text style={styles.puzzleHint}>Solve this to unlock the portal in-game!</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>How to Play</Text>
            <View style={styles.tip}>
              <Text style={styles.tipNum}>1</Text>
              <Text style={styles.tipText}>Draw a path from the ball to collect stars</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipNum}>2</Text>
              <Text style={styles.tipText}>Answer the math question to unlock the portal</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipNum}>3</Text>
              <Text style={styles.tipText}>Launch the ball and reach the portal to win!</Text>
            </View>
          </View>

          <GlowButton
            label="Play Level"
            onPress={handleContinue}
            color={world.color}
            size="lg"
            style={{ width: "100%" }}
          />
        </ScrollView>
      </Animated.View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  levelBadge: { flex: 1 },
  levelText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  diffText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  worldCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  gradient: { padding: 20 },
  worldTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: colors.white, marginBottom: 4 },
  worldTopic: { fontSize: 14, color: colors.textMuted },
  factCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  factHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  factIcon: { fontSize: 22 },
  factTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.white },
  factText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  puzzleCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  puzzleHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  puzzleTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  puzzleQuestion: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.white, textAlign: "center" },
  puzzleHint: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  tipsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.white, marginBottom: 4 },
  tip: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: colors.white,
  },
  tipText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});
