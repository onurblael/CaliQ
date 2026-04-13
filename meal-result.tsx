import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeInDown, 
  FadeInUp,
} from "react-native-reanimated";
import { useApp } from "@/lib/app-context";
import { useSubscription } from "@/lib/subscription-context";
import { useI18n } from "@/lib/i18n-context";

interface DetectedFood {
  name: string;
  confidence: number;
  calories?: number;
  category?: string;
}

interface MealAnalysis {
  foods: DetectedFood[];
  totalCalories: { min: number; max: number };
  alignmentPercent: number;
  mealType: string;
  nutritionBreakdown?: {
    protein: number;
    carbs: number;
    fat: number;
    saturatedFat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

export default function MealResultScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ analysisData?: string }>();
  const { preferences, addMealToHistory, getTodayStats, calculateDailyCalories } = useApp();
  const { canAccessRecipes, currentPlan } = useSubscription();
  const { t, language } = useI18n();

  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [logged, setLogged] = useState(false);
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);

  useEffect(() => {
    if (params.analysisData) {
      try {
        const parsed = JSON.parse(params.analysisData) as MealAnalysis;
        setAnalysis(parsed);
      } catch (e) {
        console.error("Failed to parse analysis data:", e);
      }
    }
  }, [params.analysisData]);

  const handleLogMeal = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (analysis) {
      const avgCalories = Math.round((analysis.totalCalories.min + analysis.totalCalories.max) / 2);
      const macros = analysis.nutritionBreakdown
        ? {
            protein: analysis.nutritionBreakdown.protein,
            carbs: analysis.nutritionBreakdown.carbs,
            fat: analysis.nutritionBreakdown.fat,
          }
        : undefined;
      addMealToHistory(analysis.mealType, true, avgCalories, macros);
      setLogged(true);
    }
  };

  const handleGetRecipes = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (canAccessRecipes) {
      router.push("/camera?mode=fridge");
    } else {
      router.push("/upgrade");
    }
  };

  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  const handleScanAnother = () => {
    router.replace("/camera?mode=meal");
  };

  const todayStats = getTodayStats();
  const targetCalories = calculateDailyCalories() ?? (preferences.goal === "loss" ? 1800 : preferences.goal === "gain" ? 2500 : 2000);
  const remainingCalories = targetCalories - todayStats.totalCalories;

  const texts = {
    en: {
      mealLogged: "Meal logged!",
      todayConsumed: "Today you've consumed approximately",
      canStillConsume: `You can still consume ~${remainingCalories} kcal today`,
      reachedGoal: "You've reached your daily calorie goal",
      scanAnother: "Scan another meal",
      goHome: "Go Home",
      loading: "Loading analysis...",
      mealAnalysis: "Meal Analysis",
      alignment: "Alignment with your",
      lossGoal: "weight loss",
      gainGoal: "muscle gain",
      maintenanceGoal: "maintenance",
      goal: "goal",
      dailyProgress: "Daily progress",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
      saturatedFat: "Sat. Fat",
      fiber: "Fiber",
      sugar: "Sugar",
      sodium: "Sodium",
      detectedFoods: "Detected foods",
      logMeal: "Log this meal",
      getRecipes: "Scan fridge for recipe ideas",
      unlockRecipes: "What can I cook with what I have?",
      showMore: "Show more",
      showLess: "Show less",
      excellentChoice: "Excellent choice! This meal aligns well with your goal.",
      goodChoice: "Good choice! You can improve a bit in the next meals.",
      offGoal: "This meal is a bit off your goal. Consider adjusting the next ones.",
      estimated: "Estimated",
      calories: "calories",
      goalAlignment: "Goal Alignment",
      macroBreakdown: "Macro Breakdown",
      nutritionDetails: "Nutrition Details",
      confidence: "confidence",
      legendPrevious: "Previous",
      legendThisMeal: "This meal",
    },
    pt: {
      mealLogged: "Refeição registada!",
      todayConsumed: "Hoje já consumiste aproximadamente",
      canStillConsume: `Ainda podes consumir ~${remainingCalories} kcal hoje`,
      reachedGoal: "Atingiste o teu objetivo calórico diário",
      scanAnother: "Analisar outra refeição",
      goHome: "Voltar ao Início",
      loading: "A carregar análise...",
      mealAnalysis: "Análise da Refeição",
      alignment: "Alinhamento com o teu objetivo de",
      lossGoal: "perda",
      gainGoal: "ganho",
      maintenanceGoal: "manutenção",
      goal: "",
      dailyProgress: "Progresso diário",
      protein: "Proteína",
      carbs: "Carbos",
      fat: "Gordura",
      saturatedFat: "Gord. Sat.",
      fiber: "Fibra",
      sugar: "Açúcar",
      sodium: "Sódio",
      detectedFoods: "Alimentos detetados",
      logMeal: "Registar esta refeição",
      getRecipes: "Analisar frigorífico e obter receitas",
      unlockRecipes: "O que posso cozinhar com o que tenho?",
      showMore: "Ver mais",
      showLess: "Ver menos",
      excellentChoice: "Excelente escolha! Esta refeição está bem alinhada com o teu objetivo.",
      goodChoice: "Boa escolha! Podes melhorar um pouco nas próximas refeições.",
      offGoal: "Esta refeição está um pouco fora do teu objetivo. Considera ajustar as próximas.",
      estimated: "Estimado",
      calories: "calorias",
      goalAlignment: "Alinhamento",
      macroBreakdown: "Macros",
      nutritionDetails: "Detalhes Nutricionais",
      confidence: "confiança",
      legendPrevious: "Anterior",
      legendThisMeal: "Esta refeição",
    },
    es: {
      mealLogged: "¡Comida registrada!",
      todayConsumed: "Hoy has consumido aproximadamente",
      canStillConsume: `Aún puedes consumir ~${remainingCalories} kcal hoy`,
      reachedGoal: "Has alcanzado tu objetivo calórico diario",
      scanAnother: "Analizar otra comida",
      goHome: "Volver al Inicio",
      loading: "Cargando análisis...",
      mealAnalysis: "Análisis de la Comida",
      alignment: "Alineación con tu objetivo de",
      lossGoal: "pérdida",
      gainGoal: "ganancia",
      maintenanceGoal: "mantenimiento",
      goal: "",
      dailyProgress: "Progreso diario",
      protein: "Proteína",
      carbs: "Carbos",
      fat: "Grasa",
      saturatedFat: "Grasa Sat.",
      fiber: "Fibra",
      sugar: "Azúcar",
      sodium: "Sodio",
      detectedFoods: "Alimentos detectados",
      logMeal: "Registrar esta comida",
      getRecipes: "Escanear nevera y obtener recetas",
      unlockRecipes: "¿Qué puedo cocinar con lo que tengo?",
      showMore: "Ver más",
      showLess: "Ver menos",
      excellentChoice: "¡Excelente elección! Esta comida está bien alineada con tu objetivo.",
      goodChoice: "¡Buena elección! Puedes mejorar un poco en las próximas comidas.",
      offGoal: "Esta comida está un poco fuera de tu objetivo. Considera ajustar las próximas.",
      estimated: "Estimado",
      calories: "calorías",
      goalAlignment: "Alineación",
      macroBreakdown: "Macros",
      nutritionDetails: "Detalles Nutricionales",
      confidence: "confianza",
      legendPrevious: "Anterior",
      legendThisMeal: "Esta comida",
    },
  };

  const txt = texts[language];

  if (logged) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
        <View style={styles.successContainer}>
          <Animated.View 
            entering={FadeInDown.duration(600).delay(100)}
            style={styles.successContent}
          >
            <View style={[styles.successIcon, { backgroundColor: colors.success + "15" }]}>
              <Text style={[styles.successEmoji, { color: colors.success }]}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              {txt.mealLogged}
            </Text>
            <Text style={[styles.successSubtitle, { color: colors.muted }]}>
              {txt.todayConsumed}
            </Text>
            <Text style={[styles.successCalories, { color: colors.primary }]}>
              {todayStats.totalCalories + (analysis ? Math.round((analysis.totalCalories.min + analysis.totalCalories.max) / 2) : 0)} kcal
            </Text>
            <Text style={[styles.successHint, { color: colors.muted }]}>
              {remainingCalories > 0 ? txt.canStillConsume : txt.reachedGoal}
            </Text>
          </Animated.View>
          
          <Animated.View 
            entering={FadeInUp.duration(600).delay(300)}
            style={styles.successButtons}
          >
            <TouchableOpacity
              onPress={handleScanAnother}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.9}
            >
              <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{txt.scanAnother}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGoHome}
              style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>{txt.goHome}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  if (!analysis) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center">
        <Text style={{ color: colors.muted }}>{txt.loading}</Text>
      </ScreenContainer>
    );
  }

  const alignmentColor = analysis.alignmentPercent >= 80 
    ? colors.success 
    : analysis.alignmentPercent >= 50 
      ? colors.warning 
      : colors.error;

  const goalText = preferences.goal === "loss" 
    ? txt.lossGoal 
    : preferences.goal === "gain" 
      ? txt.gainGoal 
      : txt.maintenanceGoal;

  const avgCalories = Math.round((analysis.totalCalories.min + analysis.totalCalories.max) / 2);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={handleGoHome} 
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <IconSymbol name="xmark" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{txt.mealAnalysis}</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.mealTypeBadgeContainer}
        >
          <View style={[styles.mealTypeBadge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.mealTypeBadgeText, { color: colors.primary }]}>{analysis.mealType}</Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={[styles.mainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.caloriesSection}>
            <Text style={[styles.caloriesLabel, { color: colors.muted }]}>{txt.estimated}</Text>
            <View style={styles.caloriesRow}>
              <Text style={[styles.caloriesValue, { color: colors.foreground }]}>
                {analysis.totalCalories.min}
              </Text>
              <Text style={[styles.caloriesDash, { color: colors.muted }]}>–</Text>
              <Text style={[styles.caloriesValue, { color: colors.foreground }]}>
                {analysis.totalCalories.max}
              </Text>
            </View>
            <Text style={[styles.caloriesUnit, { color: colors.muted }]}>kcal</Text>
          </View>

          <View style={styles.alignmentSection}>
            <ProgressRing
              progress={analysis.alignmentPercent}
              size={100}
              strokeWidth={10}
              value={`${analysis.alignmentPercent}%`}
              label={txt.goalAlignment}
              color={alignmentColor}
            />
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(300)}
          style={[styles.feedbackCard, { backgroundColor: alignmentColor + "10", borderColor: alignmentColor + "30" }]}
        >
          <View style={[styles.feedbackIcon, { backgroundColor: alignmentColor + "20" }]}>
            <Text style={styles.feedbackEmoji}>
              {analysis.alignmentPercent >= 80 ? "🎉" : analysis.alignmentPercent >= 50 ? "👍" : "💪"}
            </Text>
          </View>
          <Text style={[styles.feedbackText, { color: alignmentColor }]}>
            {analysis.alignmentPercent >= 80 
              ? txt.excellentChoice
              : analysis.alignmentPercent >= 50
                ? txt.goodChoice
                : txt.offGoal}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.duration(500).delay(400)}
          style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>{txt.dailyProgress}</Text>
            <Text style={[styles.progressValue, { color: colors.muted }]}>
              {todayStats.totalCalories + avgCalories} / {targetCalories} kcal
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border + "40" }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${Math.min(100, (todayStats.totalCalories / targetCalories) * 100)}%`
                }
              ]} 
            />
            <View 
              style={[
                styles.progressBarNew, 
                { 
                  backgroundColor: colors.primary + "60",
                  left: `${Math.min(100, (todayStats.totalCalories / targetCalories) * 100)}%`,
                  width: `${Math.min(100 - (todayStats.totalCalories / targetCalories) * 100, (avgCalories / targetCalories) * 100)}%`
                }
              ]} 
            />
          </View>
          <View style={styles.progressLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>{txt.legendPrevious}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary + "60" }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>{txt.legendThisMeal}</Text>
            </View>
          </View>
        </Animated.View>

        {analysis.nutritionBreakdown && (
          <Animated.View 
            entering={FadeInDown.duration(500).delay(500)}
            style={[styles.macrosCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{txt.macroBreakdown}</Text>
            
            <View style={styles.macrosGrid}>
              <View style={styles.macroItem}>
                <View style={[styles.macroCircle, { backgroundColor: colors.chartBlue + "15" }]}>
                  <Text style={[styles.macroValue, { color: colors.chartBlue }]}>
                    {analysis.nutritionBreakdown.protein}g
                  </Text>
                </View>
                <Text style={[styles.macroLabel, { color: colors.muted }]}>{txt.protein}</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroCircle, { backgroundColor: colors.chartOrange + "15" }]}>
                  <Text style={[styles.macroValue, { color: colors.chartOrange }]}>
                    {analysis.nutritionBreakdown.carbs}g
                  </Text>
                </View>
                <Text style={[styles.macroLabel, { color: colors.muted }]}>{txt.carbs}</Text>
              </View>
              
              <View style={styles.macroItem}>
                <View style={[styles.macroCircle, { backgroundColor: colors.chartPurple + "15" }]}>
                  <Text style={[styles.macroValue, { color: colors.chartPurple }]}>
                    {analysis.nutritionBreakdown.fat}g
                  </Text>
                </View>
                <Text style={[styles.macroLabel, { color: colors.muted }]}>{txt.fat}</Text>
              </View>
            </View>

            {(analysis.nutritionBreakdown.saturatedFat !== undefined || 
              analysis.nutritionBreakdown.fiber !== undefined ||
              analysis.nutritionBreakdown.sugar !== undefined ||
              analysis.nutritionBreakdown.sodium !== undefined) && (
              <>
                <TouchableOpacity 
                  onPress={() => setShowNutritionDetails(!showNutritionDetails)}
                  style={styles.expandButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.expandButtonText, { color: colors.primary }]}>
                    {showNutritionDetails ? txt.showLess : txt.showMore}
                  </Text>
                  <IconSymbol 
                    name={showNutritionDetails ? "chevron.up" : "chevron.down"} 
                    size={14} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>

                {showNutritionDetails && (
                  <View style={[styles.detailsGrid, { borderTopColor: colors.border }]}>
                    {analysis.nutritionBreakdown.saturatedFat !== undefined && (
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailValue, { color: colors.foreground }]}>
                          {analysis.nutritionBreakdown.saturatedFat}g
                        </Text>
                        <Text style={[styles.detailLabel, { color: colors.muted }]}>{txt.saturatedFat}</Text>
                      </View>
                    )}
                    {analysis.nutritionBreakdown.fiber !== undefined && (
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailValue, { color: colors.foreground }]}>
                          {analysis.nutritionBreakdown.fiber}g
                        </Text>
                        <Text style={[styles.detailLabel, { color: colors.muted }]}>{txt.fiber}</Text>
                      </View>
                    )}
                    {analysis.nutritionBreakdown.sugar !== undefined && (
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailValue, { color: colors.foreground }]}>
                          {analysis.nutritionBreakdown.sugar}g
                        </Text>
                        <Text style={[styles.detailLabel, { color: colors.muted }]}>{txt.sugar}</Text>
                      </View>
                    )}
                    {analysis.nutritionBreakdown.sodium !== undefined && (
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailValue, { color: colors.foreground }]}>
                          {analysis.nutritionBreakdown.sodium}mg
                        </Text>
                        <Text style={[styles.detailLabel, { color: colors.muted }]}>{txt.sodium}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInDown.duration(500).delay(600)}
          style={styles.foodsSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{txt.detectedFoods}</Text>
          <View style={[styles.foodsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {analysis.foods.map((food, index) => (
              <View 
                key={index}
                style={[
                  styles.foodItem,
                  index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }
                ]}
              >
                <View style={styles.foodLeft}>
                  <View 
                    style={[
                      styles.confidenceDot,
                      { backgroundColor: food.confidence >= 0.8 ? colors.success : food.confidence >= 0.6 ? colors.warning : colors.muted }
                    ]}
                  />
                  <View style={styles.foodInfo}>
                    <Text style={[styles.foodName, { color: colors.foreground }]}>{food.name}</Text>
                    <Text style={[styles.foodConfidence, { color: colors.muted }]}>
                      {Math.round(food.confidence * 100)}% {txt.confidence}
                    </Text>
                  </View>
                </View>
                {food.calories && (
                  <View style={styles.foodRight}>
                    <Text style={[styles.foodCalories, { color: colors.foreground }]}>~{food.calories}</Text>
                    <Text style={[styles.foodCaloriesUnit, { color: colors.muted }]}>kcal</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(500).delay(700)}
          style={styles.actionsSection}
        >
          <TouchableOpacity
            onPress={handleLogMeal}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.9}
          >
            <IconSymbol name="checkmark.circle.fill" size={22} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>{txt.logMeal}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGetRecipes}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: canAccessRecipes ? colors.surface : colors.primary + "10",
                borderColor: canAccessRecipes ? colors.border : colors.primary + "50",
                borderWidth: canAccessRecipes ? 1 : 1.5,
              }
            ]}
            activeOpacity={0.8}
          >
            <IconSymbol name="sparkles" size={20} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: canAccessRecipes ? colors.foreground : colors.primary }]}>
              {canAccessRecipes ? txt.getRecipes : txt.unlockRecipes}
            </Text>
            {!canAccessRecipes && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleScanAnother}
            style={styles.textButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.textButtonText, { color: colors.muted }]}>{txt.scanAnother}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  mealTypeBadgeContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  mealTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  mealTypeBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  mainCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  caloriesSection: {
    flex: 1,
    justifyContent: "center",
  },
  caloriesLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1,
  },
  caloriesDash: {
    fontSize: 28,
    fontWeight: "400",
    marginHorizontal: 6,
  },
  caloriesUnit: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },
  alignmentSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  feedbackEmoji: {
    fontSize: 20,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 13,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 4,
  },
  progressBarNew: {
    position: "absolute",
    top: 0,
    height: "100%",
    borderRadius: 4,
  },
  progressLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  macrosCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    gap: 4,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  detailItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 12,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  foodsSection: {
    marginBottom: 24,
  },
  foodsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  foodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  confidenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: "500",
  },
  foodConfidence: {
    fontSize: 12,
    marginTop: 2,
  },
  foodRight: {
    alignItems: "flex-end",
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: "600",
  },
  foodCaloriesUnit: {
    fontSize: 11,
    marginTop: 1,
  },
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 4,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
  },
  successContent: {
    alignItems: "center",
    marginBottom: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  successCalories: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 8,
  },
  successHint: {
    fontSize: 14,
    textAlign: "center",
  },
  successButtons: {
    gap: 12,
  },
});
