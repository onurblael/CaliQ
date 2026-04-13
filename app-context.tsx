import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export type Goal = "loss" | "maintenance" | "gain";

export interface Restriction {
  id: string;
  label: string;
  enabled: boolean;
}

export interface MealMacros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealHistory {
  id: string;
  recipeName: string;
  timestamp: number;
  liked: boolean;
  wouldMakeAgain?: boolean;
  calories?: number;
  alignment?: number;
  macros?: MealMacros;
}

export interface DislikedIngredient {
  name: string;
  addedAt: number;
}

export interface LikedIngredient {
  name: string;
  addedAt: number;
  usageCount: number;
}

export interface RecipeRating {
  recipeName: string;
  liked: boolean;
  wouldMakeAgain: boolean;
  ratedAt: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  mealsCount: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: string[];
}

export type DietType = "balanced" | "keto" | "paleo" | "low-carb" | "mediterranean" | "vegetarian" | "vegan";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very-active";

export interface UserPreferences {
  name: string | null;
  age: number | null;
  height: number | null; // Height in cm
  gender: "male" | "female" | null;
  goal: Goal;
  weight: number | null; // Weight in kg
  activityLevel: ActivityLevel;
  dietType: DietType;
  restrictions: Restriction[];
  onboardingComplete: boolean;
  mealHistory: MealHistory[];
  dislikedIngredients: DislikedIngredient[];
  likedIngredients: LikedIngredient[];
  favoriteRecipes: string[];
  neverAgainRecipes: string[];
  recipeRatings: RecipeRating[];
  dailyLogs: DailyLog[];
  // Manual calorie goal settings
  useManualCalories: boolean;
  manualCalorieGoal: number | null; // Manual daily calorie goal (1200-4000 kcal)
  // Notifications
  notificationsEnabled: boolean;
}

const DEFAULT_RESTRICTIONS: Restriction[] = [
  { id: "vegetarian", label: "Vegetariano", enabled: false },
  { id: "vegan", label: "Vegan", enabled: false },
  { id: "gluten-free", label: "Sem Glúten", enabled: false },
  { id: "lactose-free", label: "Sem Lactose", enabled: false },
  { id: "nut-free", label: "Sem Frutos Secos", enabled: false },
  { id: "shellfish-free", label: "Sem Marisco", enabled: false },
  { id: "egg-free", label: "Sem Ovos", enabled: false },
  { id: "soy-free", label: "Sem Soja", enabled: false },
];

const DEFAULT_PREFERENCES: UserPreferences = {
  name: null,
  age: null,
  height: null,
  gender: null,
  goal: "maintenance",
  weight: null,
  activityLevel: "moderate",
  dietType: "balanced",
  restrictions: DEFAULT_RESTRICTIONS,
  onboardingComplete: false,
  mealHistory: [],
  dislikedIngredients: [],
  likedIngredients: [],
  favoriteRecipes: [],
  neverAgainRecipes: [],
  recipeRatings: [],
  dailyLogs: [],
  useManualCalories: false,
  manualCalorieGoal: null,
  notificationsEnabled: false,
};

const STORAGE_KEY = "@truthcalories_preferences";

// Helper to get today's date string
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Context
interface AppContextType {
  preferences: UserPreferences;
  loading: boolean;
  setName: (name: string | null) => void;
  setAge: (age: number | null) => void;
  setHeight: (height: number | null) => void;
  setGender: (gender: "male" | "female" | null) => void;
  setGoal: (goal: Goal) => void;
  setWeight: (weight: number | null) => void;
  setActivityLevel: (level: ActivityLevel) => void;
  setDietType: (dietType: DietType) => void;
  calculateDailyCalories: () => number | null;
  setUseManualCalories: (useManual: boolean) => void;
  setManualCalorieGoal: (calories: number | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleRestriction: (id: string) => void;
  completeOnboarding: () => void;
  addMealToHistory: (recipeName: string, liked: boolean, calories?: number, macros?: MealMacros) => void;
  addDislikedIngredient: (name: string) => void;
  removeDislikedIngredient: (name: string) => void;
  addLikedIngredient: (name: string) => void;
  removeLikedIngredient: (name: string) => void;
  rateRecipe: (recipeName: string, liked: boolean, wouldMakeAgain: boolean) => void;
  getTodayStats: () => { mealsCount: number; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; hasMacroData: boolean };
  getStreak: () => number;
  resetPreferences: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserPreferences;
          // Merge with defaults to handle new fields
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...parsed,
            restrictions: DEFAULT_RESTRICTIONS.map((r) => ({
              ...r,
              enabled: parsed.restrictions?.find((pr) => pr.id === r.id)?.enabled ?? false,
            })),
            likedIngredients: parsed.likedIngredients || [],
            favoriteRecipes: parsed.favoriteRecipes || [],
            neverAgainRecipes: parsed.neverAgainRecipes || [],
            recipeRatings: parsed.recipeRatings || [],
            dailyLogs: parsed.dailyLogs || [],
          });
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback(async (newPrefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }, []);

  const setGoal = useCallback((goal: Goal) => {
    setPreferences((prev) => {
      const updated = { ...prev, goal };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setWeight = useCallback((weight: number | null) => {
    setPreferences((prev) => {
      const updated = { ...prev, weight };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setName = useCallback((name: string | null) => {
    setPreferences((prev) => {
      const updated = { ...prev, name };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setAge = useCallback((age: number | null) => {
    setPreferences((prev) => {
      const updated = { ...prev, age };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setHeight = useCallback((height: number | null) => {
    setPreferences((prev) => {
      const updated = { ...prev, height };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setDietType = useCallback((dietType: DietType) => {
    setPreferences((prev) => {
      const updated = { ...prev, dietType };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const toggleRestriction = useCallback((id: string) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        restrictions: prev.restrictions.map((r) =>
          r.id === id ? { ...r, enabled: !r.enabled } : r
        ),
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const completeOnboarding = useCallback(() => {
    setPreferences((prev) => {
      const updated = { ...prev, onboardingComplete: true };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const addMealToHistory = useCallback((recipeName: string, liked: boolean, calories?: number, macros?: MealMacros) => {
    setPreferences((prev) => {
      const newMeal: MealHistory = {
        id: Date.now().toString(),
        recipeName,
        timestamp: Date.now(),
        liked,
        calories,
        macros,
      };

      // Keep only last 50 meals
      const updatedHistory = [newMeal, ...prev.mealHistory].slice(0, 50);

      // Update daily log
      const today = getTodayString();
      const existingLogIndex = prev.dailyLogs.findIndex(log => log.date === today);
      let updatedLogs = [...prev.dailyLogs];

      if (existingLogIndex >= 0) {
        const existing = updatedLogs[existingLogIndex];
        updatedLogs[existingLogIndex] = {
          ...existing,
          mealsCount: existing.mealsCount + 1,
          totalCalories: existing.totalCalories + (calories || 0),
          totalProtein: (existing.totalProtein || 0) + (macros?.protein || 0),
          totalCarbs: (existing.totalCarbs || 0) + (macros?.carbs || 0),
          totalFat: (existing.totalFat || 0) + (macros?.fat || 0),
          meals: [...existing.meals, recipeName],
        };
      } else {
        updatedLogs = [{
          date: today,
          mealsCount: 1,
          totalCalories: calories || 0,
          totalProtein: macros?.protein || 0,
          totalCarbs: macros?.carbs || 0,
          totalFat: macros?.fat || 0,
          meals: [recipeName],
        }, ...updatedLogs].slice(0, 30); // Keep last 30 days
      }

      const updated = {
        ...prev,
        mealHistory: updatedHistory,
        dailyLogs: updatedLogs,
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const addDislikedIngredient = useCallback((name: string) => {
    setPreferences((prev) => {
      const normalizedName = name.toLowerCase().trim();
      if (prev.dislikedIngredients.some((i) => i.name === normalizedName)) {
        return prev;
      }
      const newIngredient: DislikedIngredient = {
        name: normalizedName,
        addedAt: Date.now(),
      };
      // Also remove from liked if present
      const updated = {
        ...prev,
        dislikedIngredients: [...prev.dislikedIngredients, newIngredient],
        likedIngredients: prev.likedIngredients.filter(i => i.name !== normalizedName),
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const removeDislikedIngredient = useCallback((name: string) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        dislikedIngredients: prev.dislikedIngredients.filter(
          (i) => i.name !== name.toLowerCase().trim()
        ),
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const addLikedIngredient = useCallback((name: string) => {
    setPreferences((prev) => {
      const normalizedName = name.toLowerCase().trim();
      const existingIndex = prev.likedIngredients.findIndex(i => i.name === normalizedName);
      
      let updatedLiked: LikedIngredient[];
      if (existingIndex >= 0) {
        // Increment usage count
        updatedLiked = prev.likedIngredients.map((i, idx) => 
          idx === existingIndex ? { ...i, usageCount: i.usageCount + 1 } : i
        );
      } else {
        // Add new
        updatedLiked = [...prev.likedIngredients, {
          name: normalizedName,
          addedAt: Date.now(),
          usageCount: 1,
        }];
      }
      
      // Also remove from disliked if present
      const updated = {
        ...prev,
        likedIngredients: updatedLiked,
        dislikedIngredients: prev.dislikedIngredients.filter(i => i.name !== normalizedName),
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const removeLikedIngredient = useCallback((name: string) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        likedIngredients: prev.likedIngredients.filter(
          (i) => i.name !== name.toLowerCase().trim()
        ),
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const rateRecipe = useCallback((recipeName: string, liked: boolean, wouldMakeAgain: boolean) => {
    setPreferences((prev) => {
      const normalizedName = recipeName.toLowerCase().trim();
      
      // Update recipe ratings
      const existingRatingIndex = prev.recipeRatings.findIndex(
        r => r.recipeName.toLowerCase() === normalizedName
      );
      
      let updatedRatings = [...prev.recipeRatings];
      const newRating: RecipeRating = {
        recipeName,
        liked,
        wouldMakeAgain,
        ratedAt: Date.now(),
      };
      
      if (existingRatingIndex >= 0) {
        updatedRatings[existingRatingIndex] = newRating;
      } else {
        updatedRatings = [newRating, ...updatedRatings].slice(0, 100);
      }
      
      // Update favorites and never again lists
      let updatedFavorites = [...prev.favoriteRecipes];
      let updatedNeverAgain = [...prev.neverAgainRecipes];
      
      if (liked && wouldMakeAgain) {
        // Add to favorites if not already there
        if (!updatedFavorites.some(f => f.toLowerCase() === normalizedName)) {
          updatedFavorites = [recipeName, ...updatedFavorites].slice(0, 20);
        }
        // Remove from never again
        updatedNeverAgain = updatedNeverAgain.filter(n => n.toLowerCase() !== normalizedName);
      } else if (!liked && !wouldMakeAgain) {
        // Add to never again
        if (!updatedNeverAgain.some(n => n.toLowerCase() === normalizedName)) {
          updatedNeverAgain = [recipeName, ...updatedNeverAgain].slice(0, 50);
        }
        // Remove from favorites
        updatedFavorites = updatedFavorites.filter(f => f.toLowerCase() !== normalizedName);
      }
      
      const updated = {
        ...prev,
        recipeRatings: updatedRatings,
        favoriteRecipes: updatedFavorites,
        neverAgainRecipes: updatedNeverAgain,
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const getTodayStats = useCallback(() => {
    const today = getTodayString();
    const todayLog = preferences.dailyLogs.find(log => log.date === today);
    const totalProtein = todayLog?.totalProtein || 0;
    const totalCarbs = todayLog?.totalCarbs || 0;
    const totalFat = todayLog?.totalFat || 0;
    return {
      mealsCount: todayLog?.mealsCount || 0,
      totalCalories: todayLog?.totalCalories || 0,
      totalProtein,
      totalCarbs,
      totalFat,
      // true apenas quando há pelo menos uma refeição com macros reais registados
      hasMacroData: totalProtein > 0 || totalCarbs > 0 || totalFat > 0,
    };
  }, [preferences.dailyLogs]);

  const getStreak = useCallback((): number => {
    const logs = preferences.dailyLogs;
    if (logs.length === 0) return 0;

    // Build Set of dates with at least 1 logged meal
    const loggedDates = new Set(
      logs.filter(l => l.mealsCount > 0).map(l => l.date)
    );

    const todayStr = getTodayString();
    const cursor = new Date();

    // If today has no meals yet, start counting from yesterday
    // (so the streak doesn't reset mid-day)
    if (!loggedDates.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    let streak = 0;
    while (true) {
      const dateStr = cursor.toISOString().split("T")[0];
      if (loggedDates.has(dateStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [preferences.dailyLogs]);

  const setGender = useCallback((gender: "male" | "female" | null) => {
    setPreferences((prev) => {
      const updated = { ...prev, gender };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setActivityLevel = useCallback((activityLevel: ActivityLevel) => {
    setPreferences((prev) => {
      const updated = { ...prev, activityLevel };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  // Calculate daily calorie needs using Harris-Benedict formula
  const calculateDailyCalories = useCallback((): number | null => {
    const { age, weight, height, gender, activityLevel, goal, useManualCalories, manualCalorieGoal } = preferences;
    
    // If manual mode is enabled and a goal is set, return it
    if (useManualCalories && manualCalorieGoal) {
      return manualCalorieGoal;
    }
    
    // Check if we have all required data for automatic calculation
    if (!age || !weight || !height || !gender) {
      return null;
    }
    
    // Calculate BMR (Basal Metabolic Rate) using Harris-Benedict formula
    let bmr: number;
    if (gender === "male") {
      // Men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      // Women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Apply activity level multiplier
    const activityMultipliers: Record<ActivityLevel, number> = {
      "sedentary": 1.2,      // Little or no exercise
      "light": 1.375,        // Light exercise 1-3 days/week
      "moderate": 1.55,      // Moderate exercise 3-5 days/week
      "active": 1.725,       // Hard exercise 6-7 days/week
      "very-active": 1.9,    // Very hard exercise, physical job
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Adjust based on goal
    let targetCalories = tdee;
    if (goal === "loss") {
      targetCalories = tdee * 0.85; // 15% deficit for weight loss
    } else if (goal === "gain") {
      targetCalories = tdee * 1.15; // 15% surplus for weight gain
    }
    
    return Math.round(targetCalories);
  }, [preferences]);

  const setUseManualCalories = useCallback((useManual: boolean) => {
    setPreferences((prev) => {
      const updated = { ...prev, useManualCalories: useManual };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setManualCalorieGoal = useCallback((calories: number | null) => {
    setPreferences((prev) => {
      // Validate range (1200-4000 kcal)
      const validatedCalories = calories !== null 
        ? Math.max(1200, Math.min(4000, calories))
        : null;
      const updated = { ...prev, manualCalorieGoal: validatedCalories };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setPreferences((prev) => {
      const updated = { ...prev, notificationsEnabled: enabled };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  return (
    <AppContext.Provider
      value={{
        preferences,
        loading,
        setName,
        setAge,
        setHeight,
        setGender,
        setGoal,
        setWeight,
        setActivityLevel,
        setDietType,
        calculateDailyCalories,
        setUseManualCalories,
        setManualCalorieGoal,
        setNotificationsEnabled,
        toggleRestriction,
        completeOnboarding,
        addMealToHistory,
        addDislikedIngredient,
        removeDislikedIngredient,
        addLikedIngredient,
        removeLikedIngredient,
        rateRecipe,
        getTodayStats,
        getStreak,
        resetPreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
