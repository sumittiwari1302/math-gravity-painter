import React, { useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function GlowButton({ label, onPress, color = colors.primary, textColor = colors.white, size = "md", style, disabled, icon }: GlowButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const padH = size === "sm" ? 16 : size === "md" ? 24 : 32;
  const padV = size === "sm" ? 8 : size === "md" ? 14 : 18;
  const fontSize = size === "sm" ? 13 : size === "md" ? 16 : 20;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={[
          styles.btn,
          {
            backgroundColor: disabled ? colors.textDim : color,
            paddingHorizontal: padH,
            paddingVertical: padV,
            shadowColor: disabled ? "transparent" : color,
          },
        ]}
      >
        {icon && <>{icon}</>}
        <Text style={[styles.text, { color: textColor, fontSize }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
