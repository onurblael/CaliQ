import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const APP_VERSION = "1.0.1";
const VERSION_KEY = `@caliq_last_seen_version`;

export default function WhatsNewScreen() {
  const colors = useColors();
  const { t } = useI18n();

  const handleContinue = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Mark this version as seen
    await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
    
    // Navigate to home
    router.replace("/(tabs)");
  };

  const updates = [
    {
      icon: "shield-checkmark" as const,
      title: t.whatsNew.update1.title,
      description: t.whatsNew.update1.description,
    },
    {
      icon: "speedometer" as const,
      title: t.whatsNew.update2.title,
      description: t.whatsNew.update2.description,
    },
    {
      icon: "bug" as const,
      title: t.whatsNew.update3.title,
      description: t.whatsNew.update3.description,
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="sparkles" size={40} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-foreground text-center mb-2">
              {t.whatsNew.title}
            </Text>
            <Text className="text-base text-muted text-center">
              {t.whatsNew.subtitle.replace("{version}", APP_VERSION)}
            </Text>
          </View>

          {/* Updates List */}
          <View className="gap-4 mb-8">
            {updates.map((update, index) => (
              <View
                key={index}
                className="bg-surface rounded-2xl p-5 border border-border"
              >
                <View className="flex-row items-start gap-4">
                  <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                    <Ionicons
                      name={update.icon}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground mb-1">
                      {update.title}
                    </Text>
                    <Text className="text-sm text-muted leading-relaxed">
                      {update.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="bg-primary rounded-full py-4 px-8 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">
              {t.common.continue}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
