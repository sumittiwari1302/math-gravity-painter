import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { SpaceBackground } from "@/components/ui/SpaceBackground";
import { CoinBar } from "@/components/ui/CoinBar";
import { GlowButton } from "@/components/ui/GlowButton";
import { SHOP_ITEMS, type ShopCategory } from "@/data/shopItems";
import { useGame } from "@/context/GameContext";
import colors from "@/constants/colors";

const CATEGORIES: { id: ShopCategory; label: string; icon: string }[] = [
  { id: "ball", label: "Ball Skins", icon: "circle" },
  { id: "trail", label: "Trails", icon: "wind" },
  { id: "portal", label: "Portals", icon: "aperture" },
  { id: "background", label: "Backgrounds", icon: "image" },
];

export default function ShopScreen() {
  const router = useRouter();
  const { coins, ownedItems, equippedItems, buyItem, equipItem } = useGame();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("ball");
  const [feedback, setFeedback] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredItems = SHOP_ITEMS.filter(i => i.category === activeCategory);

  const handleBuy = (itemId: string, price: number) => {
    const success = buyItem(itemId, price);
    if (success) {
      setFeedback("Purchased!");
      setTimeout(() => setFeedback(null), 1500);
    } else {
      setFeedback(coins < price ? "Not enough coins!" : "Already owned!");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleEquip = (category: ShopCategory, itemId: string) => {
    equipItem(category, itemId);
    setFeedback("Equipped!");
    setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <SpaceBackground>
      <CoinBar title="Shop" onBack={() => router.back()} />

      {/* Feedback Toast */}
      {feedback && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{feedback}</Text>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => setActiveCategory(cat.id)}
            style={[styles.tab, activeCategory === cat.id && styles.tabActive]}
          >
            <Feather name={cat.icon as any} size={16} color={activeCategory === cat.id ? colors.white : colors.textMuted} />
            <Text style={[styles.tabLabel, activeCategory === cat.id && styles.tabLabelActive]}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.map(item => {
          const owned = ownedItems.includes(item.id);
          const equipped = equippedItems[item.category] === item.id;
          return (
            <View key={item.id} style={[styles.itemCard, equipped && { borderColor: item.color }]}>
              {/* Item Preview */}
              <View style={[styles.preview, { backgroundColor: item.glowColor + "20" }]}>
                <View style={[styles.previewBall, { backgroundColor: item.color, shadowColor: item.glowColor }]} />
                {equipped && (
                  <View style={[styles.equippedBadge, { backgroundColor: item.color }]}>
                    <Feather name="check" size={10} color={colors.white} />
                  </View>
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>

              <View style={styles.itemActions}>
                {item.price === 0 ? (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeText}>FREE</Text>
                  </View>
                ) : (
                  <View style={styles.priceRow}>
                    <Feather name="circle" size={12} color={colors.goldLight} />
                    <Text style={styles.price}>{item.price}</Text>
                  </View>
                )}

                {owned || item.price === 0 ? (
                  <Pressable
                    onPress={() => equipped ? null : handleEquip(item.category, item.id)}
                    style={[styles.actionBtn, { backgroundColor: equipped ? item.color + "30" : colors.primary + "30" }]}
                  >
                    <Text style={[styles.actionText, { color: equipped ? item.color : colors.primaryLight }]}>
                      {equipped ? "Equipped" : "Equip"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => handleBuy(item.id, item.price)}
                    style={[styles.actionBtn, { backgroundColor: coins >= item.price ? colors.gold + "30" : colors.textDim + "30" }]}
                  >
                    <Text style={[styles.actionText, { color: coins >= item.price ? colors.gold : colors.textDim }]}>Buy</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SpaceBackground>
  );
}

const styles = StyleSheet.create({
  tabs: { flexGrow: 0, marginBottom: 4 },
  tabsContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.textMuted },
  tabLabelActive: { color: colors.white },
  toast: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  toastText: { color: colors.white, fontFamily: "Inter_700Bold", fontSize: 14 },
  grid: { padding: 16, gap: 12 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  preview: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  previewBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  equippedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontFamily: "Inter_700Bold", color: colors.white, marginBottom: 2 },
  itemDesc: { fontSize: 12, color: colors.textMuted },
  itemActions: { alignItems: "flex-end", gap: 6 },
  freeBadge: { backgroundColor: colors.green + "30", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  freeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: colors.green },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  price: { fontSize: 13, fontFamily: "Inter_700Bold", color: colors.goldLight },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  actionText: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
