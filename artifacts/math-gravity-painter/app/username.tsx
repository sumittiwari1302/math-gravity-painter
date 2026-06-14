import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame } from "@/context/GameContext";
import { GlowButton } from "@/components/ui/GlowButton";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import colors from "@/constants/colors";

export default function UsernameScreen() {
  const [name, setName] = useState("");
  const { setUsername } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    router.replace("/menu");
  };

  return (
    <SpaceBackground>
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Image source={require("@/assets/images/icon.png")} style={styles.logo} resizeMode="contain" />

          <View style={styles.card}>
            <Text style={styles.rocket}>🚀</Text>
            <Text style={styles.title}>Welcome, Space Explorer!</Text>
            <Text style={styles.subtitle}>What should we call you?</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your name..."
              placeholderTextColor={colors.textDim}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
              onSubmitEditing={handleStart}
              returnKeyType="done"
            />

            <GlowButton
              label="Start Adventure"
              onPress={handleStart}
              color={colors.primary}
              size="lg"
              style={{ marginTop: 8 }}
              disabled={!name.trim()}
            />
          </View>

          <Text style={styles.hint}>Your name will be saved locally on this device</Text>
        </KeyboardAvoidingView>
      </Pressable>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 24 },
  logo: { width: 100, height: 100, borderRadius: 24 },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rocket: { fontSize: 40 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.white, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: "center" },
  input: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: colors.white,
    textAlign: "center",
  },
  hint: { fontSize: 12, color: colors.textDim, textAlign: "center" },
});
