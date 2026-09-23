import { Platform, Vibration } from "react-native";
import * as Haptics from "expo-haptics";

export function triggerEmergencyHaptic() {
  try {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Continuous pulsing vibration for critical alert
      Vibration.vibrate([0, 500, 200, 500]);
    }
  } catch (e) {
    console.warn("Haptics not supported on this device:", e);
  }
}

export function triggerSuccessHaptic() {
  try {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (e) {}
}

export function stopVibration() {
  try {
    Vibration.cancel();
  } catch (e) {}
}
