export interface World {
  id: number;
  name: string;
  shortName: string;
  topic: string;
  description: string;
  color: string;
  colorDark: string;
  emoji: string;
  imageKey: string;
  totalLevels: number;
}

export const WORLDS: World[] = [
  {
    id: 1,
    name: "Fraction Galaxy",
    shortName: "Fractions",
    topic: "Fractions",
    description: "Learn fractions through cosmic adventures!",
    color: "#7C3AED",
    colorDark: "#5B21B6",
    emoji: "🌌",
    imageKey: "world_fraction",
    totalLevels: 15,
  },
  {
    id: 2,
    name: "Integer Space",
    shortName: "Integers",
    topic: "Positive & Negative Numbers",
    description: "Master positive and negative numbers in space!",
    color: "#06B6D4",
    colorDark: "#0284C7",
    emoji: "➕",
    imageKey: "world_integer",
    totalLevels: 15,
  },
  {
    id: 3,
    name: "Geometry Planet",
    shortName: "Geometry",
    topic: "Shapes, Area & Perimeter",
    description: "Explore shapes, areas and perimeters!",
    color: "#10B981",
    colorDark: "#047857",
    emoji: "📐",
    imageKey: "world_geometry",
    totalLevels: 15,
  },
  {
    id: 4,
    name: "Algebra Station",
    shortName: "Algebra",
    topic: "Variables & Equations",
    description: "Solve equations to unlock new paths!",
    color: "#F59E0B",
    colorDark: "#D97706",
    emoji: "🧩",
    imageKey: "world_algebra",
    totalLevels: 15,
  },
  {
    id: 5,
    name: "Probability Zone",
    shortName: "Probability",
    topic: "Probability & Chance",
    description: "Predict outcomes and beat the odds!",
    color: "#EC4899",
    colorDark: "#DB2777",
    emoji: "🎲",
    imageKey: "world_probability",
    totalLevels: 15,
  },
];
