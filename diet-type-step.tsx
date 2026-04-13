import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n-context";
import { DietType } from "@/lib/app-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface DietTypeStepProps {
  selectedDietType: DietType;
  onSelect: (dietType: DietType) => void;
}

const DIET_TYPE_OPTIONS: { value: DietType; emoji: string; color: string }[] = [
  { value: "balanced", emoji: "⚖️", color: "#0a7ea4" },
  { value: "keto", emoji: "🥑", color: "#16a34a" },
  { value: "paleo", emoji: "🍖", color: "#ea580c" },
  { value: "low-carb", emoji: "🥗", color: "#0891b2" },
  { value: "mediterranean", emoji: "🫒", color: "#7c3aed" },
  { value: "vegetarian", emoji: "🥬", color: "#65a30d" },
  { value: "vegan", emoji: "🌱", color: "#059669" },
];

export function DietTypeStep({ selectedDietType, onSelect }: DietTypeStepProps) {
  const colors = useColors();
  const { t } = useI18n();

  const getDietTypeLabel = (dietType: DietType): string => {
    switch (dietType) {
      case "balanced": return t.onboarding.balanced;
      case "keto": return t.onboarding.keto;
      case "paleo": return t.onboarding.paleo;
      case "low-carb": return t.onboarding.lowCarb;
      case "mediterranean": return t.onboarding.mediterranean;
      case "vegetarian": return t.onboarding.vegetarian;
      case "vegan": return t.onboarding.vegan;
    }
  };

  return (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t.onboarding.dietTypeTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t.onboarding.dietTypeSubtitle}
        </Text>
      </Animated.View>

      <View style={styles.dietTypesSection}>
        {DIET_TYPE_OPTIONS.map((option, index) => (
          <Animated.View 
            key={option.value}
            entering={FadeInDown.duration(400).delay(200 + index * 80)}
          >
            <TouchableOpacity
              onPress={() => onSelect(option.value)}
              style={[
                styles.dietTypeCard,
                {
                  backgroundColor: selectedDietType === option.value 
                    ? option.color + "10" 
                    : colors.surface,
                  borderColor: selectedDietType === option.value 
                    ? option.color 
                    : colors.border,
                  borderWidth: selectedDietType === option.value ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.dietTypeIcon, { backgroundColor: option.color + "15" }]}>
                <Text style={styles.emoji}>{option.emoji}</Text>
              </View>
              <Text style={[styles.dietTypeLabel, { color: colors.foreground }]}>
                {getDietTypeLabel(option.value)}
              </Text>
              {selectedDietType === option.value && (
                <View style={[styles.checkCircle, { backgroundColor: option.color }]}>
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  dietTypesSection: {
    gap: 12,
  },
  dietTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    position: "relative",
  },
  dietTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  emoji: {
    fontSize: 28,
  },
  dietTypeLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
