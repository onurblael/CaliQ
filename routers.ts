import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

const analyzeInputSchema = z.object({
  imageBase64: z.string(),
  goal: z.enum(["loss", "maintenance", "gain"]),
  restrictions: z.array(z.string()),
  dislikedIngredients: z.array(z.string()),
  likedIngredients: z.array(z.string()),
  recentMeals: z.array(z.string()),
  favoriteRecipes: z.array(z.string()),
  neverAgainRecipes: z.array(z.string()),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
  mealsEatenToday: z.number(),
  caloriesConsumedToday: z.number().optional(),
  language: z.enum(["en", "pt", "es"]).optional(),
  // TDEE personalization fields
  age: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  gender: z.enum(["male", "female"]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very-active"]).optional(),
});

interface NutritionInfo {
  calories: { min: number; max: number };
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  saturatedFat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

interface DetectedFood {
  name: string;
  confidence: number;
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
  nutrition: NutritionInfo;
}

interface AnalysisResult {
  detectedFoods: DetectedFood[];
  suggestions: RecipeSuggestion[];
  currentIndex: number;
  isFromAI: boolean;
  profileMatch: {
    goalAlignment: number;
    restrictionsRespected: boolean;
    basedOnHistory: boolean;
  };
}

// Language-specific prompts
const languageConfig = {
  en: {
    goalDescriptions: {
      loss: "WEIGHT LOSS - Prioritize light meals (300-450 kcal), rich in vegetables and lean protein, low in refined carbs",
      maintenance: "WEIGHT MAINTENANCE - Balanced meals (400-550 kcal), mix of macronutrients, nutritional variety",
      gain: "MUSCLE GAIN - Caloric meals (500-700 kcal), rich in protein and complex carbs, generous portions",
    },
    timeDescriptions: {
      morning: "breakfast (morning meal, energy for the day)",
      afternoon: "lunch (main meal, more substantial)",
      evening: "dinner (evening meal, moderate)",
      night: "late snack (light, easy digestion)",
    },
    restrictions: "MANDATORY RESTRICTIONS (DO NOT include)",
    dislikes: "Ingredients they DON'T like (avoid)",
    likes: "Favorite ingredients (prioritize)",
    recent: "Recent meals (vary)",
    favorites: "Favorite recipes (can suggest variations)",
    neverAgain: "Recipes to NEVER suggest",
    analyzePrompt: "Analyze this image and suggest personalized recipes:",
    mealAnalyzePrompt: "Analyze this meal and calculate the calories:",
  },
  pt: {
    goalDescriptions: {
      loss: "PERDA DE PESO - Priorizar refeições leves (300-450 kcal), ricas em vegetais e proteína magra, baixas em carboidratos refinados",
      maintenance: "MANUTENÇÃO DE PESO - Refeições equilibradas (400-550 kcal), mix de macronutrientes, variedade nutricional",
      gain: "GANHO DE MASSA - Refeições calóricas (500-700 kcal), ricas em proteína e carboidratos complexos, porções generosas",
    },
    timeDescriptions: {
      morning: "pequeno-almoço (refeição matinal, energia para o dia)",
      afternoon: "almoço (refeição principal, mais substancial)",
      evening: "jantar (refeição noturna, moderada)",
      night: "ceia/lanche noturno (leve, fácil digestão)",
    },
    restrictions: "RESTRIÇÕES OBRIGATÓRIAS (NÃO incluir)",
    dislikes: "Ingredientes que NÃO gosta (evitar)",
    likes: "Ingredientes favoritos (priorizar)",
    recent: "Refeições recentes (variar)",
    favorites: "Receitas favoritas (pode sugerir variações)",
    neverAgain: "Receitas a NUNCA sugerir",
    analyzePrompt: "Analisa esta imagem e sugere receitas personalizadas:",
    mealAnalyzePrompt: "Analisa esta refeição e calcula as calorias:",
  },
  es: {
    goalDescriptions: {
      loss: "PÉRDIDA DE PESO - Priorizar comidas ligeras (300-450 kcal), ricas en vegetales y proteína magra, bajas en carbohidratos refinados",
      maintenance: "MANTENIMIENTO DE PESO - Comidas equilibradas (400-550 kcal), mezcla de macronutrientes, variedad nutricional",
      gain: "GANANCIA DE MASA - Comidas calóricas (500-700 kcal), ricas en proteína y carbohidratos complejos, porciones generosas",
    },
    timeDescriptions: {
      morning: "desayuno (comida matutina, energía para el día)",
      afternoon: "almuerzo (comida principal, más sustancial)",
      evening: "cena (comida nocturna, moderada)",
      night: "snack nocturno (ligero, fácil digestión)",
    },
    restrictions: "RESTRICCIONES OBLIGATORIAS (NO incluir)",
    dislikes: "Ingredientes que NO le gustan (evitar)",
    likes: "Ingredientes favoritos (priorizar)",
    recent: "Comidas recientes (variar)",
    favorites: "Recetas favoritas (puede sugerir variaciones)",
    neverAgain: "Recetas a NUNCA sugerir",
    analyzePrompt: "Analiza esta imagen y sugiere recetas personalizadas:",
    mealAnalyzePrompt: "Analiza esta comida y calcula las calorías:",
  },
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  meals: router({
    analyze: publicProcedure
      .input(analyzeInputSchema)
      .mutation(async ({ input }): Promise<AnalysisResult> => {
        const { 
          imageBase64, 
          goal, 
          restrictions, 
          dislikedIngredients,
          likedIngredients,
          recentMeals, 
          favoriteRecipes,
          neverAgainRecipes,
          timeOfDay,
          mealsEatenToday,
          caloriesConsumedToday,
          language = "en",
          age,
          weight,
          height,
          gender,
          activityLevel,
        } = input;

        // Calculate TDEE (Total Daily Energy Expenditure) using Harris-Benedict formula
        const calculateTDEE = (): number | null => {
          if (!age || !weight || !height || !gender) return null;
          
          // Harris-Benedict BMR calculation
          let bmr: number;
          if (gender === "male") {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
          } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
          }
          
          // Activity multipliers
          const activityMultipliers = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very-active": 1.9,
          };
          
          const multiplier = activityLevel ? activityMultipliers[activityLevel] : 1.2;
          return Math.round(bmr * multiplier);
        };

        const personalizedTDEE = calculateTDEE();

        // Calculate remaining calories for the day
        // Use personalized TDEE if available, otherwise use generic targets
        let targetCalories: number;
        if (personalizedTDEE) {
          // Adjust TDEE based on goal
          if (goal === "loss") {
            targetCalories = Math.round(personalizedTDEE * 0.85); // 15% deficit
          } else if (goal === "gain") {
            targetCalories = Math.round(personalizedTDEE * 1.15); // 15% surplus
          } else {
            targetCalories = personalizedTDEE; // maintenance
          }
        } else {
          // Fallback to generic targets
          targetCalories = goal === "loss" ? 1500 : goal === "gain" ? 2500 : 2000;
        }

        const lang = languageConfig[language];

        console.log("=".repeat(60));
        console.log("[meals.analyze] NEW ANALYSIS REQUEST");
        console.log("[meals.analyze] Goal:", goal, "| Time:", timeOfDay, "| Language:", language);
        console.log("[meals.analyze] Meals today:", mealsEatenToday, "| Calories:", caloriesConsumedToday || "N/A");
        if (personalizedTDEE) {
          console.log("[meals.analyze] Personalized TDEE:", personalizedTDEE, "kcal/day (age:", age, "weight:", weight, "height:", height, "gender:", gender, "activity:", activityLevel, ")");
          console.log("[meals.analyze] Adjusted target:", targetCalories, "kcal/day (goal:", goal, ")");
        } else {
          console.log("[meals.analyze] Using generic target:", targetCalories, "kcal/day (no personalization data)");
        }
        console.log("=".repeat(60));

        // Ensure we have a proper data URL
        let dataUrl = imageBase64;
        if (!imageBase64.startsWith("data:")) {
          dataUrl = `data:image/jpeg;base64,${imageBase64}`;
        }

        // Validate image data
        const base64Part = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        if (!base64Part || base64Part.length < 1000) {
          throw new Error(language === "pt" ? "Imagem inválida ou muito pequena. Por favor, tira outra foto." : 
                         language === "es" ? "Imagen inválida o muy pequeña. Por favor, toma otra foto." :
                         "Invalid or too small image. Please take another photo.");
        }

        const remainingCalories = caloriesConsumedToday 
          ? targetCalories - caloriesConsumedToday 
          : targetCalories;
        const mealsRemaining = Math.max(1, 4 - mealsEatenToday);
        const suggestedCaloriesPerMeal = Math.round(remainingCalories / mealsRemaining);

        // Build context sections
        const restrictionText = restrictions.length > 0 
          ? `\n⛔ ${lang.restrictions}: ${restrictions.join(", ")}`
          : "";

        const dislikedText = dislikedIngredients.length > 0
          ? `\n👎 ${lang.dislikes}: ${dislikedIngredients.join(", ")}`
          : "";

        const likedText = likedIngredients.length > 0
          ? `\n👍 ${lang.likes}: ${likedIngredients.join(", ")}`
          : "";

        const recentText = recentMeals.length > 0
          ? `\n📅 ${lang.recent}: ${recentMeals.slice(0, 5).join(", ")}`
          : "";

        const favoritesText = favoriteRecipes.length > 0
          ? `\n⭐ ${lang.favorites}: ${favoriteRecipes.slice(0, 5).join(", ")}`
          : "";

        const neverAgainText = neverAgainRecipes.length > 0
          ? `\n🚫 ${lang.neverAgain}: ${neverAgainRecipes.join(", ")}`
          : "";

        const languageNames = {
          en: "English",
          pt: "Portuguese (Portugal)",
          es: "Spanish (Español)",
        };
        
        const languageInstruction = language === "pt" 
          ? "RESPONDE SEMPRE EM PORTUGUÊS (Portugal). Todos os nomes de receitas, ingredientes e instruções DEVEM estar em português."
          : language === "es"
          ? "RESPONDE SIEMPRE EN ESPAÑOL. Todos los nombres de recetas, ingredientes e instrucciones DEBEN estar en español."
          : "ALWAYS RESPOND IN ENGLISH. All recipe names, ingredients and instructions MUST be in English.";

        const tdeeInfo = personalizedTDEE 
          ? `\n💪 Personalized TDEE: ${personalizedTDEE} kcal/day (age: ${age}, weight: ${weight}kg, height: ${height}cm, gender: ${gender}, activity: ${activityLevel})\n🎯 Daily target (adjusted for goal): ${targetCalories} kcal/day`
          : `\n📊 Using generic calorie target: ${targetCalories} kcal/day`;

        const systemPrompt = `You are a specialized nutritionist in image analysis and personalized meal suggestions.
${languageInstruction}

═══════════════════════════════════════════════════════════
USER PROFILE
═══════════════════════════════════════════════════════════
🎯 Goal: ${lang.goalDescriptions[goal]}
🍽️ Meal: ${lang.timeDescriptions[timeOfDay]}
📊 Suggested calories for this meal: ${suggestedCaloriesPerMeal} kcal (±15%)${tdeeInfo}
📈 Meals eaten today: ${mealsEatenToday}
${restrictionText}${dislikedText}${likedText}${recentText}${favoritesText}${neverAgainText}

═══════════════════════════════════════════════════════════
TASK
═══════════════════════════════════════════════════════════
1. IDENTIFY all visible foods in the image (be specific!)
2. SUGGEST 5-7 recipes that:
   - Use the identified ingredients
   - Respect ALL restrictions
   - Avoid disliked ingredients
   - Prioritize favorite ingredients
   - Are different from recent meals
   - Align with caloric goal
   - Can be prepared in max 20 minutes

3. ORDER recipes by alignment degree (best first)

═══════════════════════════════════════════════════════════
RESPONSE FORMAT (JSON)
═══════════════════════════════════════════════════════════
{
  "detectedFoods": [
    {"name": "specific name", "confidence": 0.85, "category": "vegetable|protein|dairy|grain|fruit|other"}
  ],
  "suggestions": [
    {
      "id": "recipe_1",
      "name": "Recipe Name",
      "calorieRange": {"min": 380, "max": 450},
      "alignmentPercent": 92,
      "prepTimeMinutes": 10,
      "ingredients": ["ingredient1", "ingredient2"],
      "missingIngredients": ["missing ingredient"],
      "instructions": ["step 1", "step 2"],
      "tags": ["quick", "high-protein", "low-carb"],
      "difficulty": "easy",
      "nutrition": {
        "calories": {"min": 380, "max": 450},
        "protein": 25,
        "carbs": 30,
        "fat": 15,
        "saturatedFat": 5,
        "fiber": 8,
        "sugar": 6,
        "sodium": 400
      }
    }
  ]
}

CRITICAL LANGUAGE REQUIREMENT:
- You MUST respond ENTIRELY in ${languageNames[language]}
- ALL recipe names MUST be in ${languageNames[language]} (e.g., ${language === "es" ? "Tortilla de Espinacas" : language === "pt" ? "Omelete de Espinafres" : "Spinach Omelette"})
- ALL ingredient names MUST be in ${languageNames[language]} (e.g., ${language === "es" ? "huevos, espinacas, queso" : language === "pt" ? "ovos, espinafres, queijo" : "eggs, spinach, cheese"})
- ALL instructions MUST be in ${languageNames[language]}
- DO NOT mix languages - use ONLY ${languageNames[language]}
- nutrition.protein, carbs, fat, saturatedFat, fiber, sugar are in GRAMS
- nutrition.sodium is in MILLIGRAMS
- alignmentPercent should reflect how well the recipe aligns with the goal (0-100%)
- Consider: caloric goal, restrictions, preferences, variety
- Recipes with forbidden ingredients = max alignmentPercent 30%
- Recipes using favorites = 10% bonus to alignmentPercent`;

        console.log("[meals.analyze] Calling LLM with comprehensive profile...");

        try {
          const llmResponse = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  { 
                    type: "text", 
                    text: lang.analyzePrompt 
                  },
                  { 
                    type: "image_url", 
                    image_url: { 
                      url: dataUrl,
                      detail: "high" 
                    } 
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
          });

          console.log("[meals.analyze] LLM responded successfully");
          
          const messageContent = llmResponse.choices[0]?.message?.content;
          
          if (typeof messageContent !== "string" || messageContent.trim().length === 0) {
            throw new Error(language === "pt" ? "A IA não conseguiu analisar a imagem. Tenta novamente." :
                           language === "es" ? "La IA no pudo analizar la imagen. Inténtalo de nuevo." :
                           "AI could not analyze the image. Please try again.");
          }

          console.log("[meals.analyze] Raw LLM response (first 1000 chars):", messageContent.substring(0, 1000));

          // Parse JSON response
          let parsed: { detectedFoods?: unknown[]; suggestions?: unknown[] };
          try {
            parsed = JSON.parse(messageContent);
          } catch {
            const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error(language === "pt" ? "Resposta da IA em formato inválido. Tenta novamente." :
                             language === "es" ? "Respuesta de la IA en formato inválido. Inténtalo de nuevo." :
                             "AI response in invalid format. Please try again.");
            }
          }

          // Validate and extract detected foods
          const detectedFoods: DetectedFood[] = [];
          if (Array.isArray(parsed.detectedFoods)) {
            for (const food of parsed.detectedFoods) {
              if (food && typeof food === "object") {
                const f = food as Record<string, unknown>;
                const name = String(f.name || "").trim();
                const confidence = Number(f.confidence || 0.7);
                const category = String(f.category || "other");
                if (name.length > 0 && confidence >= 0.6) {
                  detectedFoods.push({ 
                    name, 
                    confidence: Math.min(Math.max(confidence, 0.6), 1.0),
                    category,
                  });
                }
              }
            }
          }

          // Validate and extract suggestions with nutrition info
          const suggestions: RecipeSuggestion[] = [];
          if (Array.isArray(parsed.suggestions)) {
            let recipeIndex = 0;
            for (const s of parsed.suggestions) {
              if (s && typeof s === "object") {
                const recipe = s as Record<string, unknown>;
                const name = String(recipe.name || "").trim();
                
                // Skip recipes that are in the "never again" list
                if (neverAgainRecipes.some(r => 
                  name.toLowerCase().includes(r.toLowerCase()) || 
                  r.toLowerCase().includes(name.toLowerCase())
                )) {
                  continue;
                }
                
                if (name.length > 0) {
                  let calorieRange = { min: 300, max: 400 };
                  if (recipe.calorieRange && typeof recipe.calorieRange === "object") {
                    const cr = recipe.calorieRange as Record<string, unknown>;
                    calorieRange = {
                      min: Number(cr.min || 300),
                      max: Number(cr.max || 400),
                    };
                  }

                  // Extract nutrition info
                  let nutrition: NutritionInfo = {
                    calories: calorieRange,
                    protein: 20,
                    carbs: 30,
                    fat: 15,
                    saturatedFat: 5,
                    fiber: 5,
                    sugar: 8,
                    sodium: 400,
                  };

                  if (recipe.nutrition && typeof recipe.nutrition === "object") {
                    const n = recipe.nutrition as Record<string, unknown>;
                    nutrition = {
                      calories: n.calories && typeof n.calories === "object" 
                        ? { min: Number((n.calories as Record<string, unknown>).min || calorieRange.min), max: Number((n.calories as Record<string, unknown>).max || calorieRange.max) }
                        : calorieRange,
                      protein: Number(n.protein || 20),
                      carbs: Number(n.carbs || 30),
                      fat: Number(n.fat || 15),
                      saturatedFat: Number(n.saturatedFat || 5),
                      fiber: Number(n.fiber || 5),
                      sugar: Number(n.sugar || 8),
                      sodium: Number(n.sodium || 400),
                    };
                  }

                  // Calculate alignment bonus for favorite ingredients
                  let alignmentBonus = 0;
                  const ingredientsList = Array.isArray(recipe.ingredients) 
                    ? recipe.ingredients.map(String)
                    : [];
                  
                  for (const ing of ingredientsList) {
                    if (likedIngredients.some(liked => 
                      ing.toLowerCase().includes(liked.toLowerCase())
                    )) {
                      alignmentBonus += 5;
                    }
                  }

                  // Penalty for disliked ingredients
                  let alignmentPenalty = 0;
                  for (const ing of ingredientsList) {
                    if (dislikedIngredients.some(disliked => 
                      ing.toLowerCase().includes(disliked.toLowerCase())
                    )) {
                      alignmentPenalty += 15;
                    }
                  }

                  const baseAlignment = Number(recipe.alignmentPercent || 75);
                  const finalAlignment = Math.min(100, Math.max(0, baseAlignment + alignmentBonus - alignmentPenalty));

                  suggestions.push({
                    id: String(recipe.id || `recipe_${++recipeIndex}`),
                    name,
                    calorieRange,
                    alignmentPercent: finalAlignment,
                    prepTimeMinutes: Number(recipe.prepTimeMinutes || 15),
                    ingredients: ingredientsList.filter(i => i.length > 0),
                    missingIngredients: Array.isArray(recipe.missingIngredients) 
                      ? recipe.missingIngredients.map(String).filter(i => i.length > 0)
                      : [],
                    instructions: Array.isArray(recipe.instructions) 
                      ? recipe.instructions.map(String).filter(i => i.length > 0)
                      : language === "pt" 
                        ? ["Preparar ingredientes", "Cozinhar conforme preferência", "Servir"]
                        : language === "es"
                        ? ["Preparar ingredientes", "Cocinar según preferencia", "Servir"]
                        : ["Prepare ingredients", "Cook as preferred", "Serve"],
                    tags: Array.isArray(recipe.tags) 
                      ? recipe.tags.map(String)
                      : [],
                    difficulty: (recipe.difficulty === "easy" || recipe.difficulty === "medium" || recipe.difficulty === "hard") 
                      ? recipe.difficulty 
                      : "easy",
                    nutrition,
                  });
                }
              }
            }
          }

          // Sort by alignment percentage (best first)
          suggestions.sort((a, b) => b.alignmentPercent - a.alignmentPercent);

          console.log("[meals.analyze] Parsed foods:", detectedFoods.length);
          console.log("[meals.analyze] Parsed suggestions:", suggestions.length);

          if (detectedFoods.length === 0) {
            throw new Error(language === "pt" ? "Não consegui identificar alimentos na imagem. Certifica-te que a foto mostra claramente os alimentos." :
                           language === "es" ? "No pude identificar alimentos en la imagen. Asegúrate de que la foto muestre claramente los alimentos." :
                           "Could not identify foods in the image. Make sure the photo clearly shows the foods.");
          }

          if (suggestions.length === 0) {
            throw new Error(language === "pt" ? "Não consegui gerar sugestões de receitas. Tenta com uma foto diferente." :
                           language === "es" ? "No pude generar sugerencias de recetas. Intenta con una foto diferente." :
                           "Could not generate recipe suggestions. Try with a different photo.");
          }

          const result: AnalysisResult = {
            detectedFoods,
            suggestions: suggestions.slice(0, 7),
            currentIndex: 0,
            isFromAI: true,
            profileMatch: {
              goalAlignment: suggestions[0]?.alignmentPercent || 0,
              restrictionsRespected: true,
              basedOnHistory: recentMeals.length > 0 || favoriteRecipes.length > 0,
            },
          };

          console.log("[meals.analyze] SUCCESS - Analysis complete");
          console.log("[meals.analyze] Foods found:", result.detectedFoods.map(f => `${f.name} (${Math.round(f.confidence * 100)}%)`).join(", "));
          console.log("[meals.analyze] Recipes:", result.suggestions.map(s => `${s.name} (${s.alignmentPercent}%)`).join(", "));
          console.log("=".repeat(60));

          return result;

        } catch (error) {
          console.error("[meals.analyze] ERROR:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(language === "pt" ? `Erro na análise: ${errorMessage}` :
                         language === "es" ? `Error en el análisis: ${errorMessage}` :
                         `Analysis error: ${errorMessage}`);
        }
      }),

    // Endpoint for meal calorie analysis (Free feature)
    analyzeMeal: publicProcedure
      .input(z.object({
        imageBase64: z.string(),
        goal: z.enum(["loss", "maintenance", "gain"]),
        restrictions: z.array(z.string()),
        todayCalories: z.number(),
        timeOfDay: z.number(),
        language: z.enum(["en", "pt", "es"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { imageBase64, goal, restrictions, todayCalories, timeOfDay, language = "en" } = input;

        console.log("=".repeat(60));
        console.log("[meals.analyzeMeal] NEW MEAL ANALYSIS");
        console.log("[meals.analyzeMeal] Goal:", goal, "| Hour:", timeOfDay, "| Language:", language);
        console.log("[meals.analyzeMeal] Today calories:", todayCalories);
        console.log("=".repeat(60));

        let dataUrl = imageBase64;
        if (!imageBase64.startsWith("data:")) {
          dataUrl = `data:image/jpeg;base64,${imageBase64}`;
        }

        const base64Part = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        if (!base64Part || base64Part.length < 1000) {
          throw new Error(language === "pt" ? "Imagem inválida ou muito pequena." :
                         language === "es" ? "Imagen inválida o muy pequeña." :
                         "Invalid or too small image.");
        }

        // Determine meal type based on time (translated)
        const mealTypes = {
          en: { breakfast: "Breakfast", morningSnack: "Morning Snack", lunch: "Lunch", snack: "Snack", dinner: "Dinner", nightSnack: "Night Snack", meal: "Meal" },
          pt: { breakfast: "Pequeno-almoço", morningSnack: "Snack da manhã", lunch: "Almoço", snack: "Lanche", dinner: "Jantar", nightSnack: "Snack noturno", meal: "Refeição" },
          es: { breakfast: "Desayuno", morningSnack: "Snack de la mañana", lunch: "Almuerzo", snack: "Merienda", dinner: "Cena", nightSnack: "Snack nocturno", meal: "Comida" },
        };
        const mt = mealTypes[language];
        
        let mealType = mt.meal;
        if (timeOfDay >= 6 && timeOfDay < 10) mealType = mt.breakfast;
        else if (timeOfDay >= 10 && timeOfDay < 12) mealType = mt.morningSnack;
        else if (timeOfDay >= 12 && timeOfDay < 14) mealType = mt.lunch;
        else if (timeOfDay >= 14 && timeOfDay < 17) mealType = mt.snack;
        else if (timeOfDay >= 17 && timeOfDay < 21) mealType = mt.dinner;
        else mealType = mt.nightSnack;

        // Target calories based on goal
        const targetDaily = goal === "loss" ? 1800 : goal === "gain" ? 2500 : 2000;
        const remainingCalories = targetDaily - todayCalories;

        const languageInstruction = language === "pt" 
          ? "RESPONDE SEMPRE EM PORTUGUÊS (Portugal). Todos os nomes de alimentos devem estar em português."
          : language === "es"
          ? "RESPONDE SIEMPRE EN ESPAÑOL. Todos los nombres de alimentos deben estar en español."
          : "ALWAYS RESPOND IN ENGLISH. All food names must be in English.";

        const goalText = language === "pt" 
          ? (goal === "loss" ? "Perda de peso" : goal === "gain" ? "Ganho de massa" : "Manutenção")
          : language === "es"
          ? (goal === "loss" ? "Pérdida de peso" : goal === "gain" ? "Ganancia de masa" : "Mantenimiento")
          : (goal === "loss" ? "Weight loss" : goal === "gain" ? "Muscle gain" : "Maintenance");

        const systemPrompt = `You are a specialized nutritionist in meal analysis.
${languageInstruction}

Analyze the meal image and identify:
1. All visible foods with confidence >= 60%
2. Calorie estimate for each food
3. Total calories (range ±15%)
4. Detailed macronutrients and micronutrients

User context:
- Goal: ${goalText}
- Restrictions: ${restrictions.length > 0 ? restrictions.join(", ") : language === "pt" ? "Nenhuma" : language === "es" ? "Ninguna" : "None"}
- Already consumed today: ${todayCalories} kcal
- Daily target: ${targetDaily} kcal
- Remaining calories: ${remainingCalories} kcal

Respond ONLY in valid JSON:
{
  "foods": [
    { "name": "food name", "confidence": 0.85, "calories": 150, "category": "protein" }
  ],
  "totalCalories": { "min": 400, "max": 500 },
  "alignmentPercent": 85,
  "nutritionBreakdown": {
    "protein": 25,
    "carbs": 45,
    "fat": 15,
    "saturatedFat": 5,
    "fiber": 8,
    "sugar": 10,
    "sodium": 400
  }
}

Rules:
- ALL food names MUST be in ${language === "pt" ? "Portuguese" : language === "es" ? "Spanish" : "English"}
- alignmentPercent: 0-100, how well the meal aligns with the goal
- If significantly exceeds remaining calories: alignmentPercent < 50
- Consider visible portions in the estimate
- Be accurate but honest about uncertainties
- protein, carbs, fat, saturatedFat, fiber, sugar are in GRAMS
- sodium is in MILLIGRAMS`;

        try {
          const llmResponse = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  { type: "text", text: languageConfig[language].mealAnalyzePrompt },
                  { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
                ],
              },
            ],
            response_format: { type: "json_object" },
          });

          const messageContent = llmResponse.choices[0]?.message?.content;
          if (typeof messageContent !== "string" || messageContent.trim().length === 0) {
            throw new Error(language === "pt" ? "A IA não conseguiu analisar a refeição." :
                           language === "es" ? "La IA no pudo analizar la comida." :
                           "AI could not analyze the meal.");
          }

          console.log("[meals.analyzeMeal] LLM response:", messageContent.substring(0, 500));

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(messageContent);
          } catch {
            const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error(language === "pt" ? "Resposta inválida da IA." :
                             language === "es" ? "Respuesta inválida de la IA." :
                             "Invalid AI response.");
            }
          }

          // Extract foods
          const foods: Array<{ name: string; confidence: number; calories?: number; category?: string }> = [];
          if (Array.isArray(parsed.foods)) {
            for (const f of parsed.foods) {
              if (f && typeof f === "object") {
                const food = f as Record<string, unknown>;
                const name = String(food.name || "").trim();
                if (name) {
                  foods.push({
                    name,
                    confidence: Number(food.confidence || 0.7),
                    calories: food.calories ? Number(food.calories) : undefined,
                    category: String(food.category || "other"),
                  });
                }
              }
            }
          }

          // Extract calories
          let totalCalories = { min: 300, max: 400 };
          if (parsed.totalCalories && typeof parsed.totalCalories === "object") {
            const tc = parsed.totalCalories as Record<string, unknown>;
            totalCalories = {
              min: Number(tc.min || 300),
              max: Number(tc.max || 400),
            };
          }

          // Extract alignment
          const alignmentPercent = Number(parsed.alignmentPercent || 70);

          // Extract detailed nutrition
          let nutritionBreakdown: { 
            protein: number; 
            carbs: number; 
            fat: number;
            saturatedFat: number;
            fiber: number;
            sugar: number;
            sodium: number;
          } = {
            protein: 20,
            carbs: 30,
            fat: 15,
            saturatedFat: 5,
            fiber: 5,
            sugar: 8,
            sodium: 400,
          };
          
          if (parsed.nutritionBreakdown && typeof parsed.nutritionBreakdown === "object") {
            const nb = parsed.nutritionBreakdown as Record<string, unknown>;
            nutritionBreakdown = {
              protein: Number(nb.protein || 20),
              carbs: Number(nb.carbs || 30),
              fat: Number(nb.fat || 15),
              saturatedFat: Number(nb.saturatedFat || 5),
              fiber: Number(nb.fiber || 5),
              sugar: Number(nb.sugar || 8),
              sodium: Number(nb.sodium || 400),
            };
          }

          if (foods.length === 0) {
            throw new Error(language === "pt" ? "Não consegui identificar alimentos na imagem." :
                           language === "es" ? "No pude identificar alimentos en la imagen." :
                           "Could not identify foods in the image.");
          }

          console.log("[meals.analyzeMeal] SUCCESS");
          console.log("[meals.analyzeMeal] Foods:", foods.map(f => f.name).join(", "));
          console.log("[meals.analyzeMeal] Calories:", totalCalories.min, "-", totalCalories.max);

          return {
            foods,
            totalCalories,
            alignmentPercent: Math.min(100, Math.max(0, alignmentPercent)),
            mealType,
            nutritionBreakdown,
          };

        } catch (error) {
          console.error("[meals.analyzeMeal] ERROR:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          throw new Error(language === "pt" ? `Erro na análise: ${errorMessage}` :
                         language === "es" ? `Error en el análisis: ${errorMessage}` :
                         `Analysis error: ${errorMessage}`);
        }
      }),
  }),

  // Public routes for legal documents
  legal: router({
    privacyPolicy: publicProcedure
      .input(z.object({ language: z.enum(["en", "pt", "es"]).optional() }).optional())
      .query(async ({ input }) => {
        const language = input?.language || "pt";
        
        // In production, these would be read from files or a database
        // For now, we'll return a simple response indicating the document is available
        const privacyPolicies = {
          en: {
            title: "Privacy Policy",
            url: "https://caliq.app/privacy",
            lastUpdated: "2026-02-01",
          },
          pt: {
            title: "Política de Privacidade",
            url: "https://caliq.app/privacy",
            lastUpdated: "2026-02-01",
          },
          es: {
            title: "Política de Privacidad",
            url: "https://caliq.app/privacy",
            lastUpdated: "2026-02-01",
          },
        };
        
        return privacyPolicies[language];
      }),
  }),
});

export type AppRouter = typeof appRouter;
