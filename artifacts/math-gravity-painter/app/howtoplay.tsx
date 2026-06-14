import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { GlowButton } from "@/components/ui/GlowButton";
import colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const TUTORIALS = [
  {
    id: "drawing",
    title: "Drawing Paths",
    icon: "edit-3",
    color: colors.accent,
    description: "Use your finger or mouse to draw a path on the screen. The ball will follow your drawn path!",
    steps: [
      "Tap the pencil tool in the toolbar",
      "Draw a curvy path from the ball",
      "Your path appears as a glowing line",
      "Draw multiple paths if needed",
    ],
    tip: "Pro tip: Draw smooth curves for the best results!",
  },
  {
    id: "ball",
    title: "Launching the Ball",
    icon: "play",
    color: colors.green,
    description: "Once you've drawn a path, tap LAUNCH to send your gravity ball rolling!",
    steps: [
      "Draw at least one path",
      "Tap the green LAUNCH button",
      "The ball follows your path",
      "After the path, gravity pulls it down",
    ],
    tip: "The ball has magnetic star attraction - get close to stars!",
  },
  {
    id: "stars",
    title: "Collecting Stars",
    icon: "star",
    color: colors.gold,
    description: "Guide the ball near stars to collect them. Stars are collected magnetically when the ball gets close!",
    steps: [
      "Stars glow yellow on the screen",
      "Draw your path near the stars",
      "Ball magnetically collects nearby stars",
      "Collect all stars for maximum score!",
    ],
    tip: "You don't need to touch stars exactly - get within range!",
  },
  {
    id: "math",
    title: "Math Challenges",
    icon: "zap",
    color: colors.primaryLight,
    description: "Each level has a math question that unlocks the portal. Solve it to complete the level!",
    steps: [
      "Tap on the portal or the math bar",
      "A math question appears",
      "Choose the correct answer",
      "Portal unlocks when you're correct!",
    ],
    tip: "You can solve the math challenge before or during the level!",
  },
  {
    id: "portal",
    title: "Reaching the Portal",
    icon: "aperture",
    color: colors.primaryLight,
    description: "After solving the math challenge, guide your ball into the portal to complete the level!",
    steps: [
      "Solve the math challenge first",
      "Portal lights up when unlocked",
      "Draw your path toward the portal",
      "Ball enters portal = Level complete!",
    ],
    tip: "More stars collected = better level rating!",
  },
  {
    id: "tools",
    title: "Drawing Tools",
    icon: "tool",
    color: colors.orange,
    description: "The floating toolbar has different tools to help you draw the perfect path!",
    steps: [
      "Pencil: Draw freeform paths",
      "Line: Draw straight lines",
      "Curve: Draw smooth arcs",
      "Eraser: Remove drawn paths",
    ],
    tip: "Undo removes your last drawn path. Clear removes all!",
  },
];

const WORLDS_INFO = [
  { emoji: "🌌", name: "Fraction Galaxy", desc: "Solve fraction problems to guide your ball!", examples: ["1/2 + 1/4 = ?", "Which is bigger: 2/3 or 3/4?"] },
  { emoji: "➕", name: "Integer Space", desc: "Navigate positive and negative gravity zones!", examples: ["5 + (-3) = ?", "-4 + 7 = ?"] },
  { emoji: "📐", name: "Geometry Planet", desc: "Build and explore geometric shapes!", examples: ["Area of 3×4 rectangle = ?", "Angles in a triangle = ?"] },
  { emoji: "🧩", name: "Algebra Station", desc: "Solve equations to unlock equation doors!", examples: ["x + 5 = 10, x = ?", "2x = 8, x = ?"] },
  { emoji: "🎲", name: "Probability Zone", desc: "Predict the odds and beat the dice!", examples: ["P(heads) = ?", "P(rolling 6) = ?"] },
];

export default function HowToPlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [activeTutorial, setActiveTutorial] = useState(0);

  return (
    <SpaceBackground>
      <CoinBar title="How to Play" onBack={() => router.back()} showCoins={false} showStars={false} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Start */}
        <View style={styles.quickStart}>
          <Text style={styles.quickTitle}>Quick Start</Text>
          <View style={styles.stepsRow}>
            {["Draw", "Launch", "Collect", "Solve", "Win!"].map((step, i) => (
              <View key={i} style={styles.quickStep}>
                <View style={[styles.quickNum, { backgroundColor: colors.primary + "40" }]}>
                  <Text style={styles.quickNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.quickStepLabel}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tutorial Sections */}
        <Text style={styles.sectionTitle}>Gameplay Tutorials</Text>
        {TUTORIALS.map((tut, idx) => (
          <View key={tut.id} style={[styles.tutCard, { borderColor: tut.color + "40" }]}>
            <LinearGradient colors={[tut.color + "20", "transparent"]} style={styles.tutGradient}>
              <View style={styles.tutHeader}>
                <View style={[styles.tutIcon, { backgroundColor: tut.color + "30" }]}>
                  <Feather name={tut.icon as any} size={22} color={tut.color} />
                </View>
                <Text style={[styles.tutTitle, { color: tut.color }]}>{tut.title}</Text>
              </View>
              <Text style={styles.tutDesc}>{tut.description}</Text>
              <View style={styles.stepsList}>
                {tut.steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={[styles.stepDot, { backgroundColor: tut.color }]} />
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.tipBox, { backgroundColor: tut.color + "15", borderColor: tut.color + "30" }]}>
                <Feather name="info" size={14} color={tut.color} />
                <Text style={[styles.tipText, { color: tut.color }]}>{tut.tip}</Text>
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Worlds Info */}
        <Text style={styles.sectionTitle}>The 5 Worlds</Text>
        {WORLDS_INFO.map(world => (
          <View key={world.name} style={styles.worldCard}>
            <Text style={styles.worldEmoji}>{world.emoji}</Text>
            <View style={styles.worldInfo}>
              <Text style={styles.worldName}>{world.name}</Text>
              <Text style={styles.worldDesc}>{world.desc}</Text>
              <Text style={styles.worldExamples}>{world.examples.join(" · ")}</Text>
            </View>
          </View>
        ))}

        {/* Rating System */}
        <View style={styles.ratingCard}>
          <Text style={styles.tutTitle}>Star Rating</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={24} color={colors.gold} />
            <Text style={styles.ratingDesc}>1 Star - Reached the portal</Text>
          </View>
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: "row" }}>
              {[0,1].map(i => <Feather key={i} name="star" size={24} color={colors.gold} />)}
            </View>
            <Text style={styles.ratingDesc}>2 Stars - Collected half the stars</Text>
          </View>
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: "row" }}>
              {[0,1,2].map(i => <Feather key={i} name="star" size={24} color={colors.gold} />)}
            </View>
            <Text style={styles.ratingDesc}>3 Stars - Collected ALL stars!</Text>
          </View>
        </View>

        <GlowButton
          label="Start Playing!"
          onPress={() => router.push("/worlds")}
          color={colors.primary}
          size="lg"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  quickStart: { backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 14 },
  quickTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.white },
  stepsRow: { flexDirection: "row", justifyContent: "space-between" },
  quickStep: { alignItems: "center", gap: 6 },
  quickNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quickNumText: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primaryLight },
  quickStepLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.textMuted },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.textMuted },
  tutCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  tutGradient: { padding: 20, gap: 12 },
  tutHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  tutIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tutTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  tutDesc: { fontSize: 14, color: colors.text, lineHeight: 20 },
  stepsList: { gap: 8 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepText: { fontSize: 13, color: colors.text, flex: 1 },
  tipBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  tipText: { fontSize: 13, flex: 1, lineHeight: 18 },
  worldCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.card, borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: colors.border },
  worldEmoji: { fontSize: 32, marginTop: 2 },
  worldInfo: { flex: 1 },
  worldName: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.white, marginBottom: 3 },
  worldDesc: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  worldExamples: { fontSize: 12, color: colors.accentLight },
  ratingCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  ratingDesc: { fontSize: 14, color: colors.text },
});
