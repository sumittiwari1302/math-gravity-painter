import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { WorldCard } from "@/components/ui/WorldCard";
import { WORLDS } from "@/data/worlds";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

export default function WorldsScreen() {
  const router = useRouter();
  const { getWorldProgress } = useGame();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <SpaceBackground>
      <CoinBar title="Choose World" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>All worlds unlocked! Complete levels to earn stars.</Text>
        {WORLDS.map(world => {
          const prog = getWorldProgress(world.id);
          return (
            <WorldCard
              key={world.id}
              world={world}
              completed={prog.completed}
              totalStars={prog.stars}
              onPress={() => router.push({ pathname: "/levels", params: { worldId: world.id } })}
            />
          );
        })}
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 20 },
});
