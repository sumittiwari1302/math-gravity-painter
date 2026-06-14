import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { MathChallenge } from "@/data/mathChallenges";
import colors from "@/constants/colors";

interface MathChallengeModalProps {
  visible: boolean;
  challenge: MathChallenge;
  worldColor: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function MathChallengeModal({ visible, challenge, worldColor, onCorrect, onWrong }: MathChallengeModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelected(null);
      setShowResult(false);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [visible]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);

    if (idx === challenge.correctIndex) {
      setTimeout(() => onCorrect(), 1200);
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        setSelected(null);
        setShowResult(false);
        onWrong();
      }, 1500);
    }
  };

  const getOptionStyle = (idx: number) => {
    if (!showResult || selected === null) return {};
    if (idx === challenge.correctIndex) return { backgroundColor: colors.green + "40", borderColor: colors.green };
    if (idx === selected) return { backgroundColor: colors.red + "40", borderColor: colors.red };
    return {};
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }]}>
          <LinearGradient
            colors={[worldColor + "30", colors.card]}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: worldColor + "30" }]}>
                <Feather name="zap" size={16} color={worldColor} />
                <Text style={[styles.badgeText, { color: worldColor }]}>Math Challenge</Text>
              </View>
            </View>

            <Text style={styles.question}>{challenge.question}</Text>

            <View style={styles.options}>
              {challenge.options.map((opt, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSelect(i)}
                  style={[styles.option, getOptionStyle(i)]}
                >
                  <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                  <Text style={styles.optionText}>{opt}</Text>
                  {showResult && i === challenge.correctIndex && (
                    <Feather name="check-circle" size={18} color={colors.green} style={{ marginLeft: "auto" }} />
                  )}
                  {showResult && i === selected && i !== challenge.correctIndex && (
                    <Feather name="x-circle" size={18} color={colors.red} style={{ marginLeft: "auto" }} />
                  )}
                </Pressable>
              ))}
            </View>

            {showResult && selected === challenge.correctIndex && (
              <View style={styles.explanation}>
                <Feather name="info" size={14} color={colors.accentLight} />
                <Text style={styles.explanationText}>{challenge.explanation}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradient: { padding: 24 },
  header: { alignItems: "center", marginBottom: 20 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  question: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 30,
  },
  options: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    textAlign: "center",
    lineHeight: 28,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: colors.textMuted,
  },
  optionText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.white, flex: 1 },
  explanation: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    backgroundColor: colors.accent + "20",
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  explanationText: { flex: 1, fontSize: 13, color: colors.accentLight, lineHeight: 18 },
});
