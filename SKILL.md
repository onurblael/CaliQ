---
name: health-app-feature-builder
description: Structured workflow for adding personalized health and nutrition features to mobile apps. Use when implementing user metrics (weight, height, BMR, TDEE), health calculations (Harris-Benedict, BMI), manual overrides, settings UI, dashboard cards, API integration with health data, or multilingual health features (PT/EN/ES).
license: MIT
---

# Health App Feature Builder

This skill provides a structured workflow for adding personalized health and nutrition features to mobile applications, based on proven patterns from real implementations.

## When to Use This Skill

Use this skill when implementing:
- User health metrics (age, weight, height, gender, activity level)
- Health calculations (BMR, TDEE, BMI, calorie goals)
- Manual vs automatic modes for health metrics
- Settings UI for health preferences
- Dashboard cards displaying health data
- API integration with personalized health data
- Multilingual health features (PT/EN/ES)

## Core Workflow

Follow these steps in order for each new health feature:

### Step 1: Analyze Requirements

Identify what the feature needs:
- **User inputs**: What data must the user provide? (e.g., weight, activity level)
- **Calculations**: What formulas are needed? (e.g., Harris-Benedict for TDEE)
- **Validation**: What are acceptable ranges? (e.g., 1200-4000 kcal/day)
- **Modes**: Manual override or automatic only?
- **Integration**: Does the backend need this data?

### Step 2: Update App Context

**File**: `lib/app-context.tsx`

1. **Add fields to UserPreferences interface**
2. **Add fields to DEFAULT_PREFERENCES**
3. **Add functions to AppContextType interface**
4. **Implement functions with useCallback**
5. **Add functions to Provider value**
6. **Validate structure**: Run `python scripts/validate_context.py <path>`

See `references/health-patterns.md` Pattern 1 for complete examples.

### Step 3: Create Settings UI

**File**: `app/(tabs)/settings.tsx`

1. **Import new functions from context**
2. **Add state for inputs** (if needed)
3. **Create section using template** (`templates/settings-section.template.tsx`)
4. **Add styles**

Key UI patterns:
- **Toggle with input**: For manual/automatic modes
- **Selection list**: For multiple options (activity level, gender)
- **Number input**: For numeric values (calories, weight)

See `references/health-patterns.md` Pattern 2 for complete UI components.

### Step 4: Update Dashboard

**File**: `app/(tabs)/index.tsx`

1. **Import calculation function**
2. **Calculate value**
3. **Add card with badge** (Manual/Auto indicator)

See `references/health-patterns.md` Pattern 3 for dashboard card patterns.

### Step 5: Add Translations

**File**: `lib/i18n-context.tsx`

1. **Add keys to TranslationKeys interface**
2. **Add English translations**
3. **Add Portuguese translations**
4. **Add Spanish translations**
5. **Validate translations**: Run `python scripts/check_translations.py <path>`

See `references/health-patterns.md` Pattern 5 for translation structure.

### Step 6: Integrate with API (if needed)

**Files**: `app/camera.tsx`, `server/routers.ts`

1. **Send user metrics to backend**
2. **Update input schema**
3. **Calculate health metrics in backend**
4. **Use in LLM prompt**

See `references/health-patterns.md` Pattern 4 for complete API integration.

### Step 7: Create Unit Tests

**File**: `tests/<feature-name>.test.ts`

Use template: `templates/health-feature-test.template.ts`

Key tests:
1. Input validation (min/max boundaries)
2. Calculation accuracy (known values)
3. Gender differences (male vs female)
4. Manual override (manual takes precedence)
5. Automatic fallback (when manual disabled)
6. Missing data (null handling)

Run: `cd <project_path> && pnpm test`

See `references/health-patterns.md` Pattern 6 for testing patterns.

### Step 8: Update Version and Checkpoint

1. **Mark tasks complete in todo.md**
2. **Update version in app.config.ts**
3. **Save checkpoint with descriptive message**

## Validation Checklist

Before delivering:

- [ ] All context fields have defaults in DEFAULT_PREFERENCES
- [ ] All context functions are in Provider value
- [ ] All setter functions have savePreferences dependency
- [ ] All translation keys exist in PT/EN/ES
- [ ] Input validation enforces acceptable ranges
- [ ] Manual mode overrides automatic calculation
- [ ] Dashboard shows correct values
- [ ] API receives user metrics (if applicable)
- [ ] Unit tests pass (8+ tests recommended)
- [ ] No TypeScript errors
- [ ] Version incremented in app.config.ts
- [ ] Checkpoint created with clear description

## Common Validation Ranges

| Metric | Min | Max | Unit |
|--------|-----|-----|------|
| Age | 13 | 120 | years |
| Weight | 30 | 300 | kg |
| Height | 100 | 250 | cm |
| Calories | 1200 | 4000 | kcal/day |
| BMI | 10 | 50 | kg/m² |

## Activity Level Multipliers

| Level | Multiplier | Description |
|-------|------------|-------------|
| Sedentary | 1.2 | Little or no exercise |
| Light | 1.375 | Light exercise 1-3 days/week |
| Moderate | 1.55 | Moderate exercise 3-5 days/week |
| Active | 1.725 | Hard exercise 6-7 days/week |
| Very Active | 1.9 | Very hard exercise, physical job |

## Troubleshooting

**Context validation fails**: Run `validate_context.py` to identify missing fields or functions.

**Translation check fails**: Run `check_translations.py` to find missing keys in PT/EN/ES.

**Tests fail**: Check calculation formulas match implementation. Verify expected values with manual calculation.

**Dashboard shows null**: Ensure all required user data is filled (age, weight, height, gender).

**API not receiving metrics**: Verify userMetrics object is passed in mutation and schema matches backend.

## Bundled Resources

- **scripts/validate_context.py**: Validates app-context.tsx structure consistency
- **scripts/check_translations.py**: Checks i18n-context.tsx for complete PT/EN/ES translations
- **templates/health-feature-test.template.ts**: Unit test template for health features
- **templates/settings-section.template.tsx**: Settings UI section template
- **references/health-patterns.md**: Detailed code patterns for common health features

## References

For detailed code examples and patterns, see:
- `references/health-patterns.md` - Complete TypeScript interfaces, UI components, API integration, translations, and testing patterns
