import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface MacroCardProps {
  label: string;
  value: number;
  unit?: string;
  target?: number;
  color?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function MacroCard({
  label,
  value,
  unit = "g",
  target,
  color,
  icon,
  delay = 0,
}: MacroCardProps) {
  const colors = useColors();
  const progress = useSharedValue(0);
  const percentage = target ? Math.min((value / target) * 100, 100) : 0;
  
  React.useEffect(() => {
    if (target) {
      progress.value = withDelay(delay, withTiming(percentage, { duration: 800 }));
    }
  }, [percentage, delay, target]);
  
  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));
  
  const cardColor = color || colors.primary;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      </View>
      
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
        <Text style={[styles.unit, { color: colors.muted }]}>{unit}</Text>
        {target && (
          <Text style={[styles.target, { color: colors.muted }]}>/ {target}{unit}</Text>
        )}
      </View>
      
      {target && (
        <View style={[styles.progressBg, { backgroundColor: colors.border + "40" }]}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: cardColor },
              animatedBarStyle,
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  iconContainer: {
    opacity: 0.8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
  },
  unit: {
    fontSize: 14,
    fontWeight: "500",
  },
  target: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});
