import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withDelay,
  useSharedValue,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface BarData {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  horizontal?: boolean;
}

function AnimatedBar({
  value,
  maxValue,
  color,
  index,
  height,
  horizontal,
}: {
  value: number;
  maxValue: number;
  color: string;
  index: number;
  height: number;
  horizontal?: boolean;
}) {
  const progress = useSharedValue(0);
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  React.useEffect(() => {
    progress.value = withDelay(
      index * 100,
      withTiming(percentage, { duration: 800 })
    );
  }, [percentage, index]);
  
  const animatedStyle = useAnimatedStyle(() => {
    if (horizontal) {
      return {
        width: `${progress.value}%`,
        height: "100%",
      };
    }
    return {
      height: `${progress.value}%`,
      width: "100%",
    };
  });
  
  return (
    <View
      style={[
        horizontal ? styles.horizontalBarContainer : styles.barContainer,
        { height: horizontal ? 8 : height },
      ]}
    >
      <Animated.View
        style={[
          horizontal ? styles.horizontalBar : styles.bar,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function BarChart({
  data,
  height = 120,
  showLabels = true,
  showValues = true,
  animated = true,
  horizontal = false,
}: BarChartProps) {
  const colors = useColors();
  const maxValue = Math.max(...data.map((d) => d.maxValue || d.value));
  
  if (horizontal) {
    return (
      <View style={styles.horizontalContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.horizontalRow}>
            {showLabels && (
              <Text style={[styles.horizontalLabel, { color: colors.muted }]}>
                {item.label}
              </Text>
            )}
            <View style={styles.horizontalBarWrapper}>
              <View
                style={[
                  styles.horizontalBarBg,
                  { backgroundColor: colors.border + "40" },
                ]}
              >
                <AnimatedBar
                  value={item.value}
                  maxValue={item.maxValue || maxValue}
                  color={item.color || colors.primary}
                  index={index}
                  height={8}
                  horizontal
                />
              </View>
              {showValues && (
                <Text style={[styles.horizontalValue, { color: colors.foreground }]}>
                  {item.value}g
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barsWrapper}>
        {data.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <View style={[styles.barBg, { backgroundColor: colors.border + "40" }]}>
              <AnimatedBar
                value={item.value}
                maxValue={item.maxValue || maxValue}
                color={item.color || colors.primary}
                index={index}
                height={height - 40}
              />
            </View>
            {showLabels && (
              <Text style={[styles.label, { color: colors.muted }]}>
                {item.label}
              </Text>
            )}
            {showValues && (
              <Text style={[styles.value, { color: colors.foreground }]}>
                {item.value}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  barsWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: 40,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  barBg: {
    width: "100%",
    maxWidth: 40,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
    height: "100%",
  },
  barContainer: {
    width: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  // Horizontal styles
  horizontalContainer: {
    width: "100%",
    gap: 12,
  },
  horizontalRow: {
    width: "100%",
  },
  horizontalLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  horizontalBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  horizontalBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  horizontalBarContainer: {
    borderRadius: 4,
    overflow: "hidden",
  },
  horizontalBar: {
    borderRadius: 4,
  },
  horizontalValue: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },
});
