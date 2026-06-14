import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function playVictorySound(sfxVolume: number = 0.8) {
  if (Platform.OS === "web") {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      // C5, E5, G5, C6 (classic retro triumph chord)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const duration = 0.14;
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Triangle wave for a retro 8-bit sound
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + index * duration * 0.95);
        
        // Sub-oscillator for warmth
        oscSub.type = "sine";
        oscSub.frequency.setValueAtTime(freq / 2, now + index * duration * 0.95);
        
        gain.gain.setValueAtTime(sfxVolume * 0.12, now + index * duration * 0.95);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * duration * 0.95 + duration);
        
        osc.connect(gain);
        oscSub.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * duration * 0.95);
        osc.stop(now + index * duration * 0.95 + duration);
        
        oscSub.start(now + index * duration * 0.95);
        oscSub.stop(now + index * duration * 0.95 + duration);
      });
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  } else {
    // Native mobile/tablet fallback: trigger a success haptic notification
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.warn("Haptics failed:", e);
    }
  }
}
