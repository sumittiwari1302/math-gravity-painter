import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GameCanvas } from "@/components/game/GameCanvas";
import { FloatingToolbar } from "@/components/game/FloatingToolbar";
import type { DrawTool } from "@/components/game/FloatingToolbar";
import { MathChallengeModal } from "@/components/game/MathChallengeModal";
import { WORLDS } from "@/data/worlds";
import { MATH_CHALLENGES } from "@/data/mathChallenges";
import { getLevel } from "@/data/levels";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function GameScreen() {
  const { worldId, levelNumber } = useLocalSearchParams<{ worldId: string; levelNumber: string }>();
  const router = useRouter();
  const { completeLevelAction, answerQuestion, equippedItems } = useGame();
  const insets = useSafeAreaInsets();

  const wid = parseInt(worldId ?? "1");
  const lnum = parseInt(levelNumber ?? "1");
  const world = WORLDS.find(w => w.id === wid) ?? WORLDS[0];
  const level = getLevel(wid, lnum);
  const challenges = MATH_CHALLENGES[wid] ?? MATH_CHALLENGES[1];
  const challenge = challenges[Math.min(lnum - 1, challenges.length - 1)];

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const headerH = topPad + 60;
  const canvasH = Math.max(height - headerH - bottomPad, 300);
  const canvasW = width;

  const [selectedTool, setSelectedTool] = useState<DrawTool>("pencil");
  const [showHint, setShowHint] = useState(false);
  const [mathVisible, setMathVisible] = useState(false);
  const [mathSolved, setMathSolved] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [isLaunched, setIsLaunched] = useState(false);
  const [hasPath, setHasPath] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const collectedCountRef = useRef(0);
  const totalStars = level?.starPositions.length ?? 2;

  const ballColor = equippedItems.ball === "ball_purple" ? "#7C3AED"
    : equippedItems.ball === "ball_gold" ? "#F59E0B"
    : equippedItems.ball === "ball_red" ? "#EF4444"
    : equippedItems.ball === "ball_green" ? "#10B981"
    : "#06B6D4";

  const portalColor = equippedItems.portal === "portal_gold" ? "#F59E0B"
    : equippedItems.portal === "portal_purple" ? "#7C3AED"
    : "#06B6D4";

  const handleStarCollected = useCallback((id: string) => {
    collectedCountRef.current += 1;
    setCollectedCount(collectedCountRef.current);
  }, []);

  const handlePortalReached = useCallback(() => {
    if (gameComplete) return;
    setGameComplete(true);
    const stars = collectedCountRef.current >= totalStars ? 3
      : collectedCountRef.current >= Math.ceil(totalStars / 2) ? 2 : 1;
    const coins = stars * 10 + lnum * 5;
    completeLevelAction(`w${wid}l${lnum}`, stars, coins);
    setTimeout(() => {
      router.replace({ pathname: "/complete", params: { worldId: wid, levelNumber: lnum, stars, coins } });
    }, 400);
  }, [gameComplete, totalStars, wid, lnum]);

  const handleMathNeeded = useCallback(() => {
    if (!mathSolved) setMathVisible(true);
  }, [mathSolved]);

  const handleMathCorrect = useCallback(() => {
    setMathVisible(false);
    setMathSolved(true);
    answerQuestion(true);
  }, []);

  const handleMathWrong = useCallback(() => {
    answerQuestion(false);
  }, []);

  const handleReset = () => {
    setIsLaunched(false);
    setCollectedCount(0);
    collectedCountRef.current = 0;
    setHasPath(false);
    setShowHint(false);
    setShouldReset(true);
  };

  const handleLaunch = () => {
    if (hasPath && !isLaunched) {
      setIsLaunched(true);
    }
  };

  if (!level) {
    return (
      <View style={styles.errorView}>
        <Text style={styles.errorText}>Level not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[colors.background, "transparent"]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
        pointerEvents="box-none"
      >
        <Feather name="chevron-left" size={26} color={colors.white} onPress={() => router.back()} style={styles.backBtn} />
        <View style={styles.headerCenter}>
          <Text style={[styles.levelLabel, { color: world.color }]}>{world.emoji} Level {lnum}</Text>
        </View>
        <View style={styles.starsDisplay}>
          {Array.from({ length: totalStars }).map((_, i) => (
            <Feather
              key={i}
              name="star"
              size={18}
              color={i < collectedCount ? colors.gold : colors.textDim}
            />
          ))}
        </View>
        {mathSolved && (
          <View style={[styles.solvedBadge, { backgroundColor: colors.green + "30" }]}>
            <Feather name="check-circle" size={13} color={colors.green} />
            <Text style={styles.solvedText}>Solved!</Text>
          </View>
        )}
      </LinearGradient>

      {/* Game Canvas */}
      <View style={[styles.canvasContainer, { backgroundColor: world.color + "08" }]}>
        <GameCanvas
          level={level}
          selectedTool={selectedTool}
          showHint={showHint}
          mathSolved={mathSolved}
          portalColor={portalColor}
          ballColor={ballColor}
          onStarCollected={handleStarCollected}
          onPortalReached={handlePortalReached}
          onMathNeeded={handleMathNeeded}
          isLaunched={isLaunched}
          setIsLaunched={setIsLaunched}
          canvasWidth={canvasW}
          canvasHeight={canvasH}
          onPathDrawn={setHasPath}
          shouldReset={shouldReset}
          onResetDone={() => setShouldReset(false)}
        />

        {/* Floating Toolbar */}
        <FloatingToolbar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onUndo={() => {}} // handled inside canvas via key prop approach
          onClear={handleReset}
          onLaunch={handleLaunch}
          onHint={() => setShowHint(v => !v)}
          canLaunch={hasPath && !isLaunched}
          isLaunched={isLaunched}
        />

        {/* Reset button when launched */}
        {isLaunched && !gameComplete && (
          <View style={styles.resetRow}>
            <Feather name="rotate-ccw" size={22} color={colors.white} onPress={handleReset} style={styles.resetBtn} />
          </View>
        )}

        {/* Math hint bar */}
        {!mathSolved && (
          <View style={[styles.mathBar, { borderColor: world.color + "40" }]}>
            <Feather name="lock" size={13} color={world.color} />
            <Text style={[styles.mathBarText, { color: world.color }]}>Tap portal to solve math!</Text>
            <Feather name="zap" size={13} color={world.color} onPress={() => setMathVisible(true)} />
          </View>
        )}
      </View>

      {/* Math Challenge Modal */}
      <MathChallengeModal
        visible={mathVisible}
        challenge={challenge}
        worldColor={world.color}
        onCorrect={handleMathCorrect}
        onWrong={handleMathWrong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  levelLabel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  starsDisplay: { flexDirection: "row", gap: 4 },
  solvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  solvedText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.green },
  canvasContainer: { flex: 1 },
  resetRow: { position: "absolute", top: 20, right: 16, zIndex: 5 },
  resetBtn: { padding: 8, backgroundColor: colors.card + "AA", borderRadius: 16 },
  mathBar: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.card + "EE",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  mathBarText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  errorView: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.white, fontSize: 18 },
});
