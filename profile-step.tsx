import { Text, View, TextInput, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n-context";

interface ProfileStepProps {
  nameInput: string;
  ageInput: string;
  heightInput: string;
  onNameChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onHeightChange: (value: string) => void;
}

export function ProfileStep({
  nameInput,
  ageInput,
  heightInput,
  onNameChange,
  onAgeChange,
  onHeightChange,
}: ProfileStepProps) {
  const colors = useColors();
  const { t } = useI18n();

  const handleAgeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (parseInt(cleaned) > 120) return;
    onAgeChange(cleaned);
  };

  const handleHeightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (parseInt(cleaned) > 250) return;
    onHeightChange(cleaned);
  };

  return (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t.onboarding.profileTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t.onboarding.profileSubtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.inputSection}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>
            {t.onboarding.name} <Text style={{ color: colors.muted }}>({t.onboarding.optional})</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder={t.onboarding.namePlaceholder}
            placeholderTextColor={colors.muted}
            value={nameInput}
            onChangeText={onNameChange}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              {t.onboarding.age} <Text style={{ color: colors.muted }}>({t.onboarding.optional})</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="25"
              placeholderTextColor={colors.muted}
              value={ageInput}
              onChangeText={handleAgeChange}
              keyboardType="number-pad"
              returnKeyType="next"
              maxLength={3}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              {t.onboarding.height} <Text style={{ color: colors.muted }}>({t.onboarding.optional})</Text>
            </Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputWithUnitField,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="170"
                placeholderTextColor={colors.muted}
                value={heightInput}
                onChangeText={handleHeightChange}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={3}
              />
              <Text style={[styles.unit, { color: colors.muted }]}>cm</Text>
            </View>
          </View>
        </View>
      </Animated.View>
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
  inputSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputWithUnit: {
    position: "relative",
  },
  inputWithUnitField: {
    paddingRight: 48,
  },
  unit: {
    position: "absolute",
    right: 16,
    top: 18,
    fontSize: 16,
    fontWeight: "600",
  },
});
