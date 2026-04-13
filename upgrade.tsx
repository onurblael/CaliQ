import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSubscription, PLANS, PlanType } from "@/lib/subscription-context";
import { useI18n } from "@/lib/i18n-context";


type BillingCycle = "monthly" | "yearly";

export default function UpgradeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useI18n();
  const { suggestPlan } = useLocalSearchParams<{ suggestPlan?: string }>();
  const { subscription, upgradePlan, currentPlan, cancelSubscription, restorePurchases, isLoading } = useSubscription();
  const isFreePlan = currentPlan.id === "free";
  const showTrial = isFreePlan;
  
  const initialPlan = (suggestPlan === "pro_plus" ? "pro_plus" : "pro") as PlanType;
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  
  useEffect(() => {
    if (suggestPlan === "pro_plus") {
      setSelectedPlan("pro_plus");
    }
  }, [suggestPlan]);

  const handleSelectPlan = (planId: PlanType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPlan(planId);
  };

  const handleUpgrade = async () => {
    try {
      await upgradePlan(selectedPlan, billingCycle);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    } catch (e: any) {
      Alert.alert(
        "Erro na compra",
        e?.message ?? "Ocorreu um erro. Tenta novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert("Compras restauradas", "As tuas subscrições foram verificadas.");
    } catch {
      Alert.alert("Erro", "Não foi possível restaurar as compras. Tenta novamente.");
    }
  };

  const handleClose = () => {
    router.back();
  };

  const getPrice = (plan: typeof PLANS[PlanType]) => {
    if (billingCycle === "yearly") {
      const monthlyEquivalent = (plan.yearlyPrice / 12).toFixed(2);
      return { price: plan.yearlyPrice, monthly: monthlyEquivalent };
    }
    return { price: plan.price, monthly: plan.price.toFixed(2) };
  };

  const getSavings = (plan: typeof PLANS[PlanType]) => {
    if (billingCycle === "yearly" && plan.price > 0) {
      const yearlyIfMonthly = plan.price * 12;
      const savings = Math.round(((yearlyIfMonthly - plan.yearlyPrice) / yearlyIfMonthly) * 100);
      return savings;
    }
    return 0;
  };

  const getFeatures = (planId: PlanType) => {
    switch (planId) {
      case "free":
        return [
          { text: t.upgrade.mealScan, included: true },
          { text: t.upgrade.trackingIntervals, included: true },
          { text: t.upgrade.noRecipes, included: false },
        ];
      case "pro":
        return [
          { text: t.upgrade.fridgeScan1x, included: true },
          { text: t.upgrade.basicRecipes, included: true },
          { text: t.upgrade.dailyCalorieGoal, included: true },
        ];
      case "pro_plus":
        return [
          { text: t.upgrade.unlimitedScan, included: true },
          { text: t.upgrade.weeklyPlanning, included: true },
          { text: t.upgrade.optimizedRecipes, included: true },
          { text: t.upgrade.shoppingList, included: true },
        ];
      default:
        return [];
    }
  };

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case "free": return "⭐";
      case "pro": return "🌟";
      case "pro_plus": return "💎";
      default: return "⭐";
    }
  };

  const getPlanBackground = (planId: PlanType, isSelected: boolean): string => {
    if (!isSelected) return colors.surface;
    switch (planId) {
      case "free": return colors.muted + "08";
      case "pro": return colors.primary + "10";
      case "pro_plus": return colors.chartPurple + "10";
      default: return colors.surface;
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      {/* Premium Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity 
          onPress={handleClose} 
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <IconSymbol name="xmark" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.upgrade.choosePlan}</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + "15" }]}>
            <Text style={styles.heroEmoji}>🚀</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            {t.upgrade.unlockPotential}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            {t.upgrade.choosePlanDesc}
          </Text>
          {showTrial && (
            <View style={[styles.trialBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}>
              <Text style={styles.trialEmoji}>🎁</Text>
              <Text style={[styles.trialText, { color: colors.success }]}>
                {t.upgrade.trialBanner ?? "7 dias grátis • Cancela quando quiseres"}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Billing Toggle */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.billingSection}>
          <View style={[styles.billingToggle, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              onPress={() => setBillingCycle("monthly")}
              style={[
                styles.billingOption,
                billingCycle === "monthly" && { backgroundColor: colors.primary }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.billingText,
                { color: billingCycle === "monthly" ? "#FFFFFF" : colors.muted }
              ]}>
                {t.upgrade.monthly}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setBillingCycle("yearly")}
              style={[
                styles.billingOption,
                billingCycle === "yearly" && { backgroundColor: colors.primary }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.billingText,
                { color: billingCycle === "yearly" ? "#FFFFFF" : colors.muted }
              ]}>
                {t.upgrade.yearly}
              </Text>
              {billingCycle === "yearly" && (
                <View style={[styles.savingsBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.savingsText}>-33%</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Plan Cards */}
        <View style={styles.plansSection}>
          {(["free", "pro", "pro_plus"] as PlanType[]).map((planId, index) => {
            const plan = PLANS[planId];
            const isSelected = selectedPlan === planId;
            const isCurrent = currentPlan.id === planId;
            const priceInfo = getPrice(plan);
            const savings = getSavings(plan);
            const features = getFeatures(planId);
            const bgColor = getPlanBackground(planId, isSelected);

            return (
              <Animated.View 
                key={planId} 
                entering={FadeInDown.duration(400).delay(300 + index * 100)}
              >
                <TouchableOpacity
                  onPress={() => handleSelectPlan(planId)}
                  style={[
                    styles.planCard,
                    {
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected 
                        ? (planId === "pro_plus" ? colors.chartPurple : colors.primary)
                        : colors.border,
                    },
                  ]}
                  activeOpacity={0.9}
                >
                  <View style={[styles.planGradient, { backgroundColor: bgColor }]}>
                    {/* Badge */}
                    {plan.badge && (
                      <View 
                        style={[
                          styles.planBadge,
                          { backgroundColor: plan.popular ? colors.warning : colors.chartPurple }
                        ]}
                      >
                        <Text style={styles.planBadgeText}>
                          {planId === "pro" ? t.upgrade.mostPopular : t.upgrade.forSerious}
                        </Text>
                      </View>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                      <View 
                        style={[
                          styles.selectionIndicator,
                          { backgroundColor: planId === "pro_plus" ? colors.chartPurple : colors.primary }
                        ]}
                      >
                        <IconSymbol name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <View style={styles.planHeaderLeft}>
                        <View style={[styles.planIcon, { backgroundColor: colors.background }]}>
                          <Text style={styles.planEmoji}>{getPlanIcon(planId)}</Text>
                        </View>
                        <View>
                          <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                          {isCurrent && (
                            <View style={[styles.currentBadge, { backgroundColor: colors.success + "20" }]}>
                              <Text style={[styles.currentBadgeText, { color: colors.success }]}>
                                {t.upgrade.currentPlan}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.priceSection}>
                        {plan.price > 0 ? (
                          <>
                            <Text style={[styles.priceValue, { color: colors.foreground }]}>
                              €{priceInfo.monthly}
                            </Text>
                            <Text style={[styles.priceUnit, { color: colors.muted }]}>/{t.upgrade.month}</Text>
                            {billingCycle === "yearly" && savings > 0 && (
                              <View style={[styles.savingsTag, { backgroundColor: colors.success + "15" }]}>
                                <Text style={[styles.savingsTagText, { color: colors.success }]}>
                                  {t.upgrade.save} {savings}%
                                </Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <Text style={[styles.priceValue, { color: colors.foreground }]}>{t.upgrade.free}</Text>
                        )}
                      </View>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresSection}>
                      {features.map((feature, idx) => (
                        <View key={idx} style={styles.featureRow}>
                          <View style={[
                            styles.featureIcon,
                            { backgroundColor: feature.included ? colors.success + "15" : colors.muted + "15" }
                          ]}>
                            <IconSymbol 
                              name={feature.included ? "checkmark" : "xmark"} 
                              size={12} 
                              color={feature.included ? colors.success : colors.muted} 
                            />
                          </View>
                          <Text style={[
                            styles.featureText,
                            { color: feature.included ? colors.foreground : colors.muted }
                          ]}>
                            {feature.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* CTA Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(600)} style={styles.ctaSection}>
          {selectedPlan !== "free" && selectedPlan !== currentPlan.id ? (
            <TouchableOpacity
              onPress={handleUpgrade}
              style={[styles.ctaButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.ctaButtonText}>
                    {showTrial
                      ? `${t.upgrade.startTrial} — ${PLANS[selectedPlan].name}`
                      : `${t.upgrade.subscribe} ${PLANS[selectedPlan].name}`}
                  </Text>
                  <IconSymbol name="chevron.right" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          ) : selectedPlan === "free" && currentPlan.id !== "free" ? (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                cancelSubscription();
                setTimeout(() => {
                  router.back();
                }, 100);
              }}
              style={[styles.ctaButton, { backgroundColor: colors.error }]}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaButtonText}>
                {t.upgrade.backToFree}
              </Text>
            </TouchableOpacity>
          ) : selectedPlan === currentPlan.id ? (
            <View style={[styles.ctaButtonDisabled, { backgroundColor: colors.surface }]}>
              <Text style={[styles.ctaButtonDisabledText, { color: colors.muted }]}>
                {t.upgrade.thisIsYourPlan}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.ctaDisclaimer, { color: colors.muted }]}>
            {t.upgrade.cancelAnytime}
          </Text>

          <TouchableOpacity
            onPress={handleRestore}
            style={styles.restoreButton}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={[styles.restoreText, { color: colors.muted }]}>
              Restaurar compras anteriores
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Trust badges */}
        <Animated.View entering={FadeInUp.duration(400).delay(700)} style={styles.trustSection}>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <IconSymbol name="lock.fill" size={16} color={colors.muted} />
              <Text style={[styles.trustText, { color: colors.muted }]}>{t.upgrade.trustSecure}</Text>
            </View>
            <View style={styles.trustItem}>
              <IconSymbol name="checkmark.shield.fill" size={16} color={colors.muted} />
              <Text style={[styles.trustText, { color: colors.muted }]}>{t.upgrade.trustVerified}</Text>
            </View>
            <View style={styles.trustItem}>
              <IconSymbol name="arrow.counterclockwise" size={16} color={colors.muted} />
              <Text style={[styles.trustText, { color: colors.muted }]}>{t.upgrade.trustRefundable}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  trialEmoji: {
    fontSize: 18,
  },
  trialText: {
    fontSize: 14,
    fontWeight: "600",
  },
  billingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  billingToggle: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
  },
  billingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  billingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  savingsBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  plansSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  planCard: {
    borderRadius: 24,
    overflow: "hidden",
  },
  planGradient: {
    padding: 20,
    position: "relative",
  },
  planBadge: {
    position: "absolute",
    top: -1,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  selectionIndicator: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  planHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planEmoji: {
    fontSize: 24,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
  },
  currentBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  priceSection: {
    alignItems: "flex-end",
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  priceUnit: {
    fontSize: 13,
    marginTop: -4,
  },
  savingsTag: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsTagText: {
    fontSize: 11,
    fontWeight: "600",
  },
  featuresSection: {
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  ctaSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  ctaButtonDisabled: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
  },
  ctaButtonDisabledText: {
    fontSize: 17,
    fontWeight: "600",
  },
  ctaDisclaimer: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  restoreText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
  trustSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 12,
  },
});
