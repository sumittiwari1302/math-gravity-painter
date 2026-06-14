import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { GlowButton } from "@/components/ui/GlowButton";
import { LANGUAGES } from "@/data/i18n";
import { useSettings } from "@/context/SettingsContext";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

function VolumeControl({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const pct = Math.round(value * 100);
  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  return (
    <View style={vc.row}>
      {steps.map(step => (
        <Pressable
          key={step}
          onPress={() => onChange(step)}
          style={[
            vc.step,
            { height: 8 + step * 20, backgroundColor: value >= step ? color : colors.surface },
          ]}
        />
      ))}
      <Text style={[vc.pct, { color }]}>{pct}%</Text>
    </View>
  );
}

const vc = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 4, marginTop: 10 },
  step: { width: 28, borderRadius: 3 },
  pct: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginLeft: 8 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { musicVolume, sfxVolume, vibration, language, setMusicVolume, setSfxVolume, setVibration, setLanguage } = useSettings();
  const { resetProgress, username } = useGame();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleReset = () => {
    setConfirmVisible(false);
    resetProgress();
    router.replace("/menu");
  };

  return (
    <SpaceBackground>
      <CoinBar title="Settings" onBack={() => router.back()} showCoins={false} showStars={false} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(username || "?").charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.username}>{username || "Space Explorer"}</Text>
                <Text style={styles.usernameHint}>Your space explorer name</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Audio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <View style={styles.card}>
            <View style={styles.audioRow}>
              <Feather name="music" size={18} color={colors.accent} />
              <Text style={styles.audioLabel}>Music Volume</Text>
            </View>
            <VolumeControl value={musicVolume} onChange={setMusicVolume} color={colors.accent} />

            <View style={[styles.audioRow, { marginTop: 20 }]}>
              <Feather name="volume-2" size={18} color={colors.primaryLight} />
              <Text style={styles.audioLabel}>Sound FX Volume</Text>
            </View>
            <VolumeControl value={sfxVolume} onChange={setSfxVolume} color={colors.primaryLight} />

            <Pressable onPress={() => setVibration(!vibration)} style={styles.toggleRow}>
              <Feather name="smartphone" size={18} color={colors.orange} />
              <Text style={styles.audioLabel}>Vibration</Text>
              <View style={[styles.toggle, vibration && styles.toggleOn]}>
                <View style={[styles.toggleThumb, vibration && styles.toggleThumbOn]} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.card}>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={[
                    styles.langBtn,
                    language === lang.code && { borderColor: colors.primary, backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langName, language === lang.code && { color: colors.primaryLight }]}>{lang.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutTitle}>Math Gravity Painter</Text>
            <Text style={styles.aboutDesc}>An educational mobile game teaching math through drawing and space exploration. 5 worlds, 75 levels, 6 languages.</Text>
            <View style={styles.aboutStats}>
              <View style={styles.aboutStat}><Text style={styles.aboutStatNum}>5</Text><Text style={styles.aboutStatLabel}>Worlds</Text></View>
              <View style={styles.aboutStat}><Text style={styles.aboutStatNum}>75</Text><Text style={styles.aboutStatLabel}>Levels</Text></View>
              <View style={styles.aboutStat}><Text style={styles.aboutStatNum}>6</Text><Text style={styles.aboutStatLabel}>Languages</Text></View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.red }]}>Danger Zone</Text>
          <View style={[styles.card, { borderColor: colors.red + "40" }]}>
            <Text style={styles.resetDesc}>This will delete ALL your progress, coins, and achievements. This cannot be undone!</Text>
            <GlowButton
              label="Reset All Progress"
              onPress={() => setConfirmVisible(true)}
              color={colors.red}
              size="md"
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Feather name="alert-triangle" size={36} color={colors.red} />
            <Text style={styles.modalTitle}>Reset Progress?</Text>
            <Text style={styles.modalDesc}>All your levels, coins, and achievements will be permanently deleted.</Text>
            <View style={styles.modalBtns}>
              <GlowButton label="Cancel" onPress={() => setConfirmVisible(false)} color={colors.surface} textColor={colors.text} size="md" style={{ flex: 1 }} />
              <GlowButton label="Reset" onPress={handleReset} color={colors.red} size="md" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.textMuted, letterSpacing: 1, textTransform: "uppercase" },
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + "40", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.white },
  username: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.white },
  usernameHint: { fontSize: 12, color: colors.textMuted },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.white },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: colors.surface, padding: 2, borderWidth: 1, borderColor: colors.border },
  toggleOn: { backgroundColor: colors.green, borderColor: colors.green },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleThumbOn: { backgroundColor: colors.white, transform: [{ translateX: 22 }] },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  langFlag: { fontSize: 18 },
  langName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.textMuted },
  aboutTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.white, marginBottom: 6 },
  aboutDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 12 },
  aboutStats: { flexDirection: "row", gap: 12 },
  aboutStat: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, alignItems: "center" },
  aboutStatNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.primaryLight },
  aboutStatLabel: { fontSize: 11, color: colors.textMuted },
  resetDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: colors.card, borderRadius: 24, padding: 28, alignItems: "center", gap: 14, width: "100%", maxWidth: 380, borderWidth: 1, borderColor: colors.red + "60" },
  modalTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.white },
  modalDesc: { fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  modalBtns: { flexDirection: "row", gap: 12, width: "100%" },
});
