import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Switch, StyleSheet, TextInput, Platform, Linking, Alert } from "react-native";
import Constants from "expo-constants";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useApp, Goal, ActivityLevel, DietType } from "@/lib/app-context";
import { useI18n, Language } from "@/lib/i18n-context";
import { useThemeContext } from "@/lib/theme-provider";
import { useSubscription } from "@/lib/subscription-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { requestNotificationPermissions, scheduleMealReminders, cancelMealReminders } from "@/lib/notifications";

const DIET_TYPE_OPTIONS: { value: DietType; emoji: string }[] = [
  { value: "balanced", emoji: "⚖️" },
  { value: "keto", emoji: "🥑" },
  { value: "paleo", emoji: "🍖" },
  { value: "low-carb", emoji: "🥗" },
  { value: "mediterranean", emoji: "🫒" },
  { value: "vegetarian", emoji: "🥬" },
  { value: "vegan", emoji: "🌱" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, language, setLanguage } = useI18n();
  const { preferences, setGoal, setWeight, setAge, setHeight, setGender, setActivityLevel, setDietType, toggleRestriction, resetPreferences, setUseManualCalories, setManualCalorieGoal, calculateDailyCalories, setNotificationsEnabled } = useApp();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { currentPlan } = useSubscription();
  const [weightInput, setWeightInput] = useState(preferences.weight?.toString() || "");
  const [ageInput, setAgeInput] = useState(preferences.age?.toString() || "");
  const [heightInput, setHeightInput] = useState(preferences.height?.toString() || "");
  const [manualCaloriesInput, setManualCaloriesInput] = useState(preferences.manualCalorieGoal?.toString() || "");

  const GOAL_OPTIONS: { value: Goal; label: string; description: string; icon: string }[] = [
    { value: "loss", label: t.onboarding.loseWeight, description: t.onboarding.loseWeightDesc, icon: "📉" },
    { value: "maintenance", label: t.onboarding.maintainWeight, description: t.onboarding.maintainWeightDesc, icon: "⚖️" },
    { value: "gain", label: t.onboarding.gainMass, description: t.onboarding.gainMassDesc, icon: "💪" },
  ];

  const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
    { value: "en", label: "English", flag: "🇬🇧" },
    { value: "pt", label: "Português", flag: "🇵🇹" },
    { value: "es", label: "Español", flag: "🇪🇸" },
  ];

  const handleGoalSelect = (goal: Goal) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setGoal(goal);
  };

  const handleRestrictionToggle = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleRestriction(id);
  };

  const handleLanguageSelect = (lang: Language) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLanguage(lang);
  };

  const handleDarkModeToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const handleWeightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 1) return;
    setWeightInput(cleaned);
  };

  const handleWeightBlur = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      setWeight(weight);
    }
  };

  const handleAgeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setAgeInput(cleaned);
  };

  const handleAgeBlur = () => {
    const age = parseInt(ageInput);
    if (!isNaN(age) && age >= 10 && age <= 120) {
      setAge(age);
    }
  };

  const handleHeightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setHeightInput(cleaned);
  };

  const handleHeightBlur = () => {
    const height = parseInt(heightInput);
    if (!isNaN(height) && height >= 100 && height <= 250) {
      setHeight(height);
    }
  };

  const handleDietTypeSelect = (dietType: DietType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDietType(dietType);
  };

  const handleManageSubscription = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL("https://play.google.com/store/account/subscriptions");
  };

  const getDietTypeLabel = (dietType: DietType): string => {
    switch (dietType) {
      case "balanced": return t.onboarding.balanced ?? "Equilibrada";
      case "keto": return t.onboarding.keto ?? "Keto";
      case "paleo": return t.onboarding.paleo ?? "Paleo";
      case "low-carb": return t.onboarding.lowCarb ?? "Low Carb";
      case "mediterranean": return t.onboarding.mediterranean ?? "Mediterrânica";
      case "vegetarian": return t.onboarding.vegetarian ?? "Vegetariana";
      case "vegan": return t.onboarding.vegan ?? "Vegan";
    }
  };

  const handleManualCaloriesToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setUseManualCalories(!preferences.useManualCalories);
  };

  const handleManualCaloriesChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setManualCaloriesInput(cleaned);
  };

  const handleManualCaloriesBlur = () => {
    const calories = parseInt(manualCaloriesInput);
    if (!isNaN(calories) && calories >= 1200 && calories <= 4000) {
      setManualCalorieGoal(calories);
    } else if (!isNaN(calories)) {
      // Clamp to valid range
      const clamped = Math.max(1200, Math.min(4000, calories));
      setManualCalorieGoal(clamped);
      setManualCaloriesInput(clamped.toString());
    }
  };

  const handleNotificationsToggle = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (preferences.notificationsEnabled) {
      setNotificationsEnabled(false);
      await cancelMealReminders();
    } else {
      const granted = await requestNotificationPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        await scheduleMealReminders(language);
      } else {
        Alert.alert(
          language === "pt" ? "Permissão Necessária" : language === "es" ? "Permiso Necesario" : "Permission Required",
          language === "pt"
            ? "Ativa as notificações nas Definições do sistema para receber lembretes de refeições."
            : language === "es"
            ? "Activa las notificaciones en los Ajustes del sistema para recibir recordatorios."
            : "Enable notifications in System Settings to receive meal reminders.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const handleUpgrade = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/upgrade");
  };

  const handleOpenLink = (url: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(url);
  };

  const getRestrictionLabel = (id: string) => {
    switch (id) {
      case "vegetarian": return t.onboarding.vegetarian;
      case "vegan": return t.onboarding.vegan;
      case "gluten-free": return t.onboarding.glutenFree;
      case "lactose-free": return t.onboarding.lactoseFree;
      case "nut-free": return t.onboarding.nutFree;
      case "shellfish-free": return t.onboarding.shellfishFree;
      case "egg-free": return t.onboarding.eggFree;
      case "soy-free": return t.onboarding.soyFree;
      default: return id;
    }
  };

  const getRestrictionIcon = (id: string) => {
    switch (id) {
      case "vegetarian": return "🥬";
      case "vegan": return "🌱";
      case "gluten-free": return "🌾";
      case "lactose-free": return "🥛";
      case "nut-free": return "🥜";
      case "shellfish-free": return "🦐";
      case "egg-free": return "🥚";
      case "soy-free": return "🫘";
      default: return "🍽️";
    }
  };

  return (
    <ScreenContainer className="px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Premium Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{t.settings.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {t.settings.subtitle}
          </Text>
        </Animated.View>

        {/* Subscription Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity
            onPress={handleUpgrade}
            style={[
              styles.subscriptionCard,
              { 
                backgroundColor: currentPlan.id === "free" ? colors.surface : colors.primary + "10",
                borderColor: currentPlan.id === "free" ? colors.border : colors.primary + "30",
              }
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.subscriptionLeft}>
              <View style={[
                styles.subscriptionIcon,
                { backgroundColor: currentPlan.id === "free" ? colors.muted + "20" : colors.primary + "20" }
              ]}>
                <Text style={styles.subscriptionEmoji}>
                  {currentPlan.id === "free" ? "⭐" : currentPlan.id === "pro" ? "🌟" : "💎"}
                </Text>
              </View>
              <View>
                <Text style={[styles.subscriptionName, { color: colors.foreground }]}>{currentPlan.name}</Text>
                <Text style={[styles.subscriptionDesc, { color: colors.muted }]}>
                  {currentPlan.id === "free"
                    ? (language === "pt" ? "Faz upgrade para mais funcionalidades" : language === "es" ? "Actualiza para más funciones" : "Upgrade for more features")
                    : (language === "pt" ? "Subscrição ativa" : language === "es" ? "Suscripción activa" : "Active subscription")}
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.muted} />
          </TouchableOpacity>

          {currentPlan.id !== "free" && (
            <TouchableOpacity
              onPress={handleManageSubscription}
              style={[styles.manageSubButton, { borderTopColor: colors.border }]}
              activeOpacity={0.7}
            >
              <IconSymbol name="creditcard.fill" size={15} color={colors.primary} />
              <Text style={[styles.manageSubText, { color: colors.primary }]}>
                {language === "pt" ? "Gerir Subscrição no Google Play" : language === "es" ? "Gestionar Suscripción en Google Play" : "Manage Subscription on Google Play"}
              </Text>
              <IconSymbol name="arrow.up.right" size={13} color={colors.primary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + "15" }]}>
              <IconSymbol name="moon.fill" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.appearance}</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[
                  styles.settingIcon,
                  { backgroundColor: colorScheme === "dark" ? colors.primary + "15" : colors.warning + "15" }
                ]}>
                  <IconSymbol 
                    name={colorScheme === "dark" ? "moon.fill" : "sun.max.fill"} 
                    size={18} 
                    color={colorScheme === "dark" ? colors.primary : colors.warning} 
                  />
                </View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{t.settings.darkMode}</Text>
              </View>
              <Switch
                value={colorScheme === "dark"}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Language Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartBlue + "15" }]}>
              <IconSymbol name="globe" size={18} color={colors.chartBlue} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.language}</Text>
          </View>
          
          <View style={styles.languageGrid}>
            {LANGUAGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleLanguageSelect(option.value)}
                style={[
                  styles.languageCard,
                  {
                    backgroundColor: language === option.value ? colors.primary + "10" : colors.surface,
                    borderColor: language === option.value ? colors.primary : colors.border,
                    borderWidth: language === option.value ? 2 : 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.languageFlag}>{option.flag}</Text>
                <Text 
                  style={[
                    styles.languageLabel,
                    { color: language === option.value ? colors.primary : colors.foreground }
                  ]}
                >
                  {option.label}
                </Text>
                {language === option.value && (
                  <View style={[styles.languageCheck, { backgroundColor: colors.primary }]}>
                    <IconSymbol name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Weight Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartOrange + "15" }]}>
              <IconSymbol name="scalemass.fill" size={18} color={colors.chartOrange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.weight}</Text>
          </View>
          
          <View style={[styles.weightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              value={weightInput}
              onChangeText={handleWeightChange}
              onBlur={handleWeightBlur}
              placeholder="70"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              returnKeyType="done"
              style={[styles.weightInput, { color: colors.foreground }]}
              maxLength={5}
            />
            <Text style={[styles.weightUnit, { color: colors.muted }]}>kg</Text>
          </View>
          <Text style={[styles.weightHint, { color: colors.muted }]}>{t.settings.weightDesc}</Text>
        </Animated.View>

        {/* Age Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(420)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartBlue + "15" }]}>
              <IconSymbol name="calendar" size={18} color={colors.chartBlue} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {language === "pt" ? "Idade" : language === "es" ? "Edad" : "Age"}
            </Text>
          </View>
          <View style={[styles.weightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              value={ageInput}
              onChangeText={handleAgeChange}
              onBlur={handleAgeBlur}
              placeholder="30"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              returnKeyType="done"
              style={[styles.weightInput, { color: colors.foreground }]}
              maxLength={3}
            />
            <Text style={[styles.weightUnit, { color: colors.muted }]}>
              {language === "pt" ? "anos" : language === "es" ? "años" : "years"}
            </Text>
          </View>
        </Animated.View>

        {/* Height Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(435)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.success + "15" }]}>
              <IconSymbol name="ruler.fill" size={18} color={colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {language === "pt" ? "Altura" : language === "es" ? "Altura" : "Height"}
            </Text>
          </View>
          <View style={[styles.weightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              value={heightInput}
              onChangeText={handleHeightChange}
              onBlur={handleHeightBlur}
              placeholder="170"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              returnKeyType="done"
              style={[styles.weightInput, { color: colors.foreground }]}
              maxLength={3}
            />
            <Text style={[styles.weightUnit, { color: colors.muted }]}>cm</Text>
          </View>
        </Animated.View>

        {/* Gender Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(450)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartPurple + "15" }]}>
              <IconSymbol name="person.fill" size={18} color={colors.chartPurple} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.gender}</Text>
          </View>
          
          <View style={styles.goalList}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setGender("male");
              }}
              style={[
                styles.goalCard,
                { backgroundColor: preferences.gender === "male" ? colors.primary + "15" : colors.surface, borderColor: preferences.gender === "male" ? colors.primary : colors.border, borderWidth: 1.5 }
              ]}
            >
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: colors.chartBlue + "15" }]}>
                  <Text style={styles.goalEmoji}>♂</Text>
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalLabel, { color: colors.foreground }]}>{t.settings.male}</Text>
                </View>
              </View>
              {preferences.gender === "male" && (
                <View style={[styles.goalCheck, { backgroundColor: colors.primary }]}>
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setGender("female");
              }}
              style={[
                styles.goalCard,
                { backgroundColor: preferences.gender === "female" ? colors.primary + "15" : colors.surface, borderColor: preferences.gender === "female" ? colors.primary : colors.border, borderWidth: 1.5 }
              ]}
            >
              <View style={styles.goalLeft}>
                <View style={[styles.goalIcon, { backgroundColor: colors.error + "15" }]}>
                  <Text style={styles.goalEmoji}>♀</Text>
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalLabel, { color: colors.foreground }]}>{t.settings.female}</Text>
                </View>
              </View>
              {preferences.gender === "female" && (
                <View style={[styles.goalCheck, { backgroundColor: colors.primary }]}>
                  <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Activity Level Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(475)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.success + "15" }]}>
              <IconSymbol name="figure.run" size={18} color={colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.activityLevel}</Text>
          </View>
          
          <View style={styles.goalList}>
            {[
              { value: "sedentary" as ActivityLevel, label: t.settings.sedentary, desc: t.settings.sedentaryDesc, emoji: "🪑" },
              { value: "light" as ActivityLevel, label: t.settings.light, desc: t.settings.lightDesc, emoji: "🚶" },
              { value: "moderate" as ActivityLevel, label: t.settings.moderate, desc: t.settings.moderateDesc, emoji: "🏃" },
              { value: "active" as ActivityLevel, label: t.settings.active, desc: t.settings.activeDesc, emoji: "💪" },
              { value: "very-active" as ActivityLevel, label: t.settings.veryActive, desc: t.settings.veryActiveDesc, emoji: "🏋️" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActivityLevel(option.value);
                }}
                style={[
                  styles.goalCard,
                  { backgroundColor: preferences.activityLevel === option.value ? colors.primary + "15" : colors.surface, borderColor: preferences.activityLevel === option.value ? colors.primary : colors.border, borderWidth: 1.5 }
                ]}
              >
                <View style={styles.goalLeft}>
                  <View style={[styles.goalIcon, { backgroundColor: colors.success + "15" }]}>
                    <Text style={styles.goalEmoji}>{option.emoji}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalLabel, { color: colors.foreground }]}>{option.label}</Text>
                    <Text style={[styles.goalDesc, { color: colors.muted }]}>{option.desc}</Text>
                  </View>
                </View>
                {preferences.activityLevel === option.value && (
                  <View style={[styles.goalCheck, { backgroundColor: colors.primary }]}>
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Manual Calorie Goal Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(490)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.warning + "15" }]}>
              <IconSymbol name="flame.fill" size={18} color={colors.warning} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.calorieGoal}</Text>
          </View>
          
          <View style={[styles.manualCaloriesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.manualCaloriesHeader}>
              <View>
                <Text style={[styles.manualCaloriesTitle, { color: colors.foreground }]}>{t.settings.manualMode}</Text>
                <Text style={[styles.manualCaloriesDesc, { color: colors.muted }]}>{t.settings.manualModeDesc}</Text>
              </View>
              <Switch
                value={preferences.useManualCalories}
                onValueChange={handleManualCaloriesToggle}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={preferences.useManualCalories ? colors.primary : colors.muted}
              />
            </View>
            
            {preferences.useManualCalories && (
              <View style={styles.manualCaloriesInput}>
                <TextInput
                  value={manualCaloriesInput}
                  onChangeText={handleManualCaloriesChange}
                  onBlur={handleManualCaloriesBlur}
                  placeholder="2000"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  style={[styles.caloriesInput, { color: colors.foreground }]}
                  maxLength={4}
                />
                <Text style={[styles.caloriesUnit, { color: colors.muted }]}>kcal/dia</Text>
              </View>
            )}
            
            {!preferences.useManualCalories && (
              <View style={styles.autoCaloriesInfo}>
                <Text style={[styles.autoCaloriesLabel, { color: colors.muted }]}>{t.settings.autoMode}</Text>
                <Text style={[styles.autoCaloriesValue, { color: colors.primary }]}>
                  {calculateDailyCalories() ? `${calculateDailyCalories()} kcal/dia` : t.settings.completeProfile}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.caloriesHint, { color: colors.muted }]}>{t.settings.calorieGoalDesc}</Text>
        </Animated.View>

        {/* Goal Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.success + "15" }]}>
              <IconSymbol name="target" size={18} color={colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.goal}</Text>
          </View>
          
          <View style={styles.goalList}>
            {GOAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleGoalSelect(option.value)}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: preferences.goal === option.value ? colors.primary : colors.border,
                    borderWidth: preferences.goal === option.value ? 2 : 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.goalLeft}>
                  <View style={[styles.goalIcon, { backgroundColor: colors.primary + "10" }]}>
                    <Text style={styles.goalEmoji}>{option.icon}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalLabel, { color: colors.foreground }]}>{option.label}</Text>
                    <Text style={[styles.goalDesc, { color: colors.muted }]}>{option.description}</Text>
                  </View>
                </View>
                {preferences.goal === option.value && (
                  <View style={[styles.goalCheck, { backgroundColor: colors.primary }]}>
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Diet Type Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(560)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.success + "15" }]}>
              <IconSymbol name="fork.knife" size={18} color={colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t.onboarding.dietTypeTitle ?? (language === "pt" ? "Tipo de Dieta" : language === "es" ? "Tipo de Dieta" : "Diet Style")}
            </Text>
          </View>
          <View style={styles.dietTypeGrid}>
            {DIET_TYPE_OPTIONS.map((option) => {
              const isSelected = preferences.dietType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleDietTypeSelect(option.value)}
                  style={[
                    styles.dietTypeCard,
                    {
                      backgroundColor: isSelected ? colors.primary + "12" : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dietTypeEmoji}>{option.emoji}</Text>
                  <Text style={[styles.dietTypeLabel, { color: isSelected ? colors.primary : colors.foreground }]}>
                    {getDietTypeLabel(option.value)}
                  </Text>
                  {isSelected && (
                    <View style={[styles.dietTypeCheck, { backgroundColor: colors.primary }]}>
                      <IconSymbol name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Restrictions Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartPurple + "15" }]}>
              <IconSymbol name="leaf.fill" size={18} color={colors.chartPurple} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.restrictions}</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {preferences.restrictions.map((restriction, index) => (
              <View
                key={restriction.id}
                style={[
                  styles.restrictionRow,
                  index < preferences.restrictions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}
              >
                <View style={styles.restrictionLeft}>
                  <Text style={styles.restrictionEmoji}>{getRestrictionIcon(restriction.id)}</Text>
                  <Text style={[styles.restrictionLabel, { color: colors.foreground }]}>
                    {getRestrictionLabel(restriction.id)}
                  </Text>
                </View>
                <Switch
                  value={restriction.enabled}
                  onValueChange={() => handleRestrictionToggle(restriction.id)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Disliked Ingredients */}
        {preferences.dislikedIngredients.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(700)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.warning + "15" }]}>
                <IconSymbol name="hand.thumbsdown.fill" size={18} color={colors.warning} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.dislikedIngredients}</Text>
            </View>
            
            <View style={styles.chipsContainer}>
              {preferences.dislikedIngredients.map((ingredient) => (
                <View
                  key={ingredient.name}
                  style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.chipText, { color: colors.foreground }]}>{ingredient.name}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.chipHint, { color: colors.muted }]}>
              {t.settings.dislikedIngredientsDesc}
            </Text>
          </Animated.View>
        )}

        {/* Meal History */}
        {preferences.mealHistory.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(800)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.muted + "20" }]}>
                <IconSymbol name="clock.fill" size={18} color={colors.muted} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.home.recentMeals}</Text>
            </View>
            
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {preferences.mealHistory.slice(0, 5).map((meal, index) => (
                <View
                  key={meal.id}
                  style={[
                    styles.mealRow,
                    index < Math.min(preferences.mealHistory.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                >
                  <View style={styles.mealLeft}>
                    <View style={[
                      styles.mealIcon,
                      { backgroundColor: meal.liked ? colors.success + "15" : colors.muted + "15" }
                    ]}>
                      <IconSymbol
                        name={meal.liked ? "hand.thumbsup.fill" : "hand.thumbsdown.fill"}
                        size={14}
                        color={meal.liked ? colors.success : colors.muted}
                      />
                    </View>
                    <Text style={[styles.mealName, { color: colors.foreground }]} numberOfLines={1}>
                      {meal.recipeName}
                    </Text>
                  </View>
                  {meal.calories && (
                    <Text style={[styles.mealCalories, { color: colors.muted }]}>{meal.calories} kcal</Text>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Notifications Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(830)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartOrange + "15" }]}>
              <IconSymbol name="bell.fill" size={18} color={colors.chartOrange} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.notifications}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.chartOrange + "15" }]}>
                  <IconSymbol name="bell.badge.fill" size={18} color={colors.chartOrange} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>{t.settings.mealReminders}</Text>
                  <Text style={[styles.settingDesc, { color: colors.muted }]}>{t.settings.mealRemindersDesc}</Text>
                </View>
              </View>
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.chartOrange }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Legal & Privacy Section */}
        <Animated.View entering={FadeInDown.duration(400).delay(850)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.chartBlue + "15" }]}>
              <IconSymbol name="lock.shield.fill" size={18} color={colors.chartBlue} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.legalSection}</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => handleOpenLink("https://caliqapp.com/privacy")}
              style={styles.legalRow}
              activeOpacity={0.7}
            >
              <View style={styles.legalLeft}>
                <View style={[styles.legalIcon, { backgroundColor: colors.primary + "15" }]}>
                  <IconSymbol name="doc.text.fill" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.legalLabel, { color: colors.foreground }]}>{t.settings.privacyPolicy}</Text>
                  <Text style={[styles.legalDesc, { color: colors.muted }]}>{t.settings.privacyPolicyDesc}</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
            
            <View style={[styles.legalDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity
              onPress={() => handleOpenLink("mailto:privacy@caliq.app?subject=Account%20Deletion%20Request")}
              style={styles.legalRow}
              activeOpacity={0.7}
            >
              <View style={styles.legalLeft}>
                <View style={[styles.legalIcon, { backgroundColor: colors.error + "15" }]}>
                  <IconSymbol name="trash.fill" size={16} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.legalLabel, { color: colors.foreground }]}>{t.settings.deleteAccount}</Text>
                  <Text style={[styles.legalDesc, { color: colors.muted }]}>{t.settings.deleteAccountDesc}</Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Reset Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(900)} style={styles.resetSection}>
          <TouchableOpacity
            onPress={resetPreferences}
            style={[styles.resetButton, { backgroundColor: colors.error + "10", borderColor: colors.error }]}
            activeOpacity={0.8}
          >
            <IconSymbol name="arrow.counterclockwise" size={18} color={colors.error} />
            <Text style={[styles.resetText, { color: colors.error }]}>{t.settings.reset}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.muted }]}>{t.settings.version} {Constants.expoConfig?.version ?? "1.4.6"}</Text>
          <Text style={[styles.versionSubtext, { color: colors.muted }]}>CaliQ</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  subscriptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  subscriptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageSubButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  manageSubText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  dietTypeGrid: {
    gap: 10,
  },
  dietTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    position: "relative",
  },
  dietTypeEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  dietTypeLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  dietTypeCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  subscriptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subscriptionEmoji: {
    fontSize: 22,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  subscriptionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  languageGrid: {
    flexDirection: "row",
    gap: 10,
  },
  languageCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    position: "relative",
  },
  languageFlag: {
    fontSize: 28,
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  languageCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  weightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  weightInput: {
    fontSize: 32,
    fontWeight: "700",
    minWidth: 80,
  },
  weightUnit: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  weightHint: {
    fontSize: 12,
    marginTop: 8,
    paddingLeft: 4,
  },
  goalList: {
    gap: 10,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 18,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalEmoji: {
    fontSize: 22,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  goalDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  goalCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  restrictionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  restrictionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  restrictionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  restrictionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  chipHint: {
    fontSize: 12,
    marginTop: 10,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  mealLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  mealCalories: {
    fontSize: 13,
  },
  manualCaloriesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  manualCaloriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manualCaloriesTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  manualCaloriesDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  manualCaloriesInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  caloriesInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    padding: 0,
  },
  caloriesUnit: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  autoCaloriesInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  autoCaloriesLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  autoCaloriesValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  caloriesHint: {
    fontSize: 12,
    marginTop: 8,
  },
  resetSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  resetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  versionSection: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
  },
  versionSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  legalLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  legalIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  legalLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  legalDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  legalDivider: {
    height: 1,
    marginHorizontal: 16,
  },
});
