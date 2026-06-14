import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

// Sample leaderboard entries (simulated for offline play)
const SAMPLE_PLAYERS = [
  { name: "StarMaster99", coins: 1250, stars: 180, levels: 65 },
  { name: "MathWizard", coins: 980, stars: 145, levels: 52 },
  { name: "GravityKing", coins: 870, stars: 130, levels: 48 },
  { name: "NumberNinja", coins: 750, stars: 110, levels: 40 },
  { name: "CosmicSolver", coins: 620, stars: 95, levels: 35 },
  { name: "FractionFly", coins: 540, stars: 82, levels: 30 },
  { name: "AlgebraAce", coins: 420, stars: 65, levels: 25 },
  { name: "ProbPro", coins: 310, stars: 48, levels: 18 },
  { name: "GeomGuru", coins: 240, stars: 36, levels: 14 },
];

export default function LeaderboardScreen() {
  const { username, coins, totalStars, stats } = useGame();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myEntry = { name: username || "You", coins, stars: totalStars, levels: stats.levelsCompleted };
  const allPlayers = [...SAMPLE_PLAYERS, myEntry].sort((a, b) => b.coins - a.coins);
  const myRank = allPlayers.findIndex(p => p.name === myEntry.name) + 1;

  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankIcons = ["🥇", "🥈", "🥉"];

  return (
    <SpaceBackground>
      <CoinBar title="Leaderboard" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* My Rank Card */}
        <View style={styles.myRankCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(username || "Y").charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.myRankInfo}>
            <Text style={styles.myName}>{username || "You"}</Text>
            <Text style={styles.myRankSub}>Your current rank</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNum}>#{myRank}</Text>
          </View>
        </View>

        {/* Column Headers */}
        <View style={styles.header}>
          <Text style={[styles.headerText, { width: 36 }]}>Rank</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Player</Text>
          <Feather name="circle" size={12} color={colors.goldLight} />
          <Text style={[styles.headerText, { width: 50 }]}>Coins</Text>
          <Feather name="star" size={12} color={colors.gold} />
          <Text style={[styles.headerText, { width: 44 }]}>Stars</Text>
        </View>

        {/* Player List */}
        {allPlayers.map((player, idx) => {
          const rank = idx + 1;
          const isMe = player.name === myEntry.name;
          return (
            <View key={`${player.name}-${idx}`} style={[styles.row, isMe && styles.rowMe]}>
              <View style={styles.rankCell}>
                {rank <= 3 ? (
                  <Text style={styles.rankIcon}>{rankIcons[rank - 1]}</Text>
                ) : (
                  <Text style={[styles.rankText, { color: rank <= 10 ? colors.gold : colors.textMuted }]}>#{rank}</Text>
                )}
              </View>
              <View style={styles.playerCell}>
                <View style={[styles.miniAvatar, { backgroundColor: isMe ? colors.primary : colors.surface }]}>
                  <Text style={styles.miniAvatarText}>{player.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.playerName, isMe && { color: colors.accent }]} numberOfLines={1}>{player.name}</Text>
              </View>
              <Text style={styles.statVal}>{player.coins}</Text>
              <Text style={styles.statVal}>{player.stars}</Text>
            </View>
          );
        })}

        <Text style={styles.offlineNote}>* Leaderboard includes simulated players for demo</Text>
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  myRankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primary + "60",
    gap: 12,
    marginBottom: 8,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: colors.white },
  myRankInfo: { flex: 1 },
  myName: { fontSize: 17, fontFamily: "Inter_700Bold", color: colors.white },
  myRankSub: { fontSize: 12, color: colors.textMuted },
  rankBadge: { backgroundColor: colors.gold + "30", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  rankNum: { fontSize: 18, fontFamily: "Inter_700Bold", color: colors.gold },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 4, gap: 4 },
  headerText: { fontSize: 11, color: colors.textDim, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 16, padding: 12, gap: 8, borderWidth: 1, borderColor: colors.border },
  rowMe: { borderColor: colors.accent + "60", backgroundColor: colors.accent + "10" },
  rankCell: { width: 36, alignItems: "center" },
  rankIcon: { fontSize: 20 },
  rankText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  playerCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  miniAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  miniAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.white },
  playerName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.text, flex: 1 },
  statVal: { fontSize: 14, fontFamily: "Inter_700Bold", color: colors.white, width: 48, textAlign: "right" },
  offlineNote: { fontSize: 11, color: colors.textDim, textAlign: "center", marginTop: 8 },
});
