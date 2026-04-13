import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  addedAt: number;
  recipeName?: string; // Optional: which recipe this item is from
}

interface ShoppingListContextType {
  items: ShoppingItem[];
  loading: boolean;
  addItem: (name: string, quantity?: string, category?: string, recipeName?: string) => void;
  removeItem: (id: string) => void;
  toggleItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  exportAsText: () => string;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = "@truthcalories_shopping_list";

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items from storage
  useEffect(() => {
    const loadItems = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load shopping list:", error);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // Save items to storage
  const saveItems = useCallback(async (newItems: ShoppingItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch (error) {
      console.error("Failed to save shopping list:", error);
    }
  }, []);

  const addItem = useCallback(
    (name: string, quantity?: string, category?: string, recipeName?: string) => {
      setItems((prev) => {
        // Check if item already exists (case-insensitive)
        const existing = prev.find((item) => item.name.toLowerCase() === name.toLowerCase());
        
        if (existing) {
          // If exists, just update it (uncheck if it was checked)
          const updated = prev.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: quantity || item.quantity, checked: false, addedAt: Date.now() }
              : item
          );
          saveItems(updated);
          return updated;
        }
        
        // Add new item
        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name,
          quantity,
          category,
          checked: false,
          addedAt: Date.now(),
          recipeName,
        };
        const updated = [...prev, newItem];
        saveItems(updated);
        return updated;
      });
    },
    [saveItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveItems(updated);
        return updated;
      });
    },
    [saveItems]
  );

  const toggleItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        );
        saveItems(updated);
        return updated;
      });
    },
    [saveItems]
  );

  const clearChecked = useCallback(() => {
    setItems((prev) => {
      const updated = prev.filter((item) => !item.checked);
      saveItems(updated);
      return updated;
    });
  }, [saveItems]);

  const clearAll = useCallback(() => {
    setItems([]);
    saveItems([]);
  }, [saveItems]);

  const exportAsText = useCallback((): string => {
    if (items.length === 0) {
      return "Lista de Compras Vazia";
    }

    // Group by category
    const byCategory: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const cat = item.category || "Outros";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });

    let text = "LISTA DE COMPRAS\n";
    text += "=" .repeat(40) + "\n\n";

    Object.entries(byCategory).forEach(([category, categoryItems]) => {
      text += `${category.toUpperCase()}\n`;
      text += "-".repeat(40) + "\n";
      categoryItems.forEach((item) => {
        const checkbox = item.checked ? "[✓]" : "[ ]";
        const qty = item.quantity ? ` - ${item.quantity}` : "";
        const recipe = item.recipeName ? ` (${item.recipeName})` : "";
        text += `${checkbox} ${item.name}${qty}${recipe}\n`;
      });
      text += "\n";
    });

    text += "=" .repeat(40) + "\n";
    text += `Total: ${items.length} ${items.length === 1 ? "item" : "itens"}\n`;
    text += `Gerado em: ${new Date().toLocaleString("pt-PT")}\n`;

    return text;
  }, [items]);

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        toggleItem,
        clearChecked,
        clearAll,
        exportAsText,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error("useShoppingList must be used within ShoppingListProvider");
  }
  return context;
}
