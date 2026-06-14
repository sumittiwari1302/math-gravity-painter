import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, PanResponder, StyleSheet, Text, View } from "react-native";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import type { LevelDef, StarPos } from "@/data/levels";
import type { DrawTool } from "./FloatingToolbar";
import colors from "@/constants/colors";

interface Point { x: number; y: number }
interface DrawnPath { points: Point[]; tool: DrawTool }

interface GameCanvasProps {
  level: LevelDef;
  selectedTool: DrawTool;
  showHint: boolean;
  mathSolved: boolean;
  portalColor: string;
  ballColor: string;
  onStarCollected: (id: string) => void;
  onPortalReached: () => void;
  onMathNeeded: () => void;
  isLaunched: boolean;
  setIsLaunched: (v: boolean) => void;
  canvasWidth: number;
  canvasHeight: number;
  onPathDrawn: (hasPath: boolean) => void;
  shouldReset: boolean;
  onResetDone: () => void;
}

function samplePath(pts: Point[], maxPts: number): Point[] {
  if (pts.length <= maxPts) return pts;
  const step = (pts.length - 1) / (maxPts - 1);
  return Array.from({ length: maxPts }, (_, i) => pts[Math.min(Math.round(i * step), pts.length - 1)]);
}

function ptsToSvgD(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x} ${pts[i].y}`;
  return d;
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const BALL_R = 18;
const STAR_R = 16;
const PORTAL_R = 30;
const COLLECTION_R = 55;
const PORTAL_REACH_R = 65;

export function GameCanvas({
  level, selectedTool, showHint, mathSolved, portalColor, ballColor,
  onStarCollected, onPortalReached, onMathNeeded, isLaunched, setIsLaunched,
  canvasWidth, canvasHeight, onPathDrawn, shouldReset, onResetDone,
}: GameCanvasProps) {
  const scale = { x: canvasWidth, y: canvasHeight };

  const ballStart: Point = { x: level.ballStart.x * scale.x, y: level.ballStart.y * scale.y };
  const portalPos: Point = { x: level.portalPos.x * scale.x, y: level.portalPos.y * scale.y };
  const scaledStars = level.starPositions.map(s => ({ ...s, px: s.x * scale.x, py: s.y * scale.y }));
  const scaledPlatforms = level.platforms.map(p => ({
    x: p.x * scale.x, y: p.y * scale.y, w: p.w * scale.x, h: Math.max(p.h * scale.y, 10),
  }));

  const [paths, setPaths] = useState<DrawnPath[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [collectedStars, setCollectedStars] = useState<Set<string>>(new Set());
  const collectedRef = useRef<Set<string>>(new Set());
  const ballX = useRef(new Animated.Value(ballStart.x)).current;
  const ballY = useRef(new Animated.Value(ballStart.y)).current;
  const ballGlow = useRef(new Animated.Value(1)).current;
  const [ballPos, setBallPos] = useState(ballStart);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const progressRef = useRef(new Animated.Value(0));
  const pathEndedRef = useRef(false);
  const portalReachedRef = useRef(false);
  const [portalPulse] = useState(new Animated.Value(1));
  const [starScales] = useState(() => level.starPositions.map(() => new Animated.Value(1)));

  // Portal pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(portalPulse, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(portalPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Ball idle glow
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ballGlow, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(ballGlow, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Reset
  useEffect(() => {
    if (!shouldReset) return;
    animRef.current?.stop();
    progressRef.current.setValue(0);
    progressRef.current.removeAllListeners();
    ballX.setValue(ballStart.x);
    ballY.setValue(ballStart.y);
    setBallPos(ballStart);
    setPaths([]);
    setCurrentPoints([]);
    collectedRef.current = new Set();
    setCollectedStars(new Set());
    pathEndedRef.current = false;
    portalReachedRef.current = false;
    onResetDone();
  }, [shouldReset]);

  const checkCollisions = useCallback((pt: Point) => {
    // Stars
    scaledStars.forEach((star, idx) => {
      if (!collectedRef.current.has(star.id)) {
        if (dist(pt, { x: star.px, y: star.py }) < COLLECTION_R) {
          collectedRef.current.add(star.id);
          setCollectedStars(new Set(collectedRef.current));
          onStarCollected(star.id);
          Animated.sequence([
            Animated.spring(starScales[idx], { toValue: 1.8, useNativeDriver: true, speed: 80 }),
            Animated.timing(starScales[idx], { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
        }
      }
    });

    // Portal
    if (!portalReachedRef.current) {
      if (dist(pt, portalPos) < PORTAL_REACH_R) {
        if (!mathSolved) {
          onMathNeeded();
        } else {
          portalReachedRef.current = true;
          onPortalReached();
        }
      }
    }
  }, [scaledStars, portalPos, mathSolved]);

  const launchBall = useCallback(() => {
    const allPoints = paths.flatMap(p => p.points);
    if (allPoints.length < 2) return;

    setIsLaunched(true);
    pathEndedRef.current = false;
    portalReachedRef.current = false;

    const sampled = samplePath(allPoints, 120);
    const n = sampled.length;
    const progress = progressRef.current;
    progress.setValue(0);

    progress.removeAllListeners();
    progress.addListener(({ value }) => {
      const idx = Math.min(Math.floor(value * (n - 1)), n - 1);
      const pt = sampled[idx];
      ballX.setValue(pt.x);
      ballY.setValue(pt.y);
      setBallPos(pt);
      checkCollisions(pt);
    });

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: n * 28,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start(({ finished }) => {
      progress.removeAllListeners();
      if (finished) {
        pathEndedRef.current = true;
        // Apply gravity after path ends
        applyGravity(sampled[n - 1]);
      }
    });
  }, [paths, checkCollisions]);

  const applyGravity = (startPt: Point) => {
    const fallPts: Point[] = [];
    let y = startPt.y;
    const x = startPt.x;
    while (y < canvasHeight + 50) {
      y += 8;
      fallPts.push({ x, y });
    }
    if (fallPts.length < 2) return;

    const progress2 = new Animated.Value(0);
    const n = fallPts.length;
    progress2.addListener(({ value }) => {
      const idx = Math.min(Math.floor(value * (n - 1)), n - 1);
      const pt = fallPts[idx];
      ballX.setValue(pt.x);
      ballY.setValue(pt.y);
      setBallPos(pt);
      checkCollisions(pt);
    });

    Animated.timing(progress2, {
      toValue: 1,
      duration: n * 15,
      useNativeDriver: false,
    }).start(() => {
      progress2.removeAllListeners();
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isLaunched,
    onMoveShouldSetPanResponder: () => !isLaunched,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPoints([{ x: locationX, y: locationY }]);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPoints(prev => [...prev, { x: locationX, y: locationY }]);
    },
    onPanResponderRelease: () => {
      setCurrentPoints(prev => {
        if (prev.length > 1) {
          setPaths(ps => {
            const newPaths = [...ps, { points: prev, tool: selectedTool }];
            onPathDrawn(newPaths.length > 0);
            return newPaths;
          });
        }
        return [];
      });
    },
  });

  const handleUndo = useCallback(() => {
    setPaths(p => {
      const next = p.slice(0, -1);
      onPathDrawn(next.length > 0);
      return next;
    });
  }, []);
  const handleClear = useCallback(() => {
    setPaths([]);
    onPathDrawn(false);
  }, []);

  // Hint path
  const hintPoints = [ballStart, ...scaledStars.map(s => ({ x: s.px, y: s.py })), portalPos];

  return (
    <View style={[styles.container, { width: canvasWidth, height: canvasHeight }]} {...panResponder.panHandlers}>
      <Svg width={canvasWidth} height={canvasHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="ballGrad" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={ballColor} stopOpacity="1" />
            <Stop offset="60%" stopColor={ballColor} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={ballColor} stopOpacity="0.4" />
          </RadialGradient>
          <RadialGradient id="portalGrad" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor={portalColor} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={portalColor} stopOpacity="0.2" />
          </RadialGradient>
        </Defs>

        {/* Platforms */}
        {scaledPlatforms.map((p, i) => (
          <React.Fragment key={i}>
            <Path
              d={`M ${p.x} ${p.y} H ${p.x + p.w} V ${p.y + p.h} H ${p.x} Z`}
              fill={colors.card}
              stroke={colors.primary + "80"}
              strokeWidth={1.5}
            />
          </React.Fragment>
        ))}

        {/* Drawn paths */}
        {paths.map((path, i) => (
          <Path
            key={i}
            d={ptsToSvgD(path.points)}
            stroke={path.tool === "eraser" ? colors.surface : colors.accent}
            strokeWidth={path.tool === "eraser" ? 20 : 3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        ))}

        {/* Current path being drawn */}
        {currentPoints.length > 1 && (
          <Path
            d={ptsToSvgD(currentPoints)}
            stroke={colors.white}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}

        {/* Hint path */}
        {showHint && (
          <Path
            d={ptsToSvgD(hintPoints)}
            stroke={colors.gold}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 6"
            opacity={0.7}
          />
        )}

        {/* Stars */}
        {scaledStars.map((star, idx) => {
          if (collectedStars.has(star.id)) return null;
          return (
            <React.Fragment key={star.id}>
              <Circle cx={star.px} cy={star.py} r={STAR_R + 4} fill={colors.gold + "20"} />
              <Circle cx={star.px} cy={star.py} r={STAR_R - 2} fill={colors.gold} opacity={0.95} />
              <Circle cx={star.px - 4} cy={star.py - 4} r={4} fill={colors.white} opacity={0.6} />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Portal */}
      <Animated.View
        style={[
          styles.portal,
          {
            left: portalPos.x - PORTAL_R,
            top: portalPos.y - PORTAL_R,
            width: PORTAL_R * 2,
            height: PORTAL_R * 2,
            borderRadius: PORTAL_R,
            backgroundColor: (mathSolved ? portalColor : colors.textDim) + "40",
            borderColor: mathSolved ? portalColor : colors.textDim,
            transform: [{ scale: portalPulse }],
            shadowColor: mathSolved ? portalColor : "transparent",
          },
        ]}
      >
        <Text style={styles.portalIcon}>{mathSolved ? "🌀" : "🔒"}</Text>
      </Animated.View>

      {/* Ball */}
      <Animated.View
        style={[
          styles.ball,
          {
            left: ballX,
            top: ballY,
            transform: [
              { translateX: -BALL_R },
              { translateY: -BALL_R },
              { scale: isLaunched ? 1 : ballGlow.interpolate({ inputRange: [1, 1.4], outputRange: [1, 1.1] }) },
            ],
            shadowColor: ballColor,
          },
        ]}
      >
        <View style={[styles.ballInner, { backgroundColor: ballColor }]}>
          <View style={styles.ballEye} />
          <View style={styles.ballPupil} />
        </View>
      </Animated.View>

      {/* Ball start indicator */}
      {!isLaunched && paths.length === 0 && (
        <View style={[styles.startIndicator, { left: ballStart.x - 35, top: ballStart.y + BALL_R + 5 }]}>
          <Text style={styles.startText}>Draw path here</Text>
        </View>
      )}
    </View>
  );
}

// Expose undo/clear through imperative handle would be ideal but for simplicity
// we export these as static since FloatingToolbar handles it
export { };

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  portal: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  portalIcon: { fontSize: 22 },
  ball: {
    position: "absolute",
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  ballInner: {
    width: "100%",
    height: "100%",
    borderRadius: BALL_R,
    alignItems: "center",
    justifyContent: "center",
  },
  ballEye: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  ballPupil: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1a0040",
    top: 4,
    left: 4,
  },
  startIndicator: {
    position: "absolute",
    backgroundColor: colors.accent + "CC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  startText: { fontSize: 10, color: colors.white, fontFamily: "Inter_600SemiBold" },
});
