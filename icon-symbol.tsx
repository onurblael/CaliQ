// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "cart.fill": "shopping-cart",
  "plus": "add",
  "trash": "delete",
  "square.and.arrow.up": "share",
  "printer": "print",
  "camera.fill": "camera-alt",
  "gearshape.fill": "settings",
  "fork.knife": "restaurant",
  "photo.fill": "photo-library",
  "xmark": "close",
  "checkmark": "check",
  "arrow.left": "arrow-back",
  "clock.fill": "schedule",
  "flame.fill": "local-fire-department",
  "target": "track-changes",
  "heart.fill": "favorite",
  "hand.thumbsup.fill": "thumb-up",
  "hand.thumbsdown.fill": "thumb-down",
  "arrow.clockwise": "refresh",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "person.fill": "person",
  "leaf.fill": "eco",
  "refrigerator.fill": "kitchen",
  "book.fill": "menu-book",
  "sparkles": "auto-awesome",
  "star.fill": "star",
  "crown.fill": "workspace-premium",
  "bolt.fill": "bolt",
  "chart.bar.fill": "bar-chart",
  "calendar": "calendar-today",
  "list.bullet": "list",
  "checkmark.circle.fill": "check-circle",
  "chevron.up": "expand-less",
  "chevron.down": "expand-more",
  "chevron.left": "chevron-left",
  "arrow.counterclockwise": "replay",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "scalemass.fill": "fitness-center",
  "globe": "language",
  "lock.fill": "lock",
  "lock.shield.fill": "security",
  "doc.text.fill": "description",
  "trash.fill": "delete",
  "arrow.up.right.square": "open-in-new",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
