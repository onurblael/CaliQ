import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";
import { Alert, Linking, Platform } from "react-native";

// ─── Plan Types ────────────────────────────────────────────────────────────────

export type PlanType = "free" | "pro" | "pro_plus";
export type BillingCycle = "monthly" | "yearly";

export interface PlanLimits {
  mealScansPerDay: number; // -1 = unlimited
  fridgeScansPerDay: number; // 0 = not available, -1 = unlimited
  recipeSuggestions: boolean;
  weeklyPlanning: boolean;
  shoppingList: boolean;
  optimizedRecipes: boolean;
  metabolicConsistency: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  yearlyPrice: number;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    limits: {
      mealScansPerDay: 5,
      fridgeScansPerDay: 0,
      recipeSuggestions: false,
      weeklyPlanning: false,
      shoppingList: false,
      optimizedRecipes: false,
      metabolicConsistency: false,
    },
    features: [
      "Scan de refeições (5x/dia)",
      "Tracking com intervalos calóricos",
      "Histórico de refeições",
      "Alinhamento com objetivo",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 4.99,
    yearlyPrice: 39.99,
    limits: {
      mealScansPerDay: 15,
      fridgeScansPerDay: 1,
      recipeSuggestions: true,
      weeklyPlanning: false,
      shoppingList: false,
      optimizedRecipes: false,
      metabolicConsistency: false,
    },
    features: [
      "Tudo do Free +",
      "Scan de frigorífico (1x/dia)",
      "Sugestões de receitas básicas",
      "Ajuste ao objetivo calórico diário",
      "Scan de refeições (15x/dia)",
    ],
    popular: true,
    badge: "Mais Popular",
  },
  pro_plus: {
    id: "pro_plus",
    name: "Pro+",
    price: 9.99,
    yearlyPrice: 79.99,
    limits: {
      mealScansPerDay: -1,
      fridgeScansPerDay: -1,
      recipeSuggestions: true,
      weeklyPlanning: true,
      shoppingList: true,
      optimizedRecipes: true,
      metabolicConsistency: true,
    },
    features: [
      "Tudo do Pro +",
      "Scans ilimitados",
      "Scan de frigorífico ilimitado",
      "Planeamento semanal",
      "Receitas otimizadas",
      "Lista de compras",
    ],
    badge: "Completo",
  },
};

// ─── RevenueCat Configuration ──────────────────────────────────────────────────
// Obtém as chaves em https://app.revenuecat.com → Project → API Keys
// Define EXPO_PUBLIC_RC_ANDROID_KEY e EXPO_PUBLIC_RC_IOS_KEY no ficheiro .env

const RC_API_KEYS = {
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? "",
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? "",
};

// Identificadores dos produtos — devem corresponder EXATAMENTE aos criados
// em Google Play Console → Monetização → Produtos → Subscrições
export const PRODUCT_IDS: Record<
  Exclude<PlanType, "free">,
  Record<BillingCycle, string>
> = {
  pro: {
    monthly: "caliq_pro_monthly",
    yearly: "caliq_pro_yearly",
  },
  pro_plus: {
    monthly: "caliq_pro_plus_monthly",
    yearly: "caliq_pro_plus_yearly",
  },
};

// Identificadores dos entitlements configurados no dashboard RevenueCat
const ENTITLEMENT_IDS: Record<Exclude<PlanType, "free">, string> = {
  pro: "pro",
  pro_plus: "pro_plus",
};

// ─── Subscription State ────────────────────────────────────────────────────────

export interface SubscriptionState {
  plan: PlanType;
  billingCycle: BillingCycle | null;
  isActive: boolean;
  isInTrial: boolean;
  expiresAt: Date | null;
}

const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: "free",
  billingCycle: null,
  isActive: false,
  isInTrial: false,
  expiresAt: null,
};

// ─── Daily Usage Tracking ──────────────────────────────────────────────────────

interface DailyUsage {
  date: string;
  mealScans: number;
  fridgeScans: number;
}

const USAGE_KEY = "@caliq_daily_usage";

async function getTodayUsage(): Promise<DailyUsage> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed: DailyUsage = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
  } catch {
    // ignora erros de storage
  }
  return { date: today, mealScans: 0, fridgeScans: 0 };
}

async function saveTodayUsage(usage: DailyUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignora erros de storage
  }
}

// ─── Context Interface ─────────────────────────────────────────────────────────

interface SubscriptionContextType {
  subscription: SubscriptionState;
  currentPlan: Plan;
  isLoading: boolean;
  isInTrial: boolean;
  upgradePlan: (plan: PlanType, billingCycle: BillingCycle) => Promise<void>;
  cancelSubscription: () => void;
  restorePurchases: () => Promise<void>;
  incrementMealScan: () => void;
  incrementFridgeScan: () => void;
  canAccessRecipes: boolean;
  canScanMeal: () => boolean;
  canScanFridge: () => boolean;
  getRemainingMealScans: () => number; // -1 = ilimitado
  getRemainingFridgeScans: () => number; // -1 = ilimitado
  mealScansToday: number;
  fridgeScansToday: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

// ─── Helper: CustomerInfo → PlanType ──────────────────────────────────────────

function planFromCustomerInfo(info: CustomerInfo): PlanType {
  if (info.entitlements.active[ENTITLEMENT_IDS.pro_plus]) return "pro_plus";
  if (info.entitlements.active[ENTITLEMENT_IDS.pro]) return "pro";
  return "free";
}

function billingCycleFromCustomerInfo(
  info: CustomerInfo,
  plan: PlanType
): BillingCycle | null {
  if (plan === "free") return null;
  const entitlementId =
    plan === "pro_plus" ? ENTITLEMENT_IDS.pro_plus : ENTITLEMENT_IDS.pro;
  const entitlement = info.entitlements.active[entitlementId];
  if (!entitlement) return null;
  return entitlement.periodType === "ANNUAL" ? "yearly" : "monthly";
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState>(
    DEFAULT_SUBSCRIPTION
  );
  const [isLoading, setIsLoading] = useState(true);
  const [mealScansToday, setMealScansToday] = useState(0);
  const [fridgeScansToday, setFridgeScansToday] = useState(0);

  const updateFromCustomerInfo = useCallback((info: CustomerInfo) => {
    const plan = planFromCustomerInfo(info);
    const billingCycle = billingCycleFromCustomerInfo(info, plan);
    const entitlementId =
      plan === "pro_plus" ? ENTITLEMENT_IDS.pro_plus : ENTITLEMENT_IDS.pro;
    const activeEntitlement = info.entitlements.active[entitlementId];
    const isInTrial = activeEntitlement?.periodType === "TRIAL";

    setSubscription({
      plan,
      billingCycle,
      isActive: plan !== "free",
      isInTrial,
      expiresAt: activeEntitlement?.expirationDate
        ? new Date(activeEntitlement.expirationDate)
        : null,
    });
  }, []);

  // Inicializar RevenueCat e carregar uso diário
  useEffect(() => {
    const init = async () => {
      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        const apiKey =
          Platform.OS === "ios" ? RC_API_KEYS.ios : RC_API_KEYS.android;

        if (!apiKey) {
          console.warn(
            "[SubscriptionProvider] RevenueCat API key não configurada. " +
              "Define EXPO_PUBLIC_RC_ANDROID_KEY no .env"
          );
          return;
        }

        await Purchases.configure({ apiKey });

        const info = await Purchases.getCustomerInfo();
        updateFromCustomerInfo(info);

        // Ouvir atualizações em tempo real (ex.: após renovação automática)
        Purchases.addCustomerInfoUpdateListener(updateFromCustomerInfo);
      } catch (e) {
        console.error("[SubscriptionProvider] Erro na inicialização:", e);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    getTodayUsage().then((usage) => {
      setMealScansToday(usage.mealScans);
      setFridgeScansToday(usage.fridgeScans);
    });
  }, [updateFromCustomerInfo]);

  // ── Compra ────────────────────────────────────────────────────────────────────
  const upgradePlan = useCallback(
    async (plan: PlanType, billingCycle: BillingCycle) => {
      if (plan === "free") return;

      setIsLoading(true);
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;

        if (!current) {
          throw new Error(
            "Sem ofertas disponíveis de momento. Tenta novamente mais tarde."
          );
        }

        const productId = PRODUCT_IDS[plan][billingCycle];
        const pkg = current.availablePackages.find(
          (p) => p.product.identifier === productId
        );

        if (!pkg) {
          throw new Error(
            `Produto não encontrado (${productId}). Verifica a configuração na Google Play Console.`
          );
        }

        const { customerInfo } = await Purchases.purchasePackage(pkg);
        updateFromCustomerInfo(customerInfo);
      } catch (e: any) {
        // Utilizador cancelou — não é um erro
        if (e?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return;
        console.error("[upgradePlan] Erro:", e);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [updateFromCustomerInfo]
  );

  // ── Cancelar Subscrição ───────────────────────────────────────────────────────
  // Não é possível cancelar programaticamente — deve redirecionar para o Google Play
  const cancelSubscription = useCallback(() => {
    Alert.alert(
      "Cancelar Subscrição",
      "Para cancelar, acede às tuas subscrições no Google Play Store.",
      [
        { text: "Fechar", style: "cancel" },
        {
          text: "Abrir Google Play",
          onPress: () =>
            Linking.openURL(
              "https://play.google.com/store/account/subscriptions"
            ),
        },
      ]
    );
  }, []);

  // ── Restaurar Compras ─────────────────────────────────────────────────────────
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      updateFromCustomerInfo(info);
    } catch (e) {
      console.error("[restorePurchases] Erro:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [updateFromCustomerInfo]);

  // ── Contadores de uso diário ──────────────────────────────────────────────────
  const incrementMealScan = useCallback(async () => {
    const usage = await getTodayUsage();
    usage.mealScans += 1;
    await saveTodayUsage(usage);
    setMealScansToday(usage.mealScans);
  }, []);

  const incrementFridgeScan = useCallback(async () => {
    const usage = await getTodayUsage();
    usage.fridgeScans += 1;
    await saveTodayUsage(usage);
    setFridgeScansToday(usage.fridgeScans);
  }, []);

  const currentPlan = PLANS[subscription.plan];
  const canAccessRecipes = currentPlan.limits.recipeSuggestions;

  const canScanMeal = useCallback((): boolean => {
    const limit = currentPlan.limits.mealScansPerDay;
    if (limit === -1) return true;
    return mealScansToday < limit;
  }, [currentPlan, mealScansToday]);

  const canScanFridge = useCallback((): boolean => {
    const limit = currentPlan.limits.fridgeScansPerDay;
    if (limit === 0) return false;
    if (limit === -1) return true;
    return fridgeScansToday < limit;
  }, [currentPlan, fridgeScansToday]);

  const getRemainingMealScans = useCallback((): number => {
    const limit = currentPlan.limits.mealScansPerDay;
    if (limit === -1) return -1;
    return Math.max(0, limit - mealScansToday);
  }, [currentPlan, mealScansToday]);

  const getRemainingFridgeScans = useCallback((): number => {
    const limit = currentPlan.limits.fridgeScansPerDay;
    if (limit === -1) return -1;
    return Math.max(0, limit - fridgeScansToday);
  }, [currentPlan, fridgeScansToday]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        currentPlan,
        isLoading,
        isInTrial: subscription.isInTrial,
        upgradePlan,
        cancelSubscription,
        restorePurchases,
        incrementMealScan,
        incrementFridgeScan,
        canAccessRecipes,
        canScanMeal,
        canScanFridge,
        getRemainingMealScans,
        getRemainingFridgeScans,
        mealScansToday,
        fridgeScansToday,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription deve ser usado dentro de SubscriptionProvider"
    );
  }
  return context;
}
