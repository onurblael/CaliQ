import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export interface FoodCorrection {
  id: string;
  originalName: string;
  correctedName: string;
  originalCalories?: number;
  correctedCalories?: number;
  timestamp: number;
  appliedCount: number; // How many times this correction was auto-applied
}

interface FoodCorrectionsContextType {
  corrections: FoodCorrection[];
  loading: boolean;
  addCorrection: (
    originalName: string,
    correctedName: string,
    originalCalories?: number,
    correctedCalories?: number
  ) => void;
  getCorrection: (foodName: string) => FoodCorrection | undefined;
  removeCorrection: (id: string) => void;
  incrementAppliedCount: (id: string) => void;
}

const FoodCorrectionsContext = createContext<FoodCorrectionsContextType | undefined>(undefined);

const STORAGE_KEY = "@truthcalories_food_corrections";

export function FoodCorrectionsProvider({ children }: { children: ReactNode }) {
  const [corrections, setCorrections] = useState<FoodCorrection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load corrections from storage
  useEffect(() => {
    const loadCorrections = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCorrections(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load food corrections:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCorrections();
  }, []);

  // Save corrections to storage
  const saveCorrections = useCallback(async (newCorrections: FoodCorrection[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCorrections));
    } catch (error) {
      console.error("Failed to save food corrections:", error);
    }
  }, []);

  const addCorrection = useCallback(
    (
      originalName: string,
      correctedName: string,
      originalCalories?: number,
      correctedCalories?: number
    ) => {
      setCorrections((prev) => {
        // Check if correction already exists
        const existing = prev.find((c) => c.originalName.toLowerCase() === originalName.toLowerCase());
        
        let updated: FoodCorrection[];
        if (existing) {
          // Update existing correction
          updated = prev.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  correctedName,
                  correctedCalories: correctedCalories ?? c.correctedCalories,
                  timestamp: Date.now(),
                }
              : c
          );
        } else {
          // Add new correction
          const newCorrection: FoodCorrection = {
            id: Date.now().toString(),
            originalName,
            correctedName,
            originalCalories,
            correctedCalories,
            timestamp: Date.now(),
            appliedCount: 0,
          };
          updated = [...prev, newCorrection];
        }
        
        saveCorrections(updated);
        return updated;
      });
    },
    [saveCorrections]
  );

  const getCorrection = useCallback(
    (foodName: string): FoodCorrection | undefined => {
      return corrections.find((c) => c.originalName.toLowerCase() === foodName.toLowerCase());
    },
    [corrections]
  );

  const removeCorrection = useCallback(
    (id: string) => {
      setCorrections((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveCorrections(updated);
        return updated;
      });
    },
    [saveCorrections]
  );

  const incrementAppliedCount = useCallback(
    (id: string) => {
      setCorrections((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, appliedCount: c.appliedCount + 1 } : c
        );
        saveCorrections(updated);
        return updated;
      });
    },
    [saveCorrections]
  );

  return (
    <FoodCorrectionsContext.Provider
      value={{
        corrections,
        loading,
        addCorrection,
        getCorrection,
        removeCorrection,
        incrementAppliedCount,
      }}
    >
      {children}
    </FoodCorrectionsContext.Provider>
  );
}

export function useFoodCorrections() {
  const context = useContext(FoodCorrectionsContext);
  if (!context) {
    throw new Error("useFoodCorrections must be used within FoodCorrectionsProvider");
  }
  return context;
}
