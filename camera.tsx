import { useState, useRef, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from "react-native-reanimated";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/lib/app-context";
import { useSubscription } from "@/lib/subscription-context";
import { useI18n } from "@/lib/i18n-context";

type ScanMode = "meal" | "fridge";

interface DetectedFood {
  name: string;
  confidence: number;
  calories?: number;
  category?: string;
}

interface RecipeSuggestion {
  id: string;
  name: string;
  calorieRange: { min: number; max: number };
  alignmentPercent: number;
  prepTimeMinutes: number;
  ingredients: string[];
  missingIngredients: string[];
  instructions: string[];
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
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
  };
}

interface FridgeAnalysis {
  detectedFoods: DetectedFood[];
  suggestions: RecipeSuggestion[];
  currentIndex: number;
  profileMatch?: {
    goalAlignment: number;
    restrictionsRespected: boolean;
    basedOnHistory: boolean;
  };
}

const MAX_ANALYSIS_TIME = 30;

export default function CameraScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { preferences, getTodayStats } = useApp();
  const { incrementMealScan, incrementFridgeScan, canAccessRecipes } = useSubscription();
  const { language, t } = useI18n();
  
  const mode: ScanMode = (params.mode as ScanMode) || "meal";
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(MAX_ANALYSIS_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef(false);
  
  // Animation for scanning effect
  const scanAnimation = useSharedValue(0);
  
  useEffect(() => {
    if (analyzing) {
      scanAnimation.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );
    } else {
      scanAnimation.value = 0;
    }
  }, [analyzing]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanAnimation.value * 260 }],
    opacity: 0.8,
  }));

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Meal analysis mutation
  const mealMutation = trpc.meals.analyzeMeal.useMutation({
    onSuccess: (data: MealAnalysis) => {
      if (abortRef.current) return;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setAnalyzing(false);
      setProgress("");
      incrementMealScan();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.replace({
        pathname: "/meal-result",
        params: { analysisData: JSON.stringify(data) },
      });
    },
    onError: (err) => {
      if (abortRef.current) return;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setAnalyzing(false);
      setProgress("");
      
      const errorMessage = err.message || t.camera.errorTitle;
      setError(errorMessage);
      console.error("Meal analysis error:", err);
    },
  });

  // Fridge analysis mutation (for recipes)
  const fridgeMutation = trpc.meals.analyze.useMutation({
    onSuccess: (data: FridgeAnalysis) => {
      if (abortRef.current) return;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setAnalyzing(false);
      setProgress("");
      incrementFridgeScan();
      
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.replace({
        pathname: "/suggestion",
        params: { suggestionData: JSON.stringify(data) },
      });
    },
    onError: (err) => {
      if (abortRef.current) return;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setAnalyzing(false);
      setProgress("");
      
      const errorMessage = err.message || t.camera.errorTitle;
      setError(errorMessage);
      console.error("Fridge analysis error:", err);
    },
  });

  const handleTakePhoto = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError(t.camera.permissionRequired);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
      setError(null);
    }
  };

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError("Por favor, seleciona uma imagem primeiro");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setAnalyzing(true);
    setError(null);
    setProgress(t.camera.preparingAnalysis);
    setTimeLeft(MAX_ANALYSIS_TIME);
    abortRef.current = false;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        
        const newTime = prev - 1;
        if (newTime > 20) {
          setProgress(t.camera.sendingImage);
        } else if (newTime > 10) {
          setProgress(t.camera.identifyingFoods);
        } else {
          setProgress(t.camera.calculatingCalories);
        }
        return newTime;
      });
    }, 1000);

    const todayStats = getTodayStats();
    const hour = new Date().getHours();

    if (mode === "meal") {
      mealMutation.mutate({
        imageBase64,
        goal: preferences.goal,
        restrictions: preferences.restrictions.filter((r) => r.enabled).map((r) => r.label),
        dietType: preferences.dietType,
        todayCalories: todayStats.totalCalories,
        timeOfDay: hour,
        language: language,
      });
    } else {
      const getTimeOfDay = (h: number): "morning" | "afternoon" | "evening" | "night" => {
        if (h >= 6 && h < 12) return "morning";
        if (h >= 12 && h < 17) return "afternoon";
        if (h >= 17 && h < 21) return "evening";
        return "night";
      };
      
      fridgeMutation.mutate({
        imageBase64,
        goal: preferences.goal,
        restrictions: preferences.restrictions.filter((r) => r.enabled).map((r) => r.label),
        dietType: preferences.dietType,
        dislikedIngredients: preferences.dislikedIngredients.map((d) => d.name),
        likedIngredients: preferences.likedIngredients.map((l) => l.name),
        recentMeals: preferences.mealHistory.slice(-5).map((m) => m.recipeName),
        favoriteRecipes: preferences.favoriteRecipes || [],
        neverAgainRecipes: preferences.neverAgainRecipes || [],
        mealsEatenToday: todayStats.mealsCount,
        caloriesConsumedToday: todayStats.totalCalories,
        timeOfDay: getTimeOfDay(hour),
        language: language,
        // TDEE personalization data
        age: preferences.age ?? undefined,
        weight: preferences.weight ?? undefined,
        height: preferences.height ?? undefined,
        gender: preferences.gender ?? undefined,
        activityLevel: preferences.activityLevel ?? undefined,
      });
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setAnalyzing(false);
    setProgress("");
    router.back();
  };

  const handleRetry = () => {
    setError(null);
    setImageUri(null);
    setImageBase64(null);
  };

  const getTitle = () => {
    if (mode === "meal") {
      return t.camera.mealTitle;
    }
    return t.camera.fridgeTitle;
  };

  const getSubtitle = () => {
    if (mode === "meal") {
      return t.camera.mealSubtitle;
    }
    return t.camera.fridgeSubtitle;
  };

  const progressPercent = ((MAX_ANALYSIS_TIME - timeLeft) / MAX_ANALYSIS_TIME) * 100;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4">
      {/* Premium Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <TouchableOpacity 
          onPress={handleCancel} 
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <IconSymbol name="xmark" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{getTitle()}</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {analyzing ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.analyzingContainer}>
            {/* Image with scanning effect */}
            <View style={[styles.scanContainer, { borderColor: colors.primary }]}>
              {imageUri && (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.scanImage}
                  contentFit="cover"
                />
              )}
              <Animated.View 
                style={[
                  styles.scanLine,
                  scanLineStyle,
                  { backgroundColor: colors.primary }
                ]} 
              />
              <View style={[styles.scanCorner, styles.scanCornerTL, { borderColor: colors.primary }]} />
              <View style={[styles.scanCorner, styles.scanCornerTR, { borderColor: colors.primary }]} />
              <View style={[styles.scanCorner, styles.scanCornerBL, { borderColor: colors.primary }]} />
              <View style={[styles.scanCorner, styles.scanCornerBR, { borderColor: colors.primary }]} />
            </View>
            
            {/* Progress info */}
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: colors.foreground }]}>{progress}</Text>
              <Text style={[styles.timeText, { color: colors.muted }]}>
                {timeLeft > 0 ? `~${timeLeft} ${t.camera.secondsRemaining}` : t.camera.analyzing}
              </Text>
            </View>
            
            {/* Progress bar */}
            <View style={[styles.progressBarContainer, { backgroundColor: colors.surface }]}>
              <View 
                style={[
                  styles.progressBarFill,
                  { backgroundColor: colors.primary, width: `${progressPercent}%` }
                ]}
              />
            </View>
            
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.cancelButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.muted }]}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : imageUri ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.previewContainer}>
            <View style={[styles.imagePreview, { borderColor: colors.border }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                contentFit="cover"
              />
            </View>
            
            {error && (
              <View style={[styles.errorCard, { backgroundColor: colors.error + "15" }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleAnalyze}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.9}
              >
                <IconSymbol name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t.camera.analyzeButton}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRetry}
                style={styles.textButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.textButtonText, { color: colors.muted }]}>{t.camera.chooseFromGallery}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
            <View style={[styles.emptyPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol 
                  name={mode === "meal" ? "fork.knife" : "refrigerator.fill"} 
                  size={48} 
                  color={colors.primary} 
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {mode === "meal" ? t.camera.mealTitle : t.camera.fridgeTitle}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>{getSubtitle()}</Text>
            </View>
            
            {error && (
              <View style={[styles.errorCard, { backgroundColor: colors.error + "15" }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}
            
            <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.9}
              >
                <IconSymbol name="camera.fill" size={22} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t.camera.takePhoto}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handlePickImage}
                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <IconSymbol name="photo.fill" size={22} color={colors.foreground} />
                <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>{t.camera.chooseFromGallery}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingContainer: {
    alignItems: "center",
    width: "100%",
  },
  scanContainer: {
    width: 280,
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 3,
  },
  scanImage: {
    width: "100%",
    height: "100%",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    top: 10,
  },
  scanCorner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderWidth: 3,
  },
  scanCornerTL: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  progressInfo: {
    alignItems: "center",
    marginTop: 24,
  },
  progressText: {
    fontSize: 17,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 14,
    marginTop: 4,
  },
  progressBarContainer: {
    width: 240,
    height: 6,
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  previewContainer: {
    alignItems: "center",
    width: "100%",
  },
  imagePreview: {
    width: 280,
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtons: {
    width: "100%",
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
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
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    width: "100%",
  },
  emptyPreview: {
    width: 280,
    height: 280,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 20,
  },
});
