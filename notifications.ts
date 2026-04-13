import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Handle incoming notifications while the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type Language = "en" | "pt" | "es";

const TEXTS: Record<Language, { lunch: { title: string; body: string }; dinner: { title: string; body: string } }> = {
  en: {
    lunch: {
      title: "Time for lunch! 🍽️",
      body: "Don't forget to log your meal in CaliQ.",
    },
    dinner: {
      title: "Dinner time! 🍴",
      body: "Log what you ate today to stay on track.",
    },
  },
  pt: {
    lunch: {
      title: "Hora do almoço! 🍽️",
      body: "Não te esqueças de registar a tua refeição no CaliQ.",
    },
    dinner: {
      title: "Hora do jantar! 🍴",
      body: "Regista o que comeste hoje e mantém o progresso.",
    },
  },
  es: {
    lunch: {
      title: "¡Hora del almuerzo! 🍽️",
      body: "No olvides registrar tu comida en CaliQ.",
    },
    dinner: {
      title: "¡Hora de cenar! 🍴",
      body: "Registra lo que comiste hoy para mantener el progreso.",
    },
  },
};

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleMealReminders(language: Language = "pt"): Promise<void> {
  if (Platform.OS === "web") return;

  // Cancel existing before rescheduling (idempotent)
  await Notifications.cancelAllScheduledNotificationsAsync();

  const texts = TEXTS[language] ?? TEXTS.pt;

  // Lunch reminder: 12:30 daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: texts.lunch.title,
      body: texts.lunch.body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 30,
    },
  });

  // Dinner reminder: 19:30 daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: texts.dinner.title,
      body: texts.dinner.body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 30,
    },
  });
}

export async function cancelMealReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
