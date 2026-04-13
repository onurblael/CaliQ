import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useApp, MealHistory } from "@/lib/app-context";
import { useSubscription } from "@/lib/subscription-context";
import { useI18n } from "@/lib/i18n-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleMealReminders } from "@/lib/notifications";

const APP_VERSION = "1.4.6";
const VERSION_KEY = `@caliq_last_seen_version`;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language } = useI18n();
  const { preferences, getTodayStats, calculateDailyCalories, getStreak } = useApp();
  const { 
    currentPlan, 
    canScanMeal, 
    canScanFridge, 
    getRemainingMealScans,
    getRemainingFridgeScans,
    canAccessRecipes
  } = useSubscription();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    const checkVersion = async () => {
      const lastSeenVersion = await AsyncStorage.getItem(VERSION_KEY);
      if (lastSeenVersion !== APP_VERSION) {
        router.push("/whats-new");
        return;
      }
    };

    if (!preferences.onboardingComplete) {
      setShowOnboarding(true);
      const timer = setTimeout(() => {
        router.push("/onboarding");
      }, 100);
      return () => clearTimeout(timer);
    }

    checkVersion();
  }, [preferences.onboardingComplete]);

  // Re-schedule reminders whenever the setting or language changes
  useEffect(() => {
    if (preferences.onboardingComplete && preferences.notificationsEnabled) {
      scheduleMealReminders(language).catch(() => {});
    }
  }, [preferences.onboardingComplete, preferences.notificationsEnabled, language]);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleScanMeal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (canScanMeal()) {
      router.push("/camera?mode=meal");
    } else {
      router.push("/upgrade");
    }
  };

  const handleScanFridge = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (canScanFridge()) {
      router.push("/camera?mode=fridge");
    } else {
      if (currentPlan.id === "free") {
        router.push("/upgrade");
      } else {
        router.push("/upgrade?suggestPlan=pro_plus");
      }
    }
  };

  const handleUpgrade = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/upgrade");
  };

  const todayStats = getTodayStats();
  const streak = getStreak();
  const targetCalories = calculateDailyCalories() ?? (preferences.goal === "loss" ? 1800 : preferences.goal === "gain" ? 2500 : 2000);
  const progressPercent = Math.min(100, (todayStats.totalCalories / targetCalories) * 100);
  const remainingMealScans = getRemainingMealScans();
  const remainingFridgeScans = getRemainingFridgeScans();
  const remainingCalories = Math.max(0, targetCalories - todayStats.totalCalories);

  // Macros reais acumulados dos scans — só mostrar quando há dados reais
  const todayMacros = {
    protein: todayStats.totalProtein,
    carbs: todayStats.totalCarbs,
    fat: todayStats.totalFat,
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const base = hour < 12 ? t.home.greeting.morning : hour < 19 ? t.home.greeting.afternoon : t.home.greeting.evening;
    const firstName = preferences.name?.split(" ")[0];
    return firstName ? `${base}, ${firstName} 👋` : `${base} 👋`;
  };

  const getMealTimeHint = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return t.home.mealTime.breakfast;
    if (hour >= 10 && hour < 12) return t.home.mealTime.morningSnack;
    if (hour >= 12 && hour < 14) return t.home.mealTime.lunch;
    if (hour >= 14 && hour < 17) return t.home.mealTime.afternoonSnack;
    if (hour >= 17 && hour < 21) return t.home.mealTime.dinner;
    return t.home.mealTime.nightSnack;
  };

  const recentMeals = preferences.mealHistory.slice(-3).reverse();

  // Macros alvo baseados no objetivo (apenas usados como referência visual nas barras)
  const targetMacros = {
    protein: Math.round(targetCalories * 0.25 / 4),
    carbs: Math.round(targetCalories * 0.45 / 4),
    fat: Math.round(targetCalories * 0.30 / 9),
  };

  return (
    <ScreenContainer className="px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Premium Header */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          className="flex-row items-center justify-between mt-2 mb-6"
        >
          <View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{getGreeting()}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{getMealTimeHint()}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleUpgrade}
            style={[
              styles.planBadge,
              { 
                backgroundColor: currentPlan.id === "free" ? colors.surface : colors.primary + "15",
                borderColor: currentPlan.id === "free" ? colors.border : colors.primary + "30",
              }
            ]}
          >
            <View style={[styles.planDot, { backgroundColor: currentPlan.id === "free" ? colors.muted : colors.primary }]} />
            <Text 
              style={[styles.planText, { color: currentPlan.id === "free" ? colors.muted : colors.primary }]}
            >
              {currentPlan.name}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main Progress Card with Ring */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.home.todayProgress}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
                {todayStats.mealsCount} {todayStats.mealsCount === 1 ? t.home.meal : t.home.meals} {t.home.mealsLogged.split(" ").slice(-1)[0]}
              </Text>
            </View>
            {streak >= 2 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.success + "15" }]}>
                <Text style={[styles.streakText, { color: colors.success }]}>🔥 {streak} {t.home.streak}</Text>
              </View>
            )}
          </View>

          <View style={styles.progressContent}>
            <ProgressRing
              progress={progressPercent}
              size={160}
              strokeWidth={14}
              value={todayStats.totalCalories.toString()}
              subtitle={`${t.home.of} ${targetCalories}`}
              label="kcal"
              showGradient={true}
            />
            
            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{remainingCalories}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{t.home.remaining}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{Math.round(progressPercent)}%</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{t.home.complete}</Text>
              </View>
            </View>
          </View>

          {/* Macro Progress Bars — só aparece quando há dados reais de scans */}
          {todayStats.hasMacroData ? (
            <View style={styles.macrosContainer}>
              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.chartBlue }]} />
                  <Text style={[styles.macroLabel, { color: colors.muted }]}>{t.home.protein}</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBarBg, { backgroundColor: colors.border + "40" }]}>
                    <View
                      style={[
                        styles.macroBar,
                        {
                          backgroundColor: colors.chartBlue,
                          width: `${Math.min(100, (todayMacros.protein / targetMacros.protein) * 100)}%`,
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.macroValue, { color: colors.foreground }]}>
                    {todayMacros.protein}g
                  </Text>
                </View>
              </View>

              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.chartOrange }]} />
                  <Text style={[styles.macroLabel, { color: colors.muted }]}>{t.home.carbs}</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBarBg, { backgroundColor: colors.border + "40" }]}>
                    <View
                      style={[
                        styles.macroBar,
                        {
                          backgroundColor: colors.chartOrange,
                          width: `${Math.min(100, (todayMacros.carbs / targetMacros.carbs) * 100)}%`,
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.macroValue, { color: colors.foreground }]}>
                    {todayMacros.carbs}g
                  </Text>
                </View>
              </View>

              <View style={styles.macroRow}>
                <View style={styles.macroInfo}>
                  <View style={[styles.macroDot, { backgroundColor: colors.chartPurple }]} />
                  <Text style={[styles.macroLabel, { color: colors.muted }]}>{t.home.fat}</Text>
                </View>
                <View style={styles.macroBarContainer}>
                  <View style={[styles.macroBarBg, { backgroundColor: colors.border + "40" }]}>
                    <View
                      style={[
                        styles.macroBar,
                        {
                          backgroundColor: colors.chartPurple,
                          width: `${Math.min(100, (todayMacros.fat / targetMacros.fat) * 100)}%`,
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.macroValue, { color: colors.foreground }]}>
                    {todayMacros.fat}g
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.macrosPlaceholder, { backgroundColor: colors.border + "20" }]}>
              <Text style={[styles.macrosPlaceholderText, { color: colors.muted }]}>
                {t.home.macrosAfterScan}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Daily Calorie Goal Card */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(250)}
          style={[styles.calorieGoalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {(() => {
            const dailyCalories = calculateDailyCalories();
            const hasAllData = preferences.age && preferences.weight && preferences.height && preferences.gender;
            
            if (!hasAllData) {
              return (
                <View style={styles.calorieGoalContent}>
                  <View style={[styles.calorieGoalIcon, { backgroundColor: colors.warning + "15" }]}>
                    <IconSymbol name="info.circle.fill" size={24} color={colors.warning} />
                  </View>
                  <View style={styles.calorieGoalInfo}>
                    <Text style={[styles.calorieGoalTitle, { color: colors.foreground }]}>{t.home.completeProfile}</Text>
                    <Text style={[styles.calorieGoalDesc, { color: colors.muted }]}>{t.home.completeProfileDesc}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push("/settings");
                    }}
                    style={[styles.calorieGoalButton, { backgroundColor: colors.primary }]}
                  >
                    <IconSymbol name="arrow.right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              );
            }
            
            const isManual = preferences.useManualCalories && preferences.manualCalorieGoal;
            
            return (
              <View style={styles.calorieGoalContent}>
                <View style={[styles.calorieGoalIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="flame.fill" size={24} color={colors.primary} />
                </View>
                <View style={styles.calorieGoalInfo}>
                  <Text style={[styles.calorieGoalTitle, { color: colors.foreground }]}>
                    {t.home.dailyCalorieGoal}
                    {isManual && <Text style={[styles.calorieGoalBadge, { color: colors.warning }]}> • Manual</Text>}
                    {!isManual && <Text style={[styles.calorieGoalBadge, { color: colors.success }]}> • Auto</Text>}
                  </Text>
                  <Text style={[styles.calorieGoalValue, { color: colors.primary }]}>
                    {dailyCalories ? `${Math.round(dailyCalories * 0.85)}-${Math.round(dailyCalories * 1.15)}` : "-"} {t.home.calories}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/settings");
                  }}
                  style={[styles.calorieGoalButtonSmall, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <IconSymbol name="pencil" size={14} color={colors.muted} />
                </TouchableOpacity>
              </View>
            );
          })()}
        </Animated.View>

        {/* Premium CTA Button */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(300)}
          style={styles.ctaContainer}
        >
          <Text style={[styles.ctaTitle, { color: colors.foreground }]}>
            {t.home.whatEating}
          </Text>
          <Text style={[styles.ctaSubtitle, { color: colors.muted }]}>
            {t.home.snapPhoto}
          </Text>
          
          <View style={styles.buttonWrapper}>
            <Animated.View style={[styles.glowEffect, { backgroundColor: colors.primary }, animatedGlowStyle]} />
            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity
                onPress={handleScanMeal}
                style={[styles.mainButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.9}
              >
                <IconSymbol name="camera.fill" size={36} color="#FFFFFF" />
                <Text style={styles.buttonText}>{t.home.scanMealBtn}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {remainingMealScans !== -1 && (
            <Text style={[styles.scansRemaining, { color: colors.muted }]}>
              {remainingMealScans} {t.home.scansRemaining}
            </Text>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.actionsRow}
        >
          <TouchableOpacity
            onPress={handleScanFridge}
            style={[
              styles.actionCard,
              { 
                backgroundColor: colors.surface,
                borderColor: canScanFridge() ? colors.border : colors.warning + "50",
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.actionHeader}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name="refrigerator.fill" size={20} color={colors.primary} />
              </View>
              {!canScanFridge() && (
                <View style={[styles.proBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.proBadgeText}>
                    {currentPlan.id === "free" ? "PRO" : "PRO+"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>{t.home.scanFridge}</Text>
            <Text style={[styles.actionDesc, { color: colors.muted }]}>
              {canScanFridge() 
                ? remainingFridgeScans === -1 
                  ? t.home.unlimited 
                  : `${remainingFridgeScans} ${t.home.left}`
                : t.home.getRecipes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => canAccessRecipes ? router.push("/camera?mode=fridge") : router.push("/upgrade")}
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.surface,
                borderColor: canAccessRecipes ? colors.border : colors.warning + "50",
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.actionHeader}>
              <View style={[styles.actionIcon, { backgroundColor: colors.secondary + "15" }]}>
                <IconSymbol name="book.fill" size={20} color={colors.secondary} />
              </View>
              {!canAccessRecipes && (
                <View style={[styles.proBadge, { backgroundColor: colors.warning }]}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={[styles.actionTitle, { color: colors.foreground }]}>{t.home.recipes}</Text>
            <Text style={[styles.actionDesc, { color: colors.muted }]}>
              {canAccessRecipes ? t.home.aiSuggestions : t.home.unlock}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Meals */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(500)}
          style={styles.recentSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.recentMeals}</Text>
          
          {recentMeals.length > 0 ? (
            <View style={[styles.mealsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {recentMeals.map((meal: MealHistory, index: number) => (
                <View 
                  key={index}
                  style={[
                    styles.mealItem,
                    index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
                  ]}
                >
                  <View style={styles.mealLeft}>
                    <View style={[styles.mealIcon, { backgroundColor: meal.liked ? colors.success + "15" : colors.muted + "15" }]}>
                      <Text style={styles.mealEmoji}>{meal.liked ? "✓" : "○"}</Text>
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={[styles.mealName, { color: colors.foreground }]} numberOfLines={1}>
                        {meal.recipeName}
                      </Text>
                      <Text style={[styles.mealTime, { color: colors.muted }]}>
                        {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.mealRight}>
                    <Text style={[styles.mealCalories, { color: colors.foreground }]}>{meal.calories}</Text>
                    <Text style={[styles.mealUnit, { color: colors.muted }]}>kcal</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>{t.home.noMealsYet}</Text>
              <Text style={[styles.emptyHint, { color: colors.muted }]}>
                {t.home.scanFirstMeal}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  planDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  planText: {
    fontSize: 13,
    fontWeight: "600",
  },
  mainCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statsColumn: {
    flex: 1,
    marginLeft: 24,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  statDivider: {
    height: 1,
    width: "60%",
    alignSelf: "center",
  },
  macrosContainer: {
    gap: 12,
  },
  macrosPlaceholder: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  macrosPlaceholderText: {
    fontSize: 12,
    textAlign: "center",
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  macroBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  macroBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  macroBar: {
    height: "100%",
    borderRadius: 3,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "600",
    width: 40,
    textAlign: "right",
  },
  calorieGoalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calorieGoalContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  calorieGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  calorieGoalInfo: {
    flex: 1,
  },
  calorieGoalTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  calorieGoalBadge: {
    fontSize: 11,
    fontWeight: "500",
  },
  calorieGoalValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  calorieGoalDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  calorieGoalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieGoalButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowEffect: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    transform: [{ scale: 1.2 }],
  },
  mainButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  scansRemaining: {
    fontSize: 12,
    marginTop: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  mealsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  mealLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealEmoji: {
    fontSize: 18,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: "600",
  },
  mealTime: {
    fontSize: 12,
    marginTop: 2,
  },
  mealRight: {
    alignItems: "flex-end",
  },
  mealCalories: {
    fontSize: 18,
    fontWeight: "700",
  },
  mealUnit: {
    fontSize: 11,
    marginTop: 1,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
  },
});
