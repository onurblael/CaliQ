import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Platform, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useApp, Goal } from "@/lib/app-context";
import { useI18n, LANGUAGE_NAMES, Language } from "@/lib/i18n-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const LANGUAGE_FLAGS: Record<Language, string> = {
  en: "🇬🇧",
  pt: "🇵🇹",
  es: "🇪🇸",
};

const PRIVACY_POLICY_URL = "https://caliqapp.com/privacy";

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language, setLanguage } = useI18n();
  const { preferences, setGoal, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const totalSteps = 3; // 0=language, 1=goal, 2=privacy

  const GOAL_OPTIONS: { value: Goal; label: string; emoji: string; description: string; color: string }[] = [
    { value: "loss", label: t.onboarding.loseWeight, emoji: "🎯", description: t.onboarding.loseWeightDesc, color: colors.chartOrange },
    { value: "maintenance", label: t.onboarding.maintainWeight, emoji: "⚖️", description: t.onboarding.maintainWeightDesc, color: colors.primary },
    { value: "gain", label: t.onboarding.gainMass, emoji: "💪", description: t.onboarding.gainMassDesc, color: colors.chartPurple },
  ];

  const handleLanguageSelect = (lang: Language) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setLanguage(lang);
  };

  const handleGoalSelect = (goal: Goal) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setGoal(goal);
  };

  const handlePrivacyToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setPrivacyAccepted(!privacyAccepted);
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Last step (privacy): require acceptance
    if (step === totalSteps - 1) {
      if (!privacyAccepted) return;
      completeOnboarding();
      router.replace("/(tabs)");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    // Skip is only available before the privacy step
    if (step < totalSteps - 1) {
      // Jump directly to privacy step
      setStep(totalSteps - 1);
    }
  };

  const isLastStep = step === totalSteps - 1;
  const isNextDisabled = isLastStep && !privacyAccepted;

  const renderLanguageStep = () => (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t.onboarding.languageTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t.onboarding.languageSubtitle}
        </Text>
      </Animated.View>

      <View style={styles.languageSection}>
        {(Object.keys(LANGUAGE_NAMES) as Language[]).map((lang, index) => (
          <Animated.View
            key={lang}
            entering={FadeInDown.duration(400).delay(200 + index * 100)}
          >
            <TouchableOpacity
              onPress={() => handleLanguageSelect(lang)}
              style={[
                styles.languageCard,
                {
                  backgroundColor: language === lang
                    ? colors.primary + "10"
                    : colors.surface,
                  borderColor: language === lang
                    ? colors.primary
                    : colors.border,
                  borderWidth: language === lang ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.languageIcon, { backgroundColor: colors.primary + "15" }]}>
                <Text style={styles.languageFlag}>{LANGUAGE_FLAGS[lang]}</Text>
              </View>
              <Text style={[styles.languageLabel, { color: colors.foreground }]}>
                {LANGUAGE_NAMES[lang]}
              </Text>
              {language === lang && (
                <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </>
  );

  const renderGoalStep = () => (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t.onboarding.goalTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t.onboarding.goalSubtitle}
        </Text>
      </Animated.View>

      <View style={styles.goalsSection}>
        {GOAL_OPTIONS.map((option, index) => (
          <Animated.View
            key={option.value}
            entering={FadeInDown.duration(400).delay(200 + index * 100)}
          >
            <TouchableOpacity
              onPress={() => handleGoalSelect(option.value)}
              style={[
                styles.goalCard,
                {
                  backgroundColor: preferences.goal === option.value
                    ? option.color + "10"
                    : colors.surface,
                  borderColor: preferences.goal === option.value
                    ? option.color
                    : colors.border,
                  borderWidth: preferences.goal === option.value ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.goalIcon, { backgroundColor: option.color + "15" }]}>
                <Text style={styles.goalEmoji}>{option.emoji}</Text>
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalLabel, { color: colors.foreground }]}>{option.label}</Text>
                <Text style={[styles.goalDesc, { color: colors.muted }]}>{option.description}</Text>
              </View>
              {preferences.goal === option.value && (
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

  const renderPrivacyStep = () => (
    <>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.headerSection}>
        <View style={[styles.privacyIconContainer, { backgroundColor: colors.primary + "15" }]}>
          <Text style={styles.privacyIcon}>🔒</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t.onboarding.privacyTitle}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t.onboarding.privacySubtitle}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        {/* Privacy summary card */}
        <View style={[styles.privacySummaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.privacySummaryText, { color: colors.foreground }]}>
            {t.onboarding.privacySummary}
          </Text>
        </View>

        {/* Read full policy link */}
        <TouchableOpacity
          onPress={handleOpenPrivacyPolicy}
          style={styles.privacyLinkRow}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.up.right.square" size={16} color={colors.primary} />
          <Text style={[styles.privacyLinkText, { color: colors.primary }]}>
            {t.onboarding.privacyReadFull}
          </Text>
        </TouchableOpacity>

        {/* Accept checkbox */}
        <TouchableOpacity
          onPress={handlePrivacyToggle}
          style={[
            styles.privacyCheckRow,
            {
              backgroundColor: privacyAccepted ? colors.primary + "10" : colors.surface,
              borderColor: privacyAccepted ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <View style={[
            styles.checkbox,
            {
              backgroundColor: privacyAccepted ? colors.primary : "transparent",
              borderColor: privacyAccepted ? colors.primary : colors.border,
            },
          ]}>
            {privacyAccepted && (
              <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={[styles.privacyCheckLabel, { color: colors.foreground }]}>
            {t.onboarding.privacyAcceptLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Premium Progress Indicator */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.progressSection}>
          <View style={styles.progressBar}>
            {[0, 1, 2].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: step >= s ? colors.primary : colors.border,
                    width: step === s ? 32 : 10,
                  }
                ]}
              />
            ))}
          </View>
          <Text style={[styles.stepIndicator, { color: colors.muted }]}>
            {step + 1} / {totalSteps}
          </Text>
        </Animated.View>

        {step === 0 && renderLanguageStep()}
        {step === 1 && renderGoalStep()}
        {step === 2 && renderPrivacyStep()}

        {/* Premium Buttons */}
        <Animated.View entering={FadeInUp.duration(400).delay(500)} style={styles.buttonsSection}>
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.primaryButton,
              {
                backgroundColor: isNextDisabled
                  ? colors.border
                  : colors.primary,
              },
            ]}
            activeOpacity={isNextDisabled ? 1 : 0.9}
          >
            <Text style={[styles.primaryButtonText, { color: isNextDisabled ? colors.muted : "#FFFFFF" }]}>
              {isLastStep ? t.onboarding.privacyGetStarted : t.common.continue}
            </Text>
            {!isLastStep && (
              <IconSymbol name="chevron.right" size={18} color={isNextDisabled ? colors.muted : "#FFFFFF"} />
            )}
          </TouchableOpacity>

          {/* Skip button only shown before the privacy step */}
          {!isLastStep && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={[styles.skipButtonText, { color: colors.muted }]}>{t.onboarding.skipSetup}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  progressSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: "500",
  },
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
  // Language styles
  languageSection: {
    gap: 12,
  },
  languageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    position: "relative",
  },
  languageIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  // Goal styles
  goalsSection: {
    gap: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    position: "relative",
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  // Privacy styles
  privacyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  privacyIcon: {
    fontSize: 36,
  },
  privacySummaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  privacySummaryText: {
    fontSize: 14,
    lineHeight: 22,
  },
  privacyLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  privacyLinkText: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  privacyCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 4,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  privacyCheckLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  // Button styles
  buttonsSection: {
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
