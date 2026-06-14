import React, { useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { World } from "@/data/worlds";
import colors from "@/constants/colors";

const WORLD_IMAGES: Record<string, any> = {
  world_fraction: require("@/assets/images/world_fraction.png"),
  world_integer: require("@/assets/images/world_integer.png"),
  world_geometry: require("@/assets/images/world_geometry.png"),
  world_algebra: require("@/assets/images/world_algebra.png"),
  world_probability: require("@/assets/images/world_probability.png"),
};

interface WorldCardProps {
  world: World;
  completed: number;
  totalStars: number;
  onPress: () => void;
}

export function WorldCard({ world, completed, totalStars, onPress }: WorldCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pct = Math.round((completed / world.totalLevels) * 100);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        style={[styles.card, { borderColor: world.color + "60" }]}
      >
        <View style={[styles.imageWrap, { backgroundColor: world.color + "20" }]}>
          <Image source={WORLD_IMAGES[world.imageKey]} style={styles.image} resizeMode="contain" />
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.emoji}>{world.emoji}</Text>
            <Text style={styles.name}>{world.name}</Text>
          </View>
          <Text style={styles.topic}>{world.topic}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: world.color }]} />
            </View>
            <Text style={[styles.pct, { color: world.color }]}>{pct}%</Text>
          </View>
          <View style={styles.statsRow}>
            <Feather name="layers" size={12} color={colors.textMuted} />
            <Text style={styles.statText}>{completed}/{world.totalLevels} levels</Text>
            <Feather name="star" size={12} color={colors.gold} />
            <Text style={styles.statText}>{totalStars}</Text>
          </View>
        </View>
        <View style={[styles.arrow, { backgroundColor: world.color + "30" }]}>
          <Feather name="chevron-right" size={18} color={world.color} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: 60, height: 60 },
  info: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  emoji: { fontSize: 16 },
  name: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.white },
  topic: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  progressBg: { flex: 1, height: 6, backgroundColor: colors.surface, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  pct: { fontSize: 12, fontFamily: "Inter_600SemiBold", minWidth: 32, textAlign: "right" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 11, color: colors.textMuted, marginRight: 6 },
  arrow: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
