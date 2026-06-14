import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.2,
    twinkleDuration: 1000 + Math.random() * 3000,
  }));
}

const STARS = generateStars(80);

function Star({ star }: { star: (typeof STARS)[0] }) {
  const anim = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: star.opacity * 0.2, duration: star.twinkleDuration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: star.opacity, duration: star.twinkleDuration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: "#FFFFFF",
        opacity: anim,
      }}
    />
  );
}

export function SpaceBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      {STARS.map(s => <Star key={s.id} star={s} />)}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});
