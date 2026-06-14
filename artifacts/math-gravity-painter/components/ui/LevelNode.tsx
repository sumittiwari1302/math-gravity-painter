import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";

interface LevelNodeProps {
  levelNumber: number;
  stars: number;
  unlocked: boolean;
  completed: boolean;
  worldColor: string;
  onPress: () => void;
}

export function LevelNode({ levelNumber, stars, unlocked, completed, worldColor, onPress }: LevelNodeProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const bgColor = completed ? worldColor : unlocked ? colors.surface : colors.card;
  const borderColor = completed ? worldColor : unlocked ? worldColor + "60" : colors.border;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={unlocked ? onPress : undefined}
        onPressIn={() => unlocked && Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        style={[styles.node, { backgroundColor: bgColor, borderColor }]}
      >
        {!unlocked ? (
          <Feather name="lock" size={18} color={colors.textDim} />
        ) : (
          <Text style={[styles.num, { color: completed ? colors.white : unlocked ? worldColor : colors.textDim }]}>
            {levelNumber}
          </Text>
        )}
      </Pressable>
      {completed && (
        <View style={styles.stars}>
          {[0, 1, 2].map(i => (
            <Feather key={i} name="star" size={8} color={i < stars ? colors.gold : colors.textDim} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  num: { fontSize: 18, fontFamily: "Inter_700Bold" },
  stars: { flexDirection: "row", justifyContent: "center", gap: 1, marginTop: 4 },
});
