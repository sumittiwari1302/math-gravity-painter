export type ShopCategory = "ball" | "trail" | "portal" | "background";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopCategory;
  color: string;
  glowColor: string;
  isDefault?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "ball_blue", name: "Gravity Ball", description: "The classic blue energy ball", price: 0, category: "ball", color: "#06B6D4", glowColor: "#22D3EE", isDefault: true },
  { id: "ball_purple", name: "Nebula Ball", description: "A mysterious purple orb", price: 50, category: "ball", color: "#7C3AED", glowColor: "#9D5EF5" },
  { id: "ball_gold", name: "Star Core", description: "Glowing golden power sphere", price: 100, category: "ball", color: "#F59E0B", glowColor: "#FCD34D" },
  { id: "ball_red", name: "Nova Blast", description: "Fiery red energy ball", price: 150, category: "ball", color: "#EF4444", glowColor: "#F87171" },
  { id: "ball_green", name: "Quasar Gem", description: "Emerald dimensional sphere", price: 200, category: "ball", color: "#10B981", glowColor: "#34D399" },
  { id: "ball_rainbow", name: "Cosmic Rainbow", description: "Cycles through all colors", price: 500, category: "ball", color: "#EC4899", glowColor: "#F472B6" },

  { id: "trail_none", name: "No Trail", description: "Clean and simple", price: 0, category: "trail", color: "#FFFFFF", glowColor: "#FFFFFF", isDefault: true },
  { id: "trail_sparks", name: "Spark Trail", description: "Leaves tiny sparkling dots", price: 75, category: "trail", color: "#F59E0B", glowColor: "#FCD34D" },
  { id: "trail_comet", name: "Comet Tail", description: "A long glowing comet trail", price: 150, category: "trail", color: "#06B6D4", glowColor: "#22D3EE" },
  { id: "trail_magic", name: "Magic Dust", description: "Sprinkles colored magic dust", price: 250, category: "trail", color: "#EC4899", glowColor: "#F472B6" },

  { id: "portal_blue", name: "Space Gate", description: "Classic blue portal", price: 0, category: "portal", color: "#06B6D4", glowColor: "#22D3EE", isDefault: true },
  { id: "portal_gold", name: "Golden Gate", description: "A shimmering golden portal", price: 100, category: "portal", color: "#F59E0B", glowColor: "#FCD34D" },
  { id: "portal_purple", name: "Void Portal", description: "A mysterious dark portal", price: 200, category: "portal", color: "#7C3AED", glowColor: "#9D5EF5" },
  { id: "portal_rainbow", name: "Rainbow Bridge", description: "A colorful dimensional gate", price: 400, category: "portal", color: "#EC4899", glowColor: "#F472B6" },

  { id: "bg_space", name: "Deep Space", description: "Classic deep space background", price: 0, category: "background", color: "#0D0B1E", glowColor: "#1A1632", isDefault: true },
  { id: "bg_nebula", name: "Nebula Cloud", description: "Colorful nebula background", price: 100, category: "background", color: "#1a0a2e", glowColor: "#2d1060" },
  { id: "bg_galaxy", name: "Spiral Galaxy", description: "A beautiful spiral galaxy", price: 200, category: "background", color: "#0a1a2e", glowColor: "#0d2d5e" },
  { id: "bg_aurora", name: "Space Aurora", description: "Stunning space aurora borealis", price: 300, category: "background", color: "#0a2e1a", glowColor: "#0d5e33" },
];
