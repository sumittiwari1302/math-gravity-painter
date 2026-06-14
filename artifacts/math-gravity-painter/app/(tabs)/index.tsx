import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";
import { SpaceBackground } from "@/components/ui/SpaceBackground";

export default function SplashScreen() {
  const { username } = useGame();
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      if (username) {
        router.replace("/menu");
      } else {
        router.replace("/username");
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, [username]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <SpaceBackground>
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.title}>MATH GRAVITY PAINTER</Text>
          <Text style={styles.tagline}>Draw the Path, Solve the Universe</Text>
        </Animated.View>
      </View>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
  logo: { width: 180, height: 180, borderRadius: 40 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: colors.white,
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 1,
  },
});
