import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
import { useSettings } from "@/context/SettingsContext";
import { playVictorySound } from "@/hooks/useVictorySound";
import { GlowButton } from "@/components/ui/GlowButton";
import colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

// Level-specific hint texts
const LEVEL_HINTS: Record<string, string> = {
  "w1l1": "Draw a curved ramp from the ball toward the stars, then sweep up to the portal.",
  "w1l2": "Use the platform as a base — draw a path that bounces off it toward both stars.",
  "w1l3": "Draw a zigzag path to collect the upper star first, then curve down to the portal.",
  "w1l4": "Three stars need one smooth arc — try a wide sweeping S-curve across the canvas.",
  "w1l5": "Start your line above the platform and arc it gently toward the portal.",
  "w2l1": "Draw a diagonal line from the ball down to the stars, then angle toward the portal.",
  "w2l2": "Use the platform edge — draw a ramp that launches the ball across.",
  "w3l1": "Geometry world: try drawing a perfect straight line from start to portal.",
  "w4l1": "Algebra world: mirror your path — equal distance on both sides of the center.",
  "w5l1": "Probability zone: try multiple short lines to guide the ball step by step.",
};

function getHint(worldId: number, levelNumber: number): string {
  const key = `w${worldId}l${levelNumber}`;
  return LEVEL_HINTS[key] ?? `Draw a path from the ball 🔵 through the stars ⭐ to the portal 🌀. Press LAUNCH when ready!`;
}
const CONFETTI_COUNT = 36;

interface ConfettiParticle {
  id: number;
  color: string;
  x: number;
  rotation: string;
  size: number;
  speed: number;
  anim: Animated.Value;
}

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

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 0 : insets.bottom;
  const headerH = topPad + 52;
  const canvasH = Math.max(height - headerH - bottomPad - 110, 300); // 110 = toolbar room
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

  const { sfxVolume } = useSettings();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [earnedStars, setEarnedStars] = useState(1);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);
  const [encouragingMessage, setEncouragingMessage] = useState("");

  const popupScaleAnim = useRef(new Animated.Value(0)).current;
  const popupStarAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const confettiParticles = useRef<ConfettiParticle[]>([]);
  const sparkleAnims = useRef<Animated.Value[]>([]);

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

  const startCelebrationAnimations = useCallback((stars: number) => {
    // Reset animations
    popupScaleAnim.setValue(0);
    popupStarAnims.forEach(anim => anim.setValue(0));
    
    // Create confetti
    const colorsList = ["#FFD700", "#FF4500", "#FF8C00", "#FF1493", "#00FF00", "#00FFFF", "#8A2BE2", "#FF00FF"];
    const particles = Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      id: i,
      color: colorsList[Math.floor(Math.random() * colorsList.length)],
      x: Math.random() * width,
      rotation: `${Math.floor(Math.random() * 360)}deg`,
      size: 6 + Math.random() * 8,
      speed: 1500 + Math.random() * 1200,
      anim: new Animated.Value(0),
    }));
    confettiParticles.current = particles;

    // Create sparkles
    const sparkles = Array.from({ length: 12 }).map(() => new Animated.Value(0));
    sparkleAnims.current = sparkles;
    
    // Encouragement message
    const msgs = {
      3: ["🌟 Amazing Solution!", "🧮 Excellent Work!"],
      2: ["🎉 Great Job!", "🚀 Portal Reached!"],
      1: ["🚀 Portal Reached!", "🎉 Great Job!"],
    };
    const pool = msgs[stars as 3 | 2 | 1] || msgs[1];
    setEncouragingMessage(pool[Math.floor(Math.random() * pool.length)]);

    // Start popup scale anim
    Animated.spring(popupScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Start staggered star animations
    const starAnimations = popupStarAnims.map((anim, idx) => {
      if (idx < stars) {
        return Animated.spring(anim, {
          toValue: 1,
          tension: 70,
          friction: 6,
          useNativeDriver: true,
        });
      }
      return null;
    }).filter(Boolean) as Animated.CompositeAnimation[];

    if (starAnimations.length > 0) {
      Animated.stagger(220, starAnimations).start();
    }

    // Start confetti falling
    const fallingAnims = particles.map(p =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.speed,
        useNativeDriver: true,
      })
    );
    Animated.parallel(fallingAnims).start();

    // Start sparkles burst
    const burstAnims = sparkles.map(s =>
      Animated.sequence([
        Animated.timing(s, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(s, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ])
    );
    Animated.parallel(burstAnims).start();
  }, [width, popupScaleAnim, popupStarAnims]);

  const handlePortalReached = useCallback(() => {
    if (gameComplete) return;
    setGameComplete(true);
    const stars = collectedCountRef.current >= totalStars ? 3
      : collectedCountRef.current >= Math.ceil(totalStars / 2) ? 2 : 1;
    const coins = stars * 10 + lnum * 5;
    const score = stars * 1000 + coins * 100;
    
    // Save progress automatically
    completeLevelAction(`w${wid}l${lnum}`, stars, coins);
    
    // Play audio/haptic celebration
    playVictorySound(sfxVolume);
    
    setEarnedStars(stars);
    setEarnedCoins(coins);
    setEarnedScore(score);
    setShowSuccessPopup(true);
    
    startCelebrationAnimations(stars);
  }, [gameComplete, totalStars, wid, lnum, sfxVolume, completeLevelAction, startCelebrationAnimations]);

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

  const handleReset = useCallback(() => {
    setIsLaunched(false);
    setGameComplete(false);
    setCollectedCount(0);
    collectedCountRef.current = 0;
    setHasPath(false);
    setShowHint(false);
    setShouldReset(true);
    setShowSuccessPopup(false);
  }, []);

  const handleLaunch = useCallback(() => {
    if (hasPath && !isLaunched) {
      setIsLaunched(true);
    }
  }, [hasPath, isLaunched]);

  if (!level) {
    return (
      <View style={styles.errorView}>
        <Text style={styles.errorText}>Level not found</Text>
      </View>
    );
  }

  const hintText = getHint(wid, lnum);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={[colors.background + "FF", colors.background + "00"] as any}
        style={[styles.header, { paddingTop: topPad + 10, height: headerH }]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color={colors.white} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.levelLabel, { color: world.color }]}>{world.emoji} {world.name}</Text>
          <Text style={styles.levelSub}>Level {lnum}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Stars collected */}
          <View style={styles.starsDisplay}>
            {Array.from({ length: totalStars }).map((_, i) => (
              <Feather
                key={i}
                name="star"
                size={16}
                color={i < collectedCount ? colors.gold : colors.textDim}
              />
            ))}
          </View>
          {/* Math status */}
          {mathSolved ? (
            <View style={styles.solvedBadge}>
              <Feather name="check-circle" size={12} color={colors.green} />
              <Text style={styles.solvedText}>Math ✓</Text>
            </View>
          ) : (
            <Pressable onPress={() => setMathVisible(true)} style={styles.mathBadge}>
              <Feather name="zap" size={12} color={world.color} />
              <Text style={[styles.mathBadgeText, { color: world.color }]}>Math</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Game Canvas */}
      <View style={[styles.canvasWrap, { marginTop: headerH - 20, backgroundColor: world.color + "06" }]}>
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
          hintText={hintText}
          gameComplete={gameComplete}
        />
      </View>

      {/* Floating Toolbar */}
      <FloatingToolbar
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        onUndo={() => {}}
        onClear={handleReset}
        onLaunch={handleLaunch}
        onHint={() => setShowHint(v => !v)}
        canLaunch={hasPath && !isLaunched}
        isLaunched={isLaunched}
        showHint={showHint}
      />

      {/* Reset button when ball is in flight */}
      {isLaunched && !gameComplete && (
        <View style={styles.resetRow} pointerEvents="box-none">
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <Feather name="rotate-ccw" size={18} color={colors.white} />
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>
      )}

      {/* Math Challenge Modal */}
      <MathChallengeModal
        visible={mathVisible}
        challenge={challenge}
        worldColor={world.color}
        onCorrect={handleMathCorrect}
        onWrong={handleMathWrong}
      />

      {/* Confetti Celebration */}
      {showSuccessPopup && confettiParticles.current.map(p => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, height + 100],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.x, p.x + (Math.random() * 80 - 40)],
        });
        return (
          <Animated.View
            key={p.id}
            style={[
              styles.confetti,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: p.rotation },
                ],
              },
            ]}
          />
        );
      })}

      {/* Sparkles / Burst particles */}
      {showSuccessPopup && sparkleAnims.current.map((anim, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const distance = 140;
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * distance],
        });
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * distance],
        });
        const scale = anim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [0, 1.2, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                left: width / 2 - 8,
                top: height / 2 - 50,
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            <Feather name="star" size={16} color={colors.goldLight} />
          </Animated.View>
        );
      })}

      {/* Success Modal Overlay */}
      {showSuccessPopup && (
        <View style={styles.popupOverlay}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: popupScaleAnim }] }]}>
            <LinearGradient
              colors={[world.color + "30", colors.card]}
              style={styles.popupGradient}
            >
              {/* Encouraging header */}
              <Text style={[styles.popupEncouragement, { color: colors.goldLight }]}>{encouragingMessage}</Text>
              
              {/* Title */}
              <Text style={styles.popupTitle}>🎉 LEVEL COMPLETED!</Text>
              
              {/* World name and level */}
              <Text style={styles.popupWorldName}>{world.emoji} {world.name} · Level {lnum}</Text>

              {/* Stars animation */}
              <View style={styles.popupStarsRow}>
                {[0, 1, 2].map(i => (
                  <Animated.View
                    key={i}
                    style={{
                      transform: [
                        { scale: popupStarAnims[i] },
                        { rotate: i === 1 ? "0deg" : i === 0 ? "-15deg" : "15deg" },
                      ],
                    }}
                  >
                    <Feather
                      key={i}
                      name="star"
                      size={i === 1 ? 62 : 46}
                      color={i < earnedStars ? colors.gold : colors.textDim}
                      style={i < earnedStars ? styles.popupStarShadow : {}}
                    />
                  </Animated.View>
                ))}
              </View>

              {/* Score breakdown */}
              <View style={styles.popupStatsCard}>
                <View style={styles.popupStatRow}>
                  <View style={styles.popupStatLabelCol}>
                    <Feather name="star" size={16} color={colors.goldLight} />
                    <Text style={styles.popupStatLabel}>Stars Earned</Text>
                  </View>
                  <Text style={[styles.popupStatVal, { color: colors.gold }]}>{earnedStars} / 3</Text>
                </View>

                <View style={styles.popupStatDivider} />

                <View style={styles.popupStatRow}>
                  <View style={styles.popupStatLabelCol}>
                    <Feather name="circle" size={16} color={colors.accentLight} />
                    <Text style={styles.popupStatLabel}>Coins Earned</Text>
                  </View>
                  <Text style={[styles.popupStatVal, { color: colors.accentLight }]}>+{earnedCoins}</Text>
                </View>

                <View style={styles.popupStatDivider} />

                <View style={styles.popupStatRow}>
                  <View style={styles.popupStatLabelCol}>
                    <Feather name="award" size={16} color={world.color} />
                    <Text style={styles.popupStatLabel}>Score Earned</Text>
                  </View>
                  <Text style={[styles.popupStatVal, { color: world.color }]}>{earnedScore}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.popupButtons}>
                <GlowButton
                  label="Replay Level"
                  icon={<Feather name="rotate-ccw" size={16} color={colors.text} />}
                  onPress={handleReset}
                  color={colors.surface}
                  textColor={colors.text}
                  size="md"
                  style={{ flex: 1 }}
                />

                {lnum < 15 ? (
                  <GlowButton
                    label="Next Level"
                    icon={<Feather name="play" size={16} color={colors.white} />}
                    onPress={() => {
                      setShowSuccessPopup(false);
                      setGameComplete(false);
                      router.replace({ pathname: "/challenge", params: { worldId: wid, levelNumber: lnum + 1 } });
                    }}
                    color={world.color}
                    size="md"
                    style={{ flex: 1 }}
                  />
                ) : (
                  <GlowButton
                    label="Worlds"
                    icon={<Feather name="home" size={16} color={colors.white} />}
                    onPress={() => {
                      setShowSuccessPopup(false);
                      router.replace("/worlds");
                    }}
                    color={world.color}
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
              </View>

              {lnum < 15 && (
                <GlowButton
                  label="Back to Worlds"
                  icon={<Feather name="home" size={14} color={colors.textMuted} />}
                  onPress={() => {
                    setShowSuccessPopup(false);
                    router.replace("/worlds");
                  }}
                  color="transparent"
                  textColor={colors.textMuted}
                  size="sm"
                />
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      )}
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
    paddingHorizontal: 14,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card + "AA",
    borderRadius: 20,
  },
  headerCenter: { flex: 1 },
  levelLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  levelSub: { fontSize: 11, color: colors.textMuted, fontFamily: "Inter_500Medium" },
  headerRight: { alignItems: "flex-end", gap: 4 },
  starsDisplay: { flexDirection: "row", gap: 3 },
  solvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.green + "25",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  solvedText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: colors.green },
  mathBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mathBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  canvasWrap: { flex: 1 },
  resetRow: {
    position: "absolute",
    bottom: 110,
    right: 16,
    zIndex: 20,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.card + "EE",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: { fontSize: 13, color: colors.white, fontFamily: "Inter_600SemiBold" },
  errorView: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.white, fontSize: 18 },

  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(13, 11, 30, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  popupCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  popupGradient: {
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  popupEncouragement: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: colors.white,
    textAlign: "center",
    letterSpacing: 1,
    marginTop: -8,
  },
  popupWorldName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: colors.textMuted,
    textAlign: "center",
    marginTop: -4,
  },
  popupStarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    marginVertical: 12,
  },
  popupStarShadow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
  },
  popupStatsCard: {
    backgroundColor: "rgba(26, 22, 50, 0.6)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    gap: 10,
    marginVertical: 4,
  },
  popupStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  popupStatLabelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  popupStatLabel: {
    fontSize: 14,
    color: colors.text,
    fontFamily: "Inter_500Medium",
  },
  popupStatVal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  popupStatDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    width: "100%",
  },
  popupButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 10,
  },
  confetti: {
    position: "absolute",
    zIndex: 90,
    pointerEvents: "none",
  },
  sparkle: {
    position: "absolute",
    zIndex: 95,
    pointerEvents: "none",
  },
});
