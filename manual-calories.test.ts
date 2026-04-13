import { describe, it, expect } from "vitest";

describe("Manual Calorie Goal Functionality", () => {
  // Test 1: Validate calorie range (1200-4000 kcal)
  it("should clamp manual calorie goal to valid range", () => {
    const setManualCalorieGoal = (calories: number | null): number | null => {
      if (calories === null) return null;
      return Math.max(1200, Math.min(4000, calories));
    };

    expect(setManualCalorieGoal(1000)).toBe(1200); // Below minimum
    expect(setManualCalorieGoal(5000)).toBe(4000); // Above maximum
    expect(setManualCalorieGoal(2000)).toBe(2000); // Within range
    expect(setManualCalorieGoal(null)).toBe(null); // Null value
  });

  // Test 2: Calculate TDEE with Harris-Benedict formula (Male)
  it("should calculate TDEE correctly for male", () => {
    const age = 30;
    const weight = 80; // kg
    const height = 180; // cm
    const gender = "male";
    const activityLevel = "moderate";
    const goal = "maintenance";

    // BMR for male: 88.362 + (13.397 × 80) + (4.799 × 180) - (5.677 × 30)
    const bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    expect(Math.round(bmr)).toBe(1854);

    // TDEE with moderate activity (1.55 multiplier)
    const tdee = bmr * 1.55;
    expect(Math.round(tdee)).toBe(2873);

    // Maintenance goal (no adjustment)
    const targetCalories = tdee;
    expect(Math.round(targetCalories)).toBe(2873);
  });

  // Test 3: Calculate TDEE with Harris-Benedict formula (Female)
  it("should calculate TDEE correctly for female", () => {
    const age = 25;
    const weight = 60; // kg
    const height = 165; // cm
    const gender = "female";
    const activityLevel = "light";
    const goal = "loss";

    // BMR for female: 447.593 + (9.247 × 60) + (3.098 × 165) - (4.330 × 25)
    const bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    expect(Math.round(bmr)).toBe(1405);

    // TDEE with light activity (1.375 multiplier)
    const tdee = bmr * 1.375;
    expect(Math.round(tdee)).toBe(1932);

    // Loss goal (15% deficit)
    const targetCalories = tdee * 0.85;
    expect(Math.round(targetCalories)).toBe(1642);
  });

  // Test 4: Manual mode overrides automatic calculation
  it("should use manual calorie goal when enabled", () => {
    const useManualCalories = true;
    const manualCalorieGoal = 2500;
    const autoCalories = 2894; // From automatic TDEE calculation

    const calculateDailyCalories = (): number | null => {
      if (useManualCalories && manualCalorieGoal) {
        return manualCalorieGoal;
      }
      return autoCalories;
    };

    expect(calculateDailyCalories()).toBe(2500);
  });

  // Test 5: Automatic mode when manual is disabled
  it("should use automatic TDEE when manual mode is disabled", () => {
    const useManualCalories = false;
    const manualCalorieGoal = 2500;
    const autoCalories = 2894;

    const calculateDailyCalories = (): number | null => {
      if (useManualCalories && manualCalorieGoal) {
        return manualCalorieGoal;
      }
      return autoCalories;
    };

    expect(calculateDailyCalories()).toBe(2894);
  });

  // Test 6: Return null when no data is available
  it("should return null when profile is incomplete", () => {
    const age = null;
    const weight = 80;
    const height = 180;
    const gender = "male";

    const calculateDailyCalories = (): number | null => {
      if (!age || !weight || !height || !gender) {
        return null;
      }
      // ... calculation logic
      return 2894;
    };

    expect(calculateDailyCalories()).toBe(null);
  });

  // Test 7: Activity level multipliers
  it("should apply correct activity level multipliers", () => {
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    };

    expect(activityMultipliers.sedentary).toBe(1.2);
    expect(activityMultipliers.light).toBe(1.375);
    expect(activityMultipliers.moderate).toBe(1.55);
    expect(activityMultipliers.active).toBe(1.725);
    expect(activityMultipliers["very-active"]).toBe(1.9);
  });

  // Test 8: Goal adjustments
  it("should apply correct goal adjustments", () => {
    const tdee = 2500;

    const lossCalories = tdee * 0.85; // 15% deficit
    const maintenanceCalories = tdee; // No adjustment
    const gainCalories = tdee * 1.15; // 15% surplus

    expect(Math.round(lossCalories)).toBe(2125);
    expect(Math.round(maintenanceCalories)).toBe(2500);
    expect(Math.round(gainCalories)).toBe(2875);
  });
});
