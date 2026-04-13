import { Text, View, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, Share, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useShoppingList } from "@/lib/shopping-list-context";
import { useSubscription } from "@/lib/subscription-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";

export default function ShoppingListScreen() {
  const colors = useColors();
  const { items, addItem, removeItem, toggleItem, clearChecked, clearAll, exportAsText } = useShoppingList();
  const { canAccessShoppingList } = useSubscription();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");

  const hasAccess = canAccessShoppingList();

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    if (!hasAccess) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      router.push("/upgrade");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    addItem(newItemName.trim(), newItemQuantity.trim() || undefined);
    setNewItemName("");
    setNewItemQuantity("");
  };

  const handleToggleItem = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleItem(id);
  };

  const handleRemoveItem = (id: string, name: string) => {
    Alert.alert(
      "Remover Item",
      `Remover "${name}" da lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            removeItem(id);
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    const text = exportAsText();

    if (Platform.OS === "web") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lista-compras-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      try {
        await Share.share({ message: text });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    }
  };

  const handlePrint = async () => {
    try {
      const text = exportAsText();
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #0a7ea4; }
              .item { margin: 8px 0; font-size: 16px; }
              .checked { text-decoration: line-through; color: #999; }
            </style>
          </head>
          <body>
            <pre>${text}</pre>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Failed to print:", error);
      Alert.alert("Erro", "Não foi possível imprimir a lista");
    }
  };

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const checkedCount = items.filter((i) => i.checked).length;

  // ── Locked state for Free / Pro users ──────────────────────────────────────
  if (!hasAccess) {
    return (
      <ScreenContainer className="p-6">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Lista de Compras</Text>
        </View>

        <View style={[styles.lockedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Lock icon */}
          <View style={[styles.lockIconWrapper, { backgroundColor: colors.warning + "18" }]}>
            <IconSymbol name="lock.fill" size={36} color={colors.warning} />
          </View>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>Pro+ Exclusivo</Text>
          </View>

          <Text style={[styles.lockedTitle, { color: colors.foreground }]}>
            Lista de Compras Inteligente
          </Text>
          <Text style={[styles.lockedDescription, { color: colors.muted }]}>
            Cria e gere a tua lista de compras diretamente no app. Os ingredientes das receitas sugeridas são adicionados automaticamente — sem esquecer nada no supermercado.
          </Text>

          {/* Feature list */}
          {[
            "Adicionar itens manualmente",
            "Ingredientes das receitas adicionados automaticamente",
            "Marcar itens como comprados",
            "Exportar e partilhar a lista",
            "Imprimir em PDF",
          ].map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.foreground }]}>{feature}</Text>
            </View>
          ))}

          {/* Upgrade button */}
          <TouchableOpacity
            onPress={() => router.push("/upgrade")}
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <IconSymbol name="star.fill" size={18} color="#FFFFFF" />
            <Text style={styles.upgradeButtonText}>Fazer Upgrade para Pro+</Text>
          </TouchableOpacity>

          <Text style={[styles.lockedNote, { color: colors.muted }]}>
            Disponível nos planos Pro+ · A partir de €9,99/mês
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // ── Unlocked state ──────────────────────────────────────────────────────────
  return (
    <ScreenContainer className="p-4">
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Lista de Compras</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {uncheckedCount} {uncheckedCount === 1 ? "item" : "itens"} pendente{uncheckedCount !== 1 ? "s" : ""}
            {checkedCount > 0 && ` · ${checkedCount} completo${checkedCount !== 1 ? "s" : ""}`}
          </Text>
        </View>

        {items.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleExport}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
            </TouchableOpacity>

            {Platform.OS !== "web" && (
              <TouchableOpacity
                onPress={handlePrint}
                style={[styles.iconButton, { backgroundColor: colors.surface }]}
              >
                <IconSymbol name="printer" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Limpar Lista",
                  "O que deseja limpar?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Itens Marcados", onPress: clearChecked },
                    { text: "Tudo", style: "destructive", onPress: clearAll },
                  ]
                );
              }}
              style={[styles.iconButton, { backgroundColor: colors.surface }]}
            >
              <IconSymbol name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.addSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder="Nome do item"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.nameInput, { color: colors.foreground }]}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TextInput
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            placeholder="Qtd"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.quantityInput, { color: colors.foreground }]}
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          onPress={handleAddItem}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          disabled={!newItemName.trim()}
        >
          <IconSymbol name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: colors.muted }]}>🛒</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Lista vazia</Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Adicione itens que precisa comprar
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: item.checked ? 0.6 : 1,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleToggleItem(item.id)}
                style={styles.itemContent}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: item.checked ? colors.primary : colors.border,
                      backgroundColor: item.checked ? colors.primary : "transparent",
                    },
                  ]}
                >
                  {item.checked && <IconSymbol name="checkmark" size={16} color="#FFFFFF" />}
                </View>

                <View style={styles.itemText}>
                  <Text
                    style={[
                      styles.itemName,
                      { color: colors.foreground },
                      item.checked && styles.checkedText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.quantity && (
                    <Text style={[styles.itemQuantity, { color: colors.muted }]}>
                      {item.quantity}
                    </Text>
                  )}
                  {item.recipeName && (
                    <Text style={[styles.itemRecipe, { color: colors.muted }]}>
                      De: {item.recipeName}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id, item.name)}
                style={styles.deleteButton}
              >
                <IconSymbol name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Locked card ──────────────────────────────────────────────────────────────
  lockedCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  lockIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  lockedDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: 10,
    paddingHorizontal: 4,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignSelf: "stretch",
    marginTop: 8,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  lockedNote: {
    fontSize: 12,
    textAlign: "center",
  },
  // ── Add section ──────────────────────────────────────────────────────────────
  addSection: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  inputRow: {
    flex: 1,
    gap: 8,
  },
  input: {
    fontSize: 15,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  nameInput: {
    flex: 1,
  },
  quantityInput: {
    width: 80,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
  },
  // ── List items ───────────────────────────────────────────────────────────────
  listContent: {
    gap: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  checkedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemRecipe: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
