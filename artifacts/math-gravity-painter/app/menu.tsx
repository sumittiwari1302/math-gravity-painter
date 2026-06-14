import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { GlowButton } from "@/components/ui/GlowButton";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

const MENU_ITEMS = [
  { label: "Worlds", icon: "globe" as const, route: "/worlds", color: colors.accent },
  { label: "Shop", icon: "shopping-bag" as const, route: "/shop", color: colors.gold },
  { label: "Achievements", icon: "award" as const, route: "/achievements", color: colors.orange },
  { label: "Leaderboard", icon: "bar-chart-2" as const, route: "/leaderboard", color: colors.green },
  { label: "Statistics", icon: "activity" as const, route: "/statistics", color: colors.primaryLight },
  { label: "How to Play", icon: "help-circle" as const, route: "/howtoplay", color: colors.pink },
  { label: "Settings", icon: "settings" as const, route: "/settings", color: colors.textMuted },
];

export default function MenuScreen() {
  const router = useRouter();
  const { username, coins, totalStars, stats } = useGame();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <SpaceBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingTop: topPad + 16, paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>MATH GRAVITY PAINTER</Text>
        <Text style={styles.tagline}>Draw the Path, Solve the Universe</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{username || "Explorer"}</Text>
            <Text style={styles.profileSub}>{stats.levelsCompleted} levels completed</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Feather name="star" size={12} color={colors.gold} />
              <Text style={[styles.badgeText, { color: colors.gold }]}>{totalStars}</Text>
            </View>
            <View style={styles.badge}>
              <Feather name="circle" size={12} color={colors.goldLight} />
              <Text style={[styles.badgeText, { color: colors.goldLight }]}>{coins}</Text>
            </View>
          </View>
        </View>

        {/* Play Button */}
        <GlowButton
          label="PLAY NOW"
          onPress={() => router.push("/worlds")}
          color={colors.primary}
          size="lg"
          style={{ width: "100%" }}
        />

        {/* Menu Grid */}
        <View style={styles.grid}>
          {MENU_ITEMS.map(item => (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route as any)}
              style={[styles.menuItem, { borderColor: item.color + "40" }]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                <Feather name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: item.color }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 20, gap: 20 },
  logo: { width: 110, height: 110, borderRadius: 28 },
  appName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: colors.white,
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: { fontSize: 13, color: colors.textMuted, letterSpacing: 0.5 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "40",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.white },
  profileInfo: { flex: 1 },
  username: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.white },
  profileSub: { fontSize: 12, color: colors.textMuted },
  badges: { gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  menuItem: {
    width: "30%",
    minWidth: 100,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  menuIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});
