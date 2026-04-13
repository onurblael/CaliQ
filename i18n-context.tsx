import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supported languages
export type Language = "en" | "pt" | "es";

const STORAGE_KEY = "@truthcalories_language";

// Translation keys type
type TranslationKeys = {
  // Common
  common: {
    continue: string;
    cancel: string;
    save: string;
    back: string;
    close: string;
    loading: string;
    error: string;
    success: string;
    retry: string;
    unlimited: string;
    remaining: string;
    today: string;
    free: string;
  };
  // Onboarding
  onboarding: {
    goalTitle: string;
    goalSubtitle: string;
    loseWeight: string;
    loseWeightDesc: string;
    maintainWeight: string;
    maintainWeightDesc: string;
    gainMass: string;
    gainMassDesc: string;
    weightTitle: string;
    weightSubtitle: string;
    weightInfo: string;
    restrictionsTitle: string;
    restrictionsSubtitle: string;
    vegetarian: string;
    vegan: string;
    glutenFree: string;
    lactoseFree: string;
    nutFree: string;
    shellfishFree: string;
    eggFree: string;
    soyFree: string;
    noRestrictions: string;
    skipSetup: string;
    languageTitle: string;
    languageSubtitle: string;
    profileTitle: string;
    profileSubtitle: string;
    name: string;
    namePlaceholder: string;
    age: string;
    height: string;
    optional: string;
    dietTypeTitle: string;
    dietTypeSubtitle: string;
    balanced: string;
    keto: string;
    paleo: string;
    lowCarb: string;
    mediterranean: string;
    privacyTitle: string;
    privacySubtitle: string;
    privacySummary: string;
    privacyAcceptLabel: string;
    privacyReadFull: string;
    privacyGetStarted: string;
  };
  // Home
  home: {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    scanMeal: string;
    scanMealDesc: string;
    scanFridge: string;
    scanFridgeDesc: string;
    exhaustedToday: string;
    getRecipes: string;
    recipes: string;
    recipesDesc: string;
    unlock: string;
    recentMeals: string;
    noMealsYet: string;
    todayProgress: string;
    calories: string;
    alignment: string;
    upgrade: string;
    currentPlan: string;
    mealsLogged: string;
    meal: string;
    meals: string;
    remaining: string;
    complete: string;
    of: string;
    protein: string;
    carbs: string;
    fat: string;
    whatEating: string;
    snapPhoto: string;
    scanMealBtn: string;
    scansRemaining: string;
    unlimited: string;
    left: string;
    aiSuggestions: string;
    scanFirstMeal: string;
    days: string;
    mealTime: {
      breakfast: string;
      morningSnack: string;
      lunch: string;
      afternoonSnack: string;
      dinner: string;
      nightSnack: string;
    };
    streak: string;
    macrosAfterScan: string;
    dailyCalorieGoal: string;
    completeProfile: string;
    completeProfileDesc: string;
  };
  // Camera
  camera: {
    mealTitle: string;
    mealSubtitle: string;
    fridgeTitle: string;
    fridgeSubtitle: string;
    takePhoto: string;
    chooseFromGallery: string;
    analyzing: string;
    analyzingDesc: string;
    preparingAnalysis: string;
    sendingImage: string;
    identifyingFoods: string;
    calculatingCalories: string;
    errorTitle: string;
    tryAgain: string;
    permissionRequired: string;
    analyzeButton: string;
    secondsRemaining: string;
  };
  // Meal Result
  mealResult: {
    title: string;
    calories: string;
    alignment: string;
    alignedWith: string;
    ingredients: string;
    confidence: string;
    logMeal: string;
    scanAnother: string;
    mealLogged: string;
    keepItUp: string;
  };
  // Suggestions
  suggestions: {
    title: string;
    perfectFor: string;
    prepTime: string;
    minutes: string;
    difficulty: string;
    easy: string;
    medium: string;
    hard: string;
    missingIngredients: string;
    selectRecipe: string;
    rateTitle: string;
    liked: string;
    disliked: string;
    willMakeAgain: string;
    neverAgain: string;
    thanksFeedback: string;
    ingredients: string;
    preparation: string;
    detectedFoods: string;
    recipesForYou: string;
    best: string;
    alignmentWithGoal: string;
    basedOnHistory: string;
    backToList: string;
    illEatThis: string;
    dontLikeThis: string;
    whatDontYouLike: string;
    dontLikeIngredient: string;
    takesTooLong: string;
    doesntMatchGoal: string;
    ateRecently: string;
    didYouLikeIt: string;
    helpImprove: string;
    wouldMakeAgain: string;
    helpsKnowSuggest: string;
    greatChoice: string;
    stayOnTrack: string;
    backToHome: string;
    addToShoppingList: string;
    addedToList: string;
    itemsAdded: string;
  };
  // Nutrition
  nutrition: {
    title: string;
    protein: string;
    carbs: string;
    fat: string;
    saturatedFat: string;
    fiber: string;
    sugar: string;
    sodium: string;
    grams: string;
    milligrams: string;
    kcal: string;
  };
  // Settings
  settings: {
    title: string;
    subtitle: string;
    account: string;
    goal: string;
    restrictions: string;
    language: string;
    subscription: string;
    managePlan: string;
    about: string;
    version: string;
    logout: string;
    appearance: string;
    darkMode: string;
    weight: string;
    weightDesc: string;
    gender: string;
    male: string;
    female: string;
    activityLevel: string;
    sedentary: string;
    sedentaryDesc: string;
    light: string;
    lightDesc: string;
    moderate: string;
    moderateDesc: string;
    active: string;
    activeDesc: string;
    veryActive: string;
    veryActiveDesc: string;
    calorieGoal: string;
    manualMode: string;
    manualModeDesc: string;
    autoMode: string;
    completeProfile: string;
    calorieGoalDesc: string;
    dislikedIngredients: string;
    dislikedIngredientsDesc: string;
    reset: string;
    privacyPolicy: string;
    privacyPolicyDesc: string;
    deleteAccount: string;
    deleteAccountDesc: string;
    legalSection: string;
    notifications: string;
    mealReminders: string;
    mealRemindersDesc: string;
  };
  // Upgrade
  upgrade: {
    title: string;
    unlockPotential: string;
    choosePlan: string;
    choosePlanDesc: string;
    monthly: string;
    yearly: string;
    month: string;
    currentPlan: string;
    thisIsYourPlan: string;
    subscribe: string;
    backToFree: string;
    cancelAnytime: string;
    trialBanner: string;
    startTrial: string;
    trustSecure: string;
    trustVerified: string;
    trustRefundable: string;
    mostPopular: string;
    forSerious: string;
    save: string;
    perMonth: string;
    free: string;
    // Plan features
    freePlan: string;
    proPlan: string;
    proPlusPlan: string;
    mealScan: string;
    mealScans: string;
    fridgeScan1x: string;
    fridgeScans: string;
    calorieTracking: string;
    trackingIntervals: string;
    noRecipes: string;
    mealHistory: string;
    goalAlignment: string;
    basicRecipes: string;
    dailyCalorieGoal: string;
    dailyCalorieAdjust: string;
    unlimitedScan: string;
    unlimitedScans: string;
    weeklyPlanning: string;
    optimizedRecipes: string;
    shoppingList: string;
    metabolicConsistency: string;
  };
  // What's New
  whatsNew: {
    title: string;
    subtitle: string;
    update1: {
      title: string;
      description: string;
    };
    update2: {
      title: string;
      description: string;
    };
    update3: {
      title: string;
      description: string;
    };
  };
};

// English translations (default)
const en: TranslationKeys = {
  common: {
    continue: "Continue",
    cancel: "Cancel",
    save: "Save",
    back: "Back",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    retry: "Retry",
    unlimited: "Unlimited",
    remaining: "remaining",
    today: "Today",
    free: "Free",
  },
  onboarding: {
    goalTitle: "What's your goal?",
    goalSubtitle: "We'll personalize suggestions for you",
    loseWeight: "Lose Weight",
    loseWeightDesc: "Lighter and balanced suggestions",
    maintainWeight: "Maintain Weight",
    maintainWeightDesc: "Ideal nutritional balance",
    gainMass: "Gain Mass",
    gainMassDesc: "Higher calorie and protein meals",
    weightTitle: "What's your weight?",
    weightSubtitle: "This helps us calculate your needs",
    weightInfo: "Your weight is used to personalize calorie recommendations. You can update it anytime in settings.",
    restrictionsTitle: "Any dietary restrictions?",
    restrictionsSubtitle: "Select all that apply",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    glutenFree: "Gluten Free",
    lactoseFree: "Lactose Free",
    nutFree: "Nut Free",
    shellfishFree: "Shellfish Free",
    eggFree: "Egg Free",
    soyFree: "Soy Free",
    noRestrictions: "No restrictions",
    skipSetup: "Skip setup",
    languageTitle: "Choose your language",
    languageSubtitle: "You can change this later in settings",
    profileTitle: "Tell us about yourself",
    profileSubtitle: "This helps us personalize your experience",
    name: "Name",
    namePlaceholder: "Your name",
    age: "Age",
    height: "Height",
    optional: "optional",
    dietTypeTitle: "What's your diet style?",
    dietTypeSubtitle: "We'll tailor recipes to your preferences",
    balanced: "Balanced",
    keto: "Keto",
    paleo: "Paleo",
    lowCarb: "Low Carb",
    mediterranean: "Mediterranean",
    privacyTitle: "Privacy & Terms",
    privacySubtitle: "Before you start, please review our privacy policy",
    privacySummary: "CaliQ collects data you provide (weight, goals, dietary restrictions) and photos you choose to scan. This data is used exclusively to personalize your nutrition recommendations. We do not sell your data to third parties. You can request deletion of your account and all data at any time in Settings.",
    privacyAcceptLabel: "I have read and accept the Privacy Policy",
    privacyReadFull: "Read full Privacy Policy",
    privacyGetStarted: "Get Started",
  },
  home: {
    greeting: {
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
    },
    scanMeal: "Scan Meal",
    scanMealDesc: "Analyze your food",
    scanFridge: "Scan Fridge",
    scanFridgeDesc: "Get recipes",
    exhaustedToday: "Exhausted today",
    getRecipes: "Get recipes",
    recipes: "Recipes",
    recipesDesc: "Suggestions for you",
    unlock: "Unlock",
    recentMeals: "Recent Meals",
    noMealsYet: "No meals logged yet",
    todayProgress: "Today's Progress",
    calories: "calories",
    alignment: "Alignment",
    upgrade: "Upgrade",
    currentPlan: "Current Plan",
    mealsLogged: "meals logged",
    meal: "meal",
    meals: "meals",
    remaining: "Remaining",
    complete: "Complete",
    of: "of",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    whatEating: "What are you eating?",
    snapPhoto: "Snap a photo to track calories instantly",
    scanMealBtn: "Scan Meal",
    scansRemaining: "scans remaining today",
    unlimited: "Unlimited",
    left: "left",
    aiSuggestions: "AI suggestions",
    scanFirstMeal: "Scan your first meal to get started",
    days: "days",
    mealTime: {
      breakfast: "Breakfast time",
      morningSnack: "Morning snack",
      lunch: "Lunch time",
      afternoonSnack: "Afternoon snack",
      dinner: "Dinner time",
      nightSnack: "Night snack",
    },
    streak: "day streak",
    macrosAfterScan: "Scan a meal to see your macro breakdown",
    dailyCalorieGoal: "Daily Calorie Goal",
    completeProfile: "Complete Your Profile",
    completeProfileDesc: "Add age, height, weight and gender to see personalized calorie recommendations",
  },
  camera: {
    mealTitle: "Scan your meal",
    mealSubtitle: "Take a photo of your meal to see the calories",
    fridgeTitle: "Scan your fridge",
    fridgeSubtitle: "Show us what you have for recipe suggestions",
    takePhoto: "Take Photo",
    chooseFromGallery: "Choose from Gallery",
    analyzing: "Analyzing...",
    analyzingDesc: "Identifying ingredients",
    preparingAnalysis: "Preparing analysis...",
    sendingImage: "Sending image...",
    identifyingFoods: "Identifying foods...",
    calculatingCalories: "Calculating calories...",
    errorTitle: "Analysis Error",
    tryAgain: "Try Again",
    permissionRequired: "We need permission to access the camera",
    analyzeButton: "Analyze",
    secondsRemaining: "seconds remaining",
  },
  mealResult: {
    title: "Meal Analysis",
    calories: "Calories",
    alignment: "Alignment",
    alignedWith: "Aligned with your goal",
    ingredients: "Detected Ingredients",
    confidence: "confidence",
    logMeal: "Log this meal",
    scanAnother: "Scan another",
    mealLogged: "Meal logged!",
    keepItUp: "Keep making choices like this and you'll stay on track.",
  },
  suggestions: {
    title: "Recipe Suggestions",
    perfectFor: "Perfect for now",
    prepTime: "Prep time",
    minutes: "min",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    missingIngredients: "missing ingredients",
    selectRecipe: "I'll make this",
    rateTitle: "How was it?",
    liked: "Liked it",
    disliked: "Didn't like it",
    willMakeAgain: "Will make again",
    neverAgain: "Never again",
    thanksFeedback: "Thanks for your feedback!",
    ingredients: "Ingredients",
    preparation: "Preparation",
    detectedFoods: "Detected foods",
    recipesForYou: "Recipes for you",
    best: "Best",
    alignmentWithGoal: "Alignment with your goal",
    basedOnHistory: "Based on your history and preferences",
    backToList: "Back",
    illEatThis: "I'll eat this",
    dontLikeThis: "I don't like this",
    whatDontYouLike: "What don't you like?",
    dontLikeIngredient: "Don't like an ingredient",
    takesTooLong: "Takes too long",
    doesntMatchGoal: "Doesn't match my goal",
    ateRecently: "I ate this recently",
    didYouLikeIt: "Did you like the meal?",
    helpImprove: "Your opinion helps us improve suggestions",
    wouldMakeAgain: "Would you make it again?",
    helpsKnowSuggest: "This helps us know if we should suggest again",
    greatChoice: "Great choice!",
    stayOnTrack: "Keep making decisions like this and you'll stay on track.",
    backToHome: "Back to Home",
    addToShoppingList: "Add to Shopping List",
    addedToList: "Added to list!",
    itemsAdded: "ingredients added to shopping list",
  },
  nutrition: {
    title: "Nutrition",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    saturatedFat: "Saturated Fat",
    fiber: "Fiber",
    sugar: "Sugar",
    sodium: "Sodium",
    grams: "g",
    milligrams: "mg",
    kcal: "kcal",
  },
  settings: {
    title: "Settings",
    subtitle: "Personalize your experience",
    account: "Account",
    goal: "Goal",
    restrictions: "Restrictions",
    language: "Language",
    subscription: "Subscription",
    managePlan: "Manage Plan",
    about: "About",
    version: "Version",
    logout: "Logout",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    weight: "Weight",
    weightDesc: "Used to personalize calorie recommendations",
    gender: "Gender",
    male: "Male",
    female: "Female",
    activityLevel: "Activity Level",
    sedentary: "Sedentary",
    sedentaryDesc: "Little or no exercise",
    light: "Light",
    lightDesc: "Light exercise 1-3 days/week",
    moderate: "Moderate",
    moderateDesc: "Moderate exercise 3-5 days/week",
    active: "Active",
    activeDesc: "Hard exercise 6-7 days/week",
    veryActive: "Very Active",
    veryActiveDesc: "Very hard exercise, physical job",
    calorieGoal: "Calorie Goal",
    manualMode: "Manual Mode",
    manualModeDesc: "Set your own daily calorie goal",
    autoMode: "Automatic (TDEE)",
    completeProfile: "Complete profile",
    calorieGoalDesc: "Manual mode overrides automatic calculation. Valid range: 1200-4000 kcal/day.",
    dislikedIngredients: "Disliked Ingredients",
    dislikedIngredientsDesc: "These ingredients are avoided in suggestions. We learn from your choices.",
    reset: "Reset All Data",
    privacyPolicy: "Privacy Policy",
    privacyPolicyDesc: "Read our privacy policy",
    deleteAccount: "Delete Account",
    deleteAccountDesc: "Request deletion of your account and data",
    legalSection: "Legal & Privacy",
    notifications: "Notifications",
    mealReminders: "Meal Reminders",
    mealRemindersDesc: "Lunch (12:30) and dinner (19:30) daily reminders",
  },
  upgrade: {
    title: "Choose your plan",
    unlockPotential: "Unlock full potential",
    choosePlan: "Choose your plan",
    choosePlanDesc: "Choose the ideal plan for your goals",
    monthly: "Monthly",
    yearly: "Yearly",
    month: "month",
    currentPlan: "Current plan",
    thisIsYourPlan: "This is your current plan",
    trialBanner: "7 days free • Cancel anytime",
    startTrial: "Start Free Trial",
    subscribe: "Subscribe",
    backToFree: "Back to Free plan",
    cancelAnytime: "Cancel anytime. No commitment.",
    trustSecure: "Secure",
    trustVerified: "Verified",
    trustRefundable: "Refundable",
    mostPopular:"Most Popular",
    forSerious: "For Serious Users",
    save: "Save",
    perMonth: "/month",
    free: "Free",
    freePlan: "Free",
    proPlan: "Pro",
    proPlusPlan: "Pro+",
    mealScan: "Meal scans",
    mealScans: "Meal scans",
    fridgeScan1x: "Fridge scan (1x/day)",
    fridgeScans: "Fridge scan",
    calorieTracking: "Calorie tracking with ranges",
    trackingIntervals: "Tracking with intervals",
    noRecipes: "No recipe suggestions",
    mealHistory: "Meal history",
    goalAlignment: "Goal alignment",
    basicRecipes: "Basic recipe suggestions",
    dailyCalorieGoal: "Daily calorie goal adjustment",
    dailyCalorieAdjust: "Daily calorie adjustment",
    unlimitedScan: "Unlimited scans",
    unlimitedScans: "Unlimited scans",
    weeklyPlanning: "Weekly meal planning",
    optimizedRecipes: "Time-optimized recipes",
    shoppingList: "Shopping list integration",
    metabolicConsistency: "Metabolic consistency",
  },
  whatsNew: {
    title: "What's New",
    subtitle: "Version {version}",
    update1: {
      title: "Enhanced Security",
      description: "Improved app security and compliance with Google Play Store requirements.",
    },
    update2: {
      title: "Performance Improvements",
      description: "Optimized app performance for faster and smoother experience.",
    },
    update3: {
      title: "Bug Fixes",
      description: "Fixed minor issues to improve overall app stability.",
    },
  },
};

// Portuguese translations
const pt: TranslationKeys = {
  common: {
    continue: "Continuar",
    cancel: "Cancelar",
    save: "Guardar",
    back: "Voltar",
    close: "Fechar",
    loading: "A carregar...",
    error: "Erro",
    success: "Sucesso",
    retry: "Tentar novamente",
    unlimited: "Ilimitado",
    remaining: "restante",
    today: "Hoje",
    free: "Grátis",
  },
  onboarding: {
    goalTitle: "Qual é o teu objetivo?",
    goalSubtitle: "Vamos personalizar as sugestões para ti",
    loseWeight: "Perder Peso",
    loseWeightDesc: "Sugestões mais leves e equilibradas",
    maintainWeight: "Manter Peso",
    maintainWeightDesc: "Equilíbrio nutricional ideal",
    gainMass: "Ganhar Massa",
    gainMassDesc: "Refeições mais calóricas e proteicas",
    weightTitle: "Qual é o teu peso?",
    weightSubtitle: "Isto ajuda-nos a calcular as tuas necessidades",
    weightInfo: "O teu peso é usado para personalizar as recomendações calóricas. Podes atualizá-lo a qualquer momento nas definições.",
    restrictionsTitle: "Tens restrições alimentares?",
    restrictionsSubtitle: "Seleciona todas as que se aplicam",
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    glutenFree: "Sem Glúten",
    lactoseFree: "Sem Lactose",
    nutFree: "Sem Frutos Secos",
    shellfishFree: "Sem Marisco",
    eggFree: "Sem Ovos",
    soyFree: "Sem Soja",
    noRestrictions: "Sem restrições",
    skipSetup: "Saltar configuração",
    languageTitle: "Escolhe o teu idioma",
    languageSubtitle: "Podes alterar mais tarde nas definições",
    profileTitle: "Fala-nos sobre ti",
    profileSubtitle: "Isto ajuda-nos a personalizar a tua experiência",
    name: "Nome",
    namePlaceholder: "O teu nome",
    age: "Idade",
    height: "Altura",
    optional: "opcional",
    dietTypeTitle: "Qual é o teu estilo de dieta?",
    dietTypeSubtitle: "Vamos adaptar as receitas às tuas preferências",
    balanced: "Equilibrada",
    keto: "Keto",
    paleo: "Paleo",
    lowCarb: "Baixo Carboidrato",
    mediterranean: "Mediterrânica",
    privacyTitle: "Privacidade e Termos",
    privacySubtitle: "Antes de começar, revê a nossa política de privacidade",
    privacySummary: "A CaliQ recolhe os dados que forneces (peso, objetivos, restrições alimentares) e as fotos que escolhes analisar. Estes dados são usados exclusivamente para personalizar as tuas recomendações nutricionais. Não vendemos os teus dados a terceiros. Podes solicitar a eliminação da tua conta e de todos os dados a qualquer momento nas Definições.",
    privacyAcceptLabel: "Li e aceito a Política de Privacidade",
    privacyReadFull: "Ler Política de Privacidade completa",
    privacyGetStarted: "Começar",
  },
  home: {
    greeting: {
      morning: "Bom dia",
      afternoon: "Boa tarde",
      evening: "Boa noite",
    },
    scanMeal: "Scan Refeição",
    scanMealDesc: "Analisa a tua comida",
    scanFridge: "Scan Frigorífico",
    scanFridgeDesc: "Obter receitas",
    exhaustedToday: "Esgotado hoje",
    getRecipes: "Obter receitas",
    recipes: "Receitas",
    recipesDesc: "Sugestões para ti",
    unlock: "Desbloquear",
    recentMeals: "Refeições Recentes",
    noMealsYet: "Ainda sem refeições registadas",
    todayProgress: "Progresso de Hoje",
    calories: "calorias",
    alignment: "Alinhamento",
    upgrade: "Upgrade",
    currentPlan: "Plano Atual",
    mealsLogged: "refeições registadas",
    meal: "refeição",
    meals: "refeições",
    remaining: "Restante",
    complete: "Completo",
    of: "de",
    protein: "Proteína",
    carbs: "Hidratos",
    fat: "Gordura",
    whatEating: "O que vais comer?",
    snapPhoto: "Tira uma foto para registar calorias instantaneamente",
    scanMealBtn: "Scan Refeição",
    scansRemaining: "scans restantes hoje",
    unlimited: "Ilimitado",
    left: "restantes",
    aiSuggestions: "Sugestões IA",
    scanFirstMeal: "Faz scan da tua primeira refeição para começar",
    days: "dias",
    mealTime: {
      breakfast: "Hora do pequeno-almoço",
      morningSnack: "Lanche da manhã",
      lunch: "Hora do almoço",
      afternoonSnack: "Lanche da tarde",
      dinner: "Hora do jantar",
      nightSnack: "Ceia",
    },
    streak: "dias seguidos",
    macrosAfterScan: "Faz scan de uma refeição para ver os teus macros",
    dailyCalorieGoal: "Objetivo Calórico Diário",
    completeProfile: "Completa o Teu Perfil",
    completeProfileDesc: "Adiciona idade, altura, peso e sexo para ver recomendações calóricas personalizadas",
  },
  camera: {
    mealTitle: "Fotografa a tua refeição",
    mealSubtitle: "Tira uma foto da tua refeição para ver as calorias",
    fridgeTitle: "Fotografa o teu frigorífico",
    fridgeSubtitle: "Mostra-nos o que tens para sugestões de receitas",
    takePhoto: "Tirar Foto",
    chooseFromGallery: "Escolher da Galeria",
    analyzing: "A analisar...",
    analyzingDesc: "A identificar ingredientes",
    preparingAnalysis: "A preparar análise...",
    sendingImage: "A enviar imagem...",
    identifyingFoods: "A identificar alimentos...",
    calculatingCalories: "A calcular calorias...",
    errorTitle: "Erro na Análise",
    tryAgain: "Tentar Novamente",
    permissionRequired: "Precisamos de permissão para aceder à câmara",
    analyzeButton: "Analisar",
    secondsRemaining: "segundos restantes",
  },
  mealResult: {
    title: "Análise da Refeição",
    calories: "Calorias",
    alignment: "Alinhamento",
    alignedWith: "Alinhado com o teu objetivo",
    ingredients: "Ingredientes Detetados",
    confidence: "confiança",
    logMeal: "Registar esta refeição",
    scanAnother: "Analisar outra",
    mealLogged: "Refeição registada!",
    keepItUp: "Se mantiveres decisões assim, estás dentro do plano.",
  },
  suggestions: {
    title: "Sugestões de Receitas",
    perfectFor: "Perfeita para agora",
    prepTime: "Tempo de preparo",
    minutes: "min",
    difficulty: "Dificuldade",
    easy: "Fácil",
    medium: "Média",
    hard: "Difícil",
    missingIngredients: "ingredientes em falta",
    selectRecipe: "Vou fazer esta",
    rateTitle: "O que achaste?",
    liked: "Gostei",
    disliked: "Não gostei",
    willMakeAgain: "Volto a fazer",
    neverAgain: "Nunca mais",
    thanksFeedback: "Obrigado pelo feedback!",
    ingredients: "Ingredientes",
    preparation: "Preparação",
    detectedFoods: "Alimentos detetados",
    recipesForYou: "Receitas para ti",
    best: "Melhor",
    alignmentWithGoal: "Alinhamento com o teu objetivo",
    basedOnHistory: "Baseado no teu histórico e preferências",
    backToList: "Voltar",
    illEatThis: "Vou comer isto",
    dontLikeThis: "Não gosto disto",
    whatDontYouLike: "O que não te agrada?",
    dontLikeIngredient: "Não gosto de um ingrediente",
    takesTooLong: "Demora muito",
    doesntMatchGoal: "Não combina com o objetivo",
    ateRecently: "Comi isto recentemente",
    didYouLikeIt: "Gostaste da refeição?",
    helpImprove: "A tua opinião ajuda-nos a melhorar as sugestões",
    wouldMakeAgain: "Voltarias a fazer?",
    helpsKnowSuggest: "Isto ajuda-nos a saber se devemos sugerir novamente",
    greatChoice: "Boa escolha!",
    stayOnTrack: "Se mantiveres decisões assim hoje, estás dentro do plano.",
    backToHome: "Voltar ao Início",
    addToShoppingList: "Adicionar à Lista de Compras",
    addedToList: "Adicionado à lista!",
    itemsAdded: "ingredientes adicionados à lista de compras",
  },
  nutrition: {
    title: "Nutrição",
    protein: "Proteína",
    carbs: "Hidratos",
    fat: "Gordura",
    saturatedFat: "Gordura Saturada",
    fiber: "Fibra",
    sugar: "Açúcar",
    sodium: "Sódio",
    grams: "g",
    milligrams: "mg",
    kcal: "kcal",
  },
  settings: {
    title: "Definições",
    subtitle: "Personaliza a tua experiência",
    account: "Conta",
    goal: "Objetivo",
    restrictions: "Restrições",
    language: "Idioma",
    subscription: "Subscrição",
    managePlan: "Gerir Plano",
    about: "Sobre",
    version: "Versão",
    logout: "Terminar Sessão",
    appearance: "Aparência",
    darkMode: "Modo Escuro",
    weight: "Peso",
    weightDesc: "Usado para personalizar recomendações calóricas",    gender: "Sexo",
    male: "Masculino",
    female: "Feminino",
    activityLevel: "Nível de Atividade",
    sedentary: "Sedentário",
    sedentaryDesc: "Pouco ou nenhum exercício",
    light: "Ligeiro",
    lightDesc: "Exercício ligeiro 1-3 dias/semana",
    moderate: "Moderado",
    moderateDesc: "Exercício moderado 3-5 dias/semana",
    active: "Ativo",
    activeDesc: "Exercício intenso 6-7 dias/semana",
    veryActive: "Muito Ativo",
    veryActiveDesc: "Exercício muito intenso, trabalho físico",
    calorieGoal: "Objetivo Calórico",
    manualMode: "Modo Manual",
    manualModeDesc: "Define o teu próprio objetivo calórico diário",
    autoMode: "Automático (TDEE)",
    completeProfile: "Completa o perfil",
    calorieGoalDesc: "O modo manual substitui o cálculo automático. Intervalo válido: 1200-4000 kcal/dia.",
    dislikedIngredients: "Ingredientes Não Gostados",
    dislikedIngredientsDesc: "Estes ingredientes são evitados nas sugestões. Aprendemos com as tuas escolhas.",
    reset: "Repor Todos os Dados",
    privacyPolicy: "Política de Privacidade",
    privacyPolicyDesc: "Leia a nossa política de privacidade",
    deleteAccount: "Eliminar Conta",
    deleteAccountDesc: "Solicitar eliminação da conta e dados",
    legalSection: "Legal e Privacidade",
    notifications: "Notificações",
    mealReminders: "Lembretes de Refeições",
    mealRemindersDesc: "Lembretes diários ao almoço (12:30) e jantar (19:30)",
  },
  upgrade: {
    title: "Escolhe o teu plano",
    unlockPotential: "Desbloqueia todo o potencial",
    choosePlan: "Escolhe o teu plano",
    choosePlanDesc: "Escolhe o plano ideal para os teus objetivos",
    monthly: "Mensal",
    yearly: "Anual",
    month: "mês",
    currentPlan: "Plano atual",
    thisIsYourPlan: "Este é o teu plano atual",
    trialBanner: "7 dias grátis • Cancela quando quiseres",
    startTrial: "Começar Trial Grátis",
    subscribe: "Subscrever",
    backToFree: "Voltar ao plano Grátis",
    cancelAnytime: "Cancela a qualquer momento. Sem compromisso.",
    trustSecure: "Seguro",
    trustVerified: "Verificado",
    trustRefundable: "Reembolsável",
    mostPopular: "Mais Popular",
    forSerious: "Para Utilizadores Sérios",
    save: "Poupa",
    perMonth: "/mês",
    free: "Grátis",
    freePlan: "Free",
    proPlan: "Pro",
    proPlusPlan: "Pro+",
    mealScan: "Scans de refeições",
    mealScans: "Scans de refeições",
    fridgeScan1x: "Scan de frigorífico (1x/dia)",
    fridgeScans: "Scan de frigorífico",
    calorieTracking: "Tracking com intervalos calóricos",
    trackingIntervals: "Tracking com intervalos",
    noRecipes: "Sem sugestões de receitas",
    mealHistory: "Histórico de refeições",
    goalAlignment: "Alinhamento com objetivo",
    basicRecipes: "Sugestões de receitas básicas",
    dailyCalorieGoal: "Ajuste ao objetivo calórico diário",
    dailyCalorieAdjust: "Ajuste ao objetivo calórico diário",
    unlimitedScan: "Scans ilimitados",
    unlimitedScans: "Scans ilimitados",
    weeklyPlanning: "Planeamento semanal automático",
    optimizedRecipes: "Receitas otimizadas por tempo",
    shoppingList: "Integração com lista de compras",
    metabolicConsistency: "Consistência metabólica",
  },
  whatsNew: {
    title: "Novidades",
    subtitle: "Versão {version}",
    update1: {
      title: "Segurança Reforçada",
      description: "Melhorias na segurança da aplicação e conformidade com os requisitos da Google Play Store.",
    },
    update2: {
      title: "Melhorias de Desempenho",
      description: "Desempenho otimizado para uma experiência mais rápida e fluida.",
    },
    update3: {
      title: "Correções de Bugs",
      description: "Corrigidos problemas menores para melhorar a estabilidade geral da aplicação.",
    },
  },
};

// Spanish translations
const es: TranslationKeys = {
  common: {
    continue: "Continuar",
    cancel: "Cancelar",
    save: "Guardar",
    back: "Volver",
    close: "Cerrar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    retry: "Reintentar",
    unlimited: "Ilimitado",
    remaining: "restante",
    today: "Hoy",
    free: "Gratis",
  },
  onboarding: {
    goalTitle: "¿Cuál es tu objetivo?",
    goalSubtitle: "Personalizaremos las sugerencias para ti",
    loseWeight: "Perder Peso",
    loseWeightDesc: "Sugerencias más ligeras y equilibradas",
    maintainWeight: "Mantener Peso",
    maintainWeightDesc: "Equilibrio nutricional ideal",
    gainMass: "Ganar Masa",
    gainMassDesc: "Comidas más calóricas y proteicas",
    weightTitle: "¿Cuál es tu peso?",
    weightSubtitle: "Esto nos ayuda a calcular tus necesidades",
    weightInfo: "Tu peso se usa para personalizar las recomendaciones calóricas. Puedes actualizarlo en cualquier momento en ajustes.",
    restrictionsTitle: "¿Tienes restricciones alimentarias?",
    restrictionsSubtitle: "Selecciona todas las que apliquen",
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    glutenFree: "Sin Gluten",
    lactoseFree: "Sin Lactosa",
    nutFree: "Sin Frutos Secos",
    shellfishFree: "Sin Mariscos",
    eggFree: "Sin Huevos",
    soyFree: "Sin Soja",
    noRestrictions: "Sin restricciones",
    skipSetup: "Saltar configuración",
    languageTitle: "Elige tu idioma",
    languageSubtitle: "Puedes cambiarlo más tarde en ajustes",
    profileTitle: "Cuéntanos sobre ti",
    profileSubtitle: "Esto nos ayuda a personalizar tu experiencia",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    age: "Edad",
    height: "Altura",
    optional: "opcional",
    dietTypeTitle: "¿Cuál es tu estilo de dieta?",
    dietTypeSubtitle: "Adaptaremos las recetas a tus preferencias",
    balanced: "Equilibrada",
    keto: "Keto",
    paleo: "Paleo",
    lowCarb: "Bajo en Carbohidratos",
    mediterranean: "Mediterránea",
    privacyTitle: "Privacidad y Términos",
    privacySubtitle: "Antes de empezar, revisa nuestra política de privacidad",
    privacySummary: "CaliQ recopila los datos que proporcionas (peso, objetivos, restricciones alimentarias) y las fotos que eliges escanear. Estos datos se usan exclusivamente para personalizar tus recomendaciones nutricionales. No vendemos tus datos a terceros. Puedes solicitar la eliminación de tu cuenta y todos los datos en cualquier momento en Ajustes.",
    privacyAcceptLabel: "He leído y acepto la Política de Privacidad",
    privacyReadFull: "Leer Política de Privacidad completa",
    privacyGetStarted: "Empezar",
  },
  home: {
    greeting: {
      morning: "Buenos días",
      afternoon: "Buenas tardes",
      evening: "Buenas noches",
    },
    scanMeal: "Escanear Comida",
    scanMealDesc: "Analiza tu comida",
    scanFridge: "Escanear Nevera",
    scanFridgeDesc: "Obtener recetas",
    exhaustedToday: "Agotado hoy",
    getRecipes: "Obtener recetas",
    recipes: "Recetas",
    recipesDesc: "Sugerencias para ti",
    unlock: "Desbloquear",
    recentMeals: "Comidas Recientes",
    noMealsYet: "Sin comidas registradas aún",
    todayProgress: "Progreso de Hoy",
    calories: "calorías",
    alignment: "Alineación",
    upgrade: "Mejorar",
    currentPlan: "Plan Actual",
    mealsLogged: "comidas registradas",
    meal: "comida",
    meals: "comidas",
    remaining: "Restante",
    complete: "Completo",
    of: "de",
    protein: "Proteína",
    carbs: "Carbohidratos",
    fat: "Grasa",
    whatEating: "¿Qué vas a comer?",
    snapPhoto: "Toma una foto para registrar calorías instantáneamente",
    scanMealBtn: "Escanear Comida",
    scansRemaining: "escaneos restantes hoy",
    unlimited: "Ilimitado",
    left: "restantes",
    aiSuggestions: "Sugerencias IA",
    scanFirstMeal: "Escanea tu primera comida para empezar",
    days: "días",
    mealTime: {
      breakfast: "Hora del desayuno",
      morningSnack: "Merienda de la mañana",
      lunch: "Hora del almuerzo",
      afternoonSnack: "Merienda de la tarde",
      dinner: "Hora de la cena",
      nightSnack: "Cena nocturna",
    },
    streak: "días seguidos",
    macrosAfterScan: "Escanea una comida para ver tus macros",
    dailyCalorieGoal: "Objetivo Calórico Diario",
    completeProfile: "Completa Tu Perfil",
    completeProfileDesc: "Agrega edad, altura, peso y sexo para ver recomendaciones calóricas personalizadas",
  },
  camera: {
    mealTitle: "Fotografía tu comida",
    mealSubtitle: "Toma una foto de tu comida para ver las calorías",
    fridgeTitle: "Fotografía tu nevera",
    fridgeSubtitle: "Muéstranos lo que tienes para sugerencias de recetas",
    takePhoto: "Tomar Foto",
    chooseFromGallery: "Elegir de Galería",
    analyzing: "Analizando...",
    analyzingDesc: "Identificando ingredientes",
    preparingAnalysis: "Preparando análisis...",
    sendingImage: "Enviando imagen...",
    identifyingFoods: "Identificando alimentos...",
    calculatingCalories: "Calculando calorías...",
    errorTitle: "Error en el Análisis",
    tryAgain: "Intentar de Nuevo",
    permissionRequired: "Necesitamos permiso para acceder a la cámara",
    analyzeButton: "Analizar",
    secondsRemaining: "segundos restantes",
  },
  mealResult: {
    title: "Análisis de Comida",
    calories: "Calorías",
    alignment: "Alineación",
    alignedWith: "Alineado con tu objetivo",
    ingredients: "Ingredientes Detectados",
    confidence: "confianza",
    logMeal: "Registrar esta comida",
    scanAnother: "Escanear otra",
    mealLogged: "¡Comida registrada!",
    keepItUp: "Si mantienes decisiones así, estarás dentro del plan.",
  },
  suggestions: {
    title: "Sugerencias de Recetas",
    perfectFor: "Perfecta para ahora",
    prepTime: "Tiempo de preparación",
    minutes: "min",
    difficulty: "Dificultad",
    easy: "Fácil",
    medium: "Media",
    hard: "Difícil",
    missingIngredients: "ingredientes faltantes",
    selectRecipe: "Haré esta",
    rateTitle: "¿Qué te pareció?",
    liked: "Me gustó",
    disliked: "No me gustó",
    willMakeAgain: "La haré de nuevo",
    neverAgain: "Nunca más",
    thanksFeedback: "¡Gracias por tu feedback!",
    ingredients: "Ingredientes",
    preparation: "Preparación",
    detectedFoods: "Alimentos detectados",
    recipesForYou: "Recetas para ti",
    best: "Mejor",
    alignmentWithGoal: "Alineación con tu objetivo",
    basedOnHistory: "Basado en tu historial y preferencias",
    backToList: "Volver",
    illEatThis: "Voy a comer esto",
    dontLikeThis: "No me gusta esto",
    whatDontYouLike: "¿Qué no te gusta?",
    dontLikeIngredient: "No me gusta un ingrediente",
    takesTooLong: "Tarda mucho",
    doesntMatchGoal: "No coincide con mi objetivo",
    ateRecently: "Comí esto recientemente",
    didYouLikeIt: "¿Te gustó la comida?",
    helpImprove: "Tu opinión nos ayuda a mejorar las sugerencias",
    wouldMakeAgain: "¿La harías de nuevo?",
    helpsKnowSuggest: "Esto nos ayuda a saber si debemos sugerir de nuevo",
    greatChoice: "¡Buena elección!",
    stayOnTrack: "Si mantienes decisiones así hoy, estarás dentro del plan.",
    backToHome: "Volver al Inicio",
    addToShoppingList: "Agregar a Lista de Compras",
    addedToList: "¡Agregado a la lista!",
    itemsAdded: "ingredientes agregados a la lista de compras",
  },
  nutrition: {
    title: "Nutrición",
    protein: "Proteína",
    carbs: "Carbohidratos",
    fat: "Grasa",
    saturatedFat: "Grasa Saturada",
    fiber: "Fibra",
    sugar: "Azúcar",
    sodium: "Sodio",
    grams: "g",
    milligrams: "mg",
    kcal: "kcal",
  },
  settings: {
    title: "Configuración",
    subtitle: "Personaliza tu experiencia",
    account: "Cuenta",
    goal: "Objetivo",
    restrictions: "Restricciones",
    language: "Idioma",
    subscription: "Suscripción",
    managePlan: "Gestionar Plan",
    about: "Acerca de",
    version: "Versión",
    logout: "Cerrar Sesión",
    appearance: "Apariencia",
    darkMode: "Modo Oscuro",
    weight: "Peso",
    weightDesc: "Usado para personalizar recomendaciones calóricas",
      gender: "Sexo",
    male: "Masculino",
    female: "Femenino",
    activityLevel: "Nivel de Actividad",
    sedentary: "Sedentario",
    sedentaryDesc: "Poco o ningún ejercicio",
    light: "Ligero",
    lightDesc: "Ejercicio ligero 1-3 días/semana",
    moderate: "Moderado",
    moderateDesc: "Ejercicio moderado 3-5 días/semana",
    active: "Activo",
    activeDesc: "Ejercicio intenso 6-7 días/semana",
    veryActive: "Muy Activo",
    veryActiveDesc: "Ejercicio muy intenso, trabajo físico",
    calorieGoal: "Objetivo Calórico",
    manualMode: "Modo Manual",
    manualModeDesc: "Define tu propio objetivo calórico diario",
    autoMode: "Automático (TDEE)",
    completeProfile: "Completa el perfil",
    calorieGoalDesc: "El modo manual reemplaza el cálculo automático. Rango válido: 1200-4000 kcal/día.",
    dislikedIngredients: "Ingredientes No Gustados",
    dislikedIngredientsDesc: "Estos ingredientes se evitan en las sugerencias. Aprendemos de tus elecciones.",
    reset: "Restablecer Todos los Datos",
    privacyPolicy: "Política de Privacidad",
    privacyPolicyDesc: "Lee nuestra política de privacidad",
    deleteAccount: "Eliminar Cuenta",
    deleteAccountDesc: "Solicitar eliminación de cuenta y datos",
    legalSection: "Legal y Privacidad",
    notifications: "Notificaciones",
    mealReminders: "Recordatorios de Comidas",
    mealRemindersDesc: "Recordatorios diarios al almuerzo (12:30) y cena (19:30)",
  },
  upgrade: {
    title: "Elige tu plan",
    unlockPotential: "Desbloquea todo el potencial",
    choosePlan: "Elige tu plan",
    choosePlanDesc: "Elige el plan ideal para tus objetivos",
    monthly: "Mensual",
    yearly: "Anual",
    month: "mes",
    currentPlan: "Plan actual",
    thisIsYourPlan: "Este es tu plan actual",
    trialBanner: "7 días gratis • Cancela cuando quieras",
    startTrial: "Comenzar Prueba Gratis",
    subscribe: "Suscribirse",
    backToFree: "Volver al plan Gratis",
    cancelAnytime: "Cancela cuando quieras. Sin compromiso.",
    trustSecure: "Seguro",
    trustVerified: "Verificado",
    trustRefundable: "Reembolsable",
    mostPopular: "Más Popular",
    forSerious: "Para Usuarios Serios",
    save: "Ahorra",
    perMonth: "/mes",
    free: "Gratis",
    freePlan: "Free",
    proPlan: "Pro",
    proPlusPlan: "Pro+",
    mealScan: "Escaneos de comidas",
    mealScans: "Escaneos de comidas",
    fridgeScan1x: "Escaneo de nevera (1x/día)",
    fridgeScans: "Escaneo de nevera",
    calorieTracking: "Seguimiento con rangos calóricos",
    trackingIntervals: "Seguimiento con intervalos",
    noRecipes: "Sin sugerencias de recetas",
    mealHistory: "Historial de comidas",
    goalAlignment: "Alineación con objetivo",
    basicRecipes: "Sugerencias de recetas básicas",
    dailyCalorieGoal: "Ajuste al objetivo calórico diario",
    dailyCalorieAdjust: "Ajuste al objetivo calórico diario",
    unlimitedScan: "Escaneos ilimitados",
    unlimitedScans: "Escaneos ilimitados",
    weeklyPlanning: "Planificación semanal automática",
    optimizedRecipes: "Recetas optimizadas por tiempo",
    shoppingList: "Integración con lista de compras",
    metabolicConsistency: "Consistencia metabólica",
  },
  whatsNew: {
    title: "Novedades",
    subtitle: "Versión {version}",
    update1: {
      title: "Seguridad Mejorada",
      description: "Mejoras en la seguridad de la aplicación y cumplimiento con los requisitos de Google Play Store.",
    },
    update2: {
      title: "Mejoras de Rendimiento",
      description: "Rendimiento optimizado para una experiencia más rápida y fluida.",
    },
    update3: {
      title: "Correcciones de Errores",
      description: "Corregidos problemas menores para mejorar la estabilidad general de la aplicación.",
    },
  },
};

const translations: Record<Language, TranslationKeys> = { en, pt, es };

// Language names for display
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

// Context type
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [loading, setLoading] = useState(true);

  // Load saved language
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved === "en" || saved === "pt" || saved === "es")) {
          setLanguageState(saved as Language);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLanguage();
  }, []);

  // Set language and save
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  }, []);

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
