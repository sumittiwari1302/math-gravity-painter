import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import colors from "@/constants/colors";
import { useGame } from "@/context/GameContext";

interface CoinBarProps {
  title?: string;
  onBack?: () => void;
  showCoins?: boolean;
  showStars?: boolean;
}

export function CoinBar({ title, onBack, showCoins = true, showStars = true }: CoinBarProps) {
  const { coins, totalStars } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.bar, { paddingTop: topPad + 10 }]}>
      {onBack ? (
        <Feather name="chevron-left" size={26} color={colors.white} onPress={onBack} style={styles.back} />
      ) : <View style={styles.spacer} />}
      {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
      <View style={styles.badges}>
        {showStars && (
          <View style={styles.badge}>
            <Feather name="star" size={14} color={colors.gold} />
            <Text style={[styles.badgeText, { color: colors.gold }]}>{totalStars}</Text>
          </View>
        )}
        {showCoins && (
          <View style={styles.badge}>
            <Feather name="circle" size={14} color={colors.goldLight} />
            <Text style={[styles.badgeText, { color: colors.goldLight }]}>{coins}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background + "EE",
  },
  back: { padding: 4, marginRight: 4 },
  spacer: { width: 34 },
  title: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold", color: colors.white, textAlign: "center" },
  badges: { flexDirection: "row", gap: 10, alignItems: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
