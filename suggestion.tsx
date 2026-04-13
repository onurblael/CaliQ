  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  const handleAddToShoppingList = (recipe: RecipeSuggestion) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    // Add missing ingredients to shopping list
    const itemsToAdd = recipe.missingIngredients.length > 0 
      ? recipe.missingIngredients 
      : recipe.ingredients;
    
    itemsToAdd.forEach(ingredient => {
      addItem(ingredient);
    });
    
    Alert.alert(
      t.suggestions.addedToList || "Adicionado!",
      `${itemsToAdd.length} ${t.suggestions.itemsAdded || "ingredientes adicionados à lista de compras"}`
    );
  };

  // Premium Nutrition Card Component
  const NutritionCard = ({ nutrition }: { nutrition: NutritionInfo }) => (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(300)}
      style={[styles.nutritionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <TouchableOpacity 
        onPress={() => setShowNutrition(!showNutrition)}
        style={styles.nutritionHeader}
        activeOpacity={0.7}
      >
        <View style={styles.nutritionHeaderLeft}>
          <View style={[styles.nutritionIcon, { backgroundColor: colors.primary + "15" }]}>
            <IconSymbol name="flame.fill" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.nutritionTitle, { color: colors.foreground }]}>{t.nutrition.title}</Text>
        </View>
        <IconSymbol 
          name={showNutrition ? "chevron.up" : "chevron.down"} 
          size={16} 
          color={colors.muted} 
        />
      </TouchableOpacity>
      
      {showNutrition && (
        <View style={[styles.nutritionContent, { borderTopColor: colors.border }]}>