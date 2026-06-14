import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "@/constants/colors";

export type DrawTool = "pencil" | "line" | "arc" | "eraser";

interface ToolDef {
  id: DrawTool;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
}

const TOOLS: ToolDef[] = [
  { id: "pencil", icon: "edit-3", label: "Pencil", color: colors.accent },
  { id: "line", icon: "minus", label: "Line", color: colors.primaryLight },
  { id: "arc", icon: "activity", label: "Curve", color: colors.orange },
  { id: "eraser", icon: "delete", label: "Erase", color: colors.red },
];

interface FloatingToolbarProps {
  selectedTool: DrawTool;
  onSelectTool: (tool: DrawTool) => void;
  onUndo: () => void;
  onClear: () => void;
  onLaunch: () => void;
  onHint: () => void;
  canLaunch: boolean;
  isLaunched: boolean;
}

export function FloatingToolbar({
  selectedTool,
  onSelectTool,
  onUndo,
  onClear,
  onLaunch,
  onHint,
  canLaunch,
  isLaunched,
}: FloatingToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(expandAnim, { toValue, useNativeDriver: true, speed: 30 }).start();
    setExpanded(!expanded);
  };

  const toolHeight = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });
  const toolOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Tools Panel */}
      <Animated.View style={[styles.toolPanel, { maxHeight: toolHeight, opacity: toolOpacity, overflow: "hidden" }]}>
        {TOOLS.map(tool => (
          <Pressable
            key={tool.id}
            onPress={() => { onSelectTool(tool.id); setExpanded(false); Animated.spring(expandAnim, { toValue: 0, useNativeDriver: true }).start(); }}
            style={[styles.toolBtn, selectedTool === tool.id && { backgroundColor: tool.color + "30", borderColor: tool.color }]}
          >
            <Feather name={tool.icon} size={18} color={selectedTool === tool.id ? tool.color : colors.textMuted} />
          </Pressable>
        ))}
        <View style={styles.divider} />
        <Pressable onPress={onUndo} style={styles.toolBtn}>
          <Feather name="corner-left-up" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={onClear} style={styles.toolBtn}>
          <Feather name="trash-2" size={18} color={colors.red} />
        </Pressable>
        <Pressable onPress={onHint} style={styles.toolBtn}>
          <Feather name="help-circle" size={18} color={colors.gold} />
        </Pressable>
      </Animated.View>

      {/* Toggle Button */}
      <View style={styles.bottomRow}>
        <Pressable onPress={toggle} style={styles.toggleBtn}>
          <Feather name={expanded ? "x" : "edit-2"} size={22} color={colors.white} />
        </Pressable>

        {/* Launch Button */}
        {!isLaunched && (
          <Pressable
            onPress={canLaunch ? onLaunch : undefined}
            style={[styles.launchBtn, !canLaunch && styles.launchDisabled]}
          >
            <Feather name="play" size={20} color={colors.white} />
            <Text style={styles.launchText}>LAUNCH</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  toolPanel: {
    backgroundColor: colors.card + "EE",
    borderRadius: 20,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  toggleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  launchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.green,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  launchDisabled: { backgroundColor: colors.textDim, shadowOpacity: 0 },
  launchText: { fontSize: 16, fontFamily: "Inter_700Bold", color: colors.white, letterSpacing: 1 },
});
