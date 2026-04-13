# Common Health App Feature Patterns

This reference documents common patterns for implementing health and nutrition features in mobile apps.

## Pattern 1: User Health Metrics

### Context Fields
```typescript
interface UserPreferences {
  // Basic metrics
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: "male" | "female" | null;
  
  // Activity and goals
  activityLevel: ActivityLevel;
  goal: "loss" | "maintenance" | "gain";
  
  // Manual overrides
  useManualCalories: boolean;
  manualCalorieGoal: number | null;
}
```

### Calculation Functions
```typescript
const calculateBMR = useCallback((): number | null => {
  const { age, weight, height, gender } = preferences;
  
  if (!age || !weight || !height || !gender) {
    return null;
  }
  
  if (gender === "male") {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}, [preferences]);
```

### Validation Patterns
```typescript
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
```

## Pattern 2: Settings UI Components

### Toggle with Input
```tsx
<View style={[styles.card, { backgroundColor: colors.surface }]}>
  <View style={styles.header}>
    <View>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {t.settings.manualMode}
      </Text>
      <Text style={[styles.desc, { color: colors.muted }]}>
        {t.settings.manualModeDesc}
      </Text>
    </View>
    <Switch
      value={preferences.useManualCalories}
      onValueChange={handleToggle}
      trackColor={{ false: colors.border, true: colors.primary + "80" }}
      thumbColor={preferences.useManualCalories ? colors.primary : colors.muted}
    />
  </View>
  
  {preferences.useManualCalories && (
    <View style={styles.input}>
      <TextInput
        value={inputValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder="2000"
        keyboardType="number-pad"
        returnKeyType="done"
        style={[styles.textInput, { color: colors.foreground }]}
      />
      <Text style={[styles.unit, { color: colors.muted }]}>kcal/day</Text>
    </View>
  )}
</View>
```

### Selection List
```tsx
<View style={styles.list}>
  {OPTIONS.map((option) => (
    <TouchableOpacity
      key={option.value}
      onPress={() => handleSelect(option.value)}
      style={[
        styles.option,
        {
          backgroundColor: selected === option.value 
            ? colors.primary + "15" 
            : colors.surface,
          borderColor: selected === option.value 
            ? colors.primary 
            : colors.border,
        }
      ]}
    >
      <View style={styles.optionLeft}>
        <Text style={styles.emoji}>{option.emoji}</Text>
        <View>
          <Text style={[styles.label, { color: colors.foreground }]}>
            {option.label}
          </Text>
          <Text style={[styles.desc, { color: colors.muted }]}>
            {option.desc}
          </Text>
        </View>
      </View>
      {selected === option.value && (
        <View style={[styles.check, { backgroundColor: colors.primary }]}>
          <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  ))}
</View>
```

## Pattern 3: Dashboard Cards

### Metric Display with Badge
```tsx
<View style={[styles.card, { backgroundColor: colors.surface }]}>
  <View style={styles.content}>
    <View style={[styles.icon, { backgroundColor: colors.primary + "15" }]}>
      <IconSymbol name="flame.fill" size={24} color={colors.primary} />
    </View>
    <View style={styles.info}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        {t.home.dailyCalorieGoal}
        {isManual && (
          <Text style={[styles.badge, { color: colors.warning }]}> • Manual</Text>
        )}
        {!isManual && (
          <Text style={[styles.badge, { color: colors.success }]}> • Auto</Text>
        )}
      </Text>
      <Text style={[styles.value, { color: colors.primary }]}>
        {value ? `${Math.round(value * 0.85)}-${Math.round(value * 1.15)}` : "-"} kcal
      </Text>
    </View>
    <TouchableOpacity 
      onPress={() => router.push("/settings")}
      style={[styles.button, { backgroundColor: colors.surface }]}
    >
      <IconSymbol name="pencil" size={14} color={colors.muted} />
    </TouchableOpacity>
  </View>
</View>
```

## Pattern 4: API Integration

### Sending User Metrics to Backend
```typescript
// In camera.tsx or analysis trigger
const userMetrics = {
  age: preferences.age,
  weight: preferences.weight,
  height: preferences.height,
  gender: preferences.gender,
  activityLevel: preferences.activityLevel,
  goal: preferences.goal,
};

fridgeMutation.mutate({
  imageBase64: base64Image,
  userMetrics: userMetrics,
});
```

### Backend TDEE Calculation
```typescript
// In server/routers.ts
const calculateTDEE = (
  age: number,
  weight: number,
  height: number,
  gender: "male" | "female",
  activityLevel: string
): number => {
  let bmr: number;
  if (gender === "male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  const multipliers: Record<string, number> = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very-active": 1.9,
  };
  
  return bmr * (multipliers[activityLevel] || 1.55);
};
```

## Pattern 5: Translation Structure

### i18n Keys Organization
```typescript
settings: {
  // Section title
  calorieGoal: string;
  
  // Mode labels
  manualMode: string;
  manualModeDesc: string;
  autoMode: string;
  
  // Hints and validation
  calorieGoalDesc: string;
  completeProfile: string;
}
```

### Adding Translations
```typescript
// English
settings: {
  calorieGoal: "Calorie Goal",
  manualMode: "Manual Mode",
  manualModeDesc: "Set your own daily calorie goal",
  autoMode: "Automatic (TDEE)",
  completeProfile: "Complete profile",
  calorieGoalDesc: "Manual mode overrides automatic calculation. Valid range: 1200-4000 kcal/day.",
}

// Portuguese
settings: {
  calorieGoal: "Objetivo Calórico",
  manualMode: "Modo Manual",
  manualModeDesc: "Define o teu próprio objetivo calórico diário",
  autoMode: "Automático (TDEE)",
  completeProfile: "Completa o perfil",
  calorieGoalDesc: "O modo manual substitui o cálculo automático. Intervalo válido: 1200-4000 kcal/dia.",
}

// Spanish
settings: {
  calorieGoal: "Objetivo Calórico",
  manualMode: "Modo Manual",
  manualModeDesc: "Define tu propio objetivo calórico diario",
  autoMode: "Automático (TDEE)",
  completeProfile: "Completa el perfil",
  calorieGoalDesc: "El modo manual reemplaza el cálculo automático. Rango válido: 1200-4000 kcal/día.",
}
```

## Pattern 6: Testing Health Features

### Test Structure
```typescript
describe("Health Feature", () => {
  it("should validate input range", () => {
    // Test min/max boundaries
  });
  
  it("should calculate metric correctly (male)", () => {
    // Test formula with male parameters
  });
  
  it("should calculate metric correctly (female)", () => {
    // Test formula with female parameters
  });
  
  it("should use manual value when enabled", () => {
    // Test manual override
  });
  
  it("should use automatic value when manual disabled", () => {
    // Test automatic calculation
  });
  
  it("should return null when data incomplete", () => {
    // Test missing data handling
  });
});
```

## Common Validation Ranges

| Metric | Min | Max | Unit |
|--------|-----|-----|------|
| Age | 13 | 120 | years |
| Weight | 30 | 300 | kg |
| Height | 100 | 250 | cm |
| Calories | 1200 | 4000 | kcal/day |
| BMI | 10 | 50 | kg/m² |
| Body Fat % | 3 | 60 | % |

## Activity Level Multipliers

| Level | Multiplier | Description |
|-------|------------|-------------|
| Sedentary | 1.2 | Little or no exercise |
| Light | 1.375 | Light exercise 1-3 days/week |
| Moderate | 1.55 | Moderate exercise 3-5 days/week |
| Active | 1.725 | Hard exercise 6-7 days/week |
| Very Active | 1.9 | Very hard exercise, physical job |
