// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
// Bundle ID can only contain letters, numbers, and dots
// Android requires each dot-separated segment to start with a letter
const rawBundleId = "space.manus.truthcalories.t20260131185748";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
    .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
    .replace(/\.+/g, ".") // Collapse consecutive dots
    .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
    .toLowerCase()
    .split(".")
    .map((segment) => {
      // Android requires each segment to start with a letter
      // Prefix with 'x' if segment starts with a digit
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "CaliQ",
  appSlug: "truthcalories",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028905651/WAsoFLZhIPLCPAgt.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.5.0",
  // Remove orientation restriction for Android 16+ compatibility with foldables and tablets
  // orientation: "portrait", // REMOVED: Allow system to manage orientation
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: true,
    package: env.androidPackage,
    versionCode: 10008,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    // Android 15+ compatibility: Disable BOOT_COMPLETED broadcast receivers for foreground services
    // Block permissions that cause Play Store rejection:
    // - SYSTEM_ALERT_WINDOW: "draw over apps" — injected by react-native-purchases, not needed
    // - READ/WRITE_EXTERNAL_STORAGE: deprecated since Android 10 (API 29), causes policy violation
    blockedPermissions: [
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
    ],
    // Android 16+ compatibility: Allow system to manage orientation for foldables and tablets
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    "expo-asset",
    "expo-font",
    [
      "expo-audio",
      {
        android: {
          enableAudioRecordingService: false,
          enableAudioControlsService: false,
        },
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          // Regras ProGuard completas para todas as dependências nativas do CaliQ
          extraProguardRules: [
            // ── React Native core ────────────────────────────────────────────────
            "-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip",
            "-keep @com.facebook.proguard.annotations.DoNotStrip class *",
            "-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }",
            "-keep @com.facebook.jni.annotations.DoNotStrip class *",
            "-keepclassmembers class * { @com.facebook.jni.annotations.DoNotStrip *; }",
            "-keep class * implements com.facebook.react.bridge.JavaScriptModule { *; }",
            "-keep class * implements com.facebook.react.bridge.NativeModule { *; }",
            "-keepclassmembers,includedescriptorclasses class * { native <methods>; }",
            "-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }",
            "-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }",
            "-keep,includedescriptorclasses class com.facebook.react.bridge.** { *; }",
            "-keep,includedescriptorclasses class com.facebook.react.turbomodule.core.** { *; }",
            "-keep,includedescriptorclasses class com.facebook.react.internal.turbomodule.core.** { *; }",
            "-keep class com.facebook.jni.** { *; }",
            "-keep class com.facebook.react.views.view.WindowUtilKt { *; }",
            "-dontwarn com.facebook.react.**",
            // ── Hermes JS engine ────────────────────────────────────────────────
            "-keep class com.facebook.hermes.** { *; }",
            // ── Expo core & modules ─────────────────────────────────────────────
            "-keep class expo.modules.** { *; }",
            "-keepclassmembers public class com.facebook.react.ReactActivityDelegate { public *; protected *; }",
            "-keepclassmembers public class com.facebook.react.ReactNativeHost { protected *; }",
            "-keepclassmembers public class expo.modules.ExpoModulesPackageList { public *; }",
            "-keepnames class * extends expo.modules.core.BasePackage",
            "-keepnames class * implements expo.modules.core.interfaces.Package",
            "-keepclassmembers class * implements expo.modules.kotlin.views.ExpoView { public <init>(android.content.Context); public <init>(android.content.Context, expo.modules.kotlin.AppContext); }",
            // ── Expo Audio (serviços em foreground) ────────────────────────────
            "-keep class expo.modules.audio.** { *; }",
            "-keep class expo.modules.audio.service.** { *; }",
            // ── Expo Notifications ──────────────────────────────────────────────
            "-keep class expo.modules.notifications.** { *; }",
            // ── Expo SecureStore ────────────────────────────────────────────────
            "-keep class expo.modules.securestore.** { *; }",
            // ── Expo Video ──────────────────────────────────────────────────────
            "-keep class expo.modules.video.** { *; }",
            // ── Expo Image (Glide) ──────────────────────────────────────────────
            "-keep public class * extends com.bumptech.glide.module.LibraryGlideModule",
            "-keep public class * implements com.bumptech.glide.module.GlideModule",
            "-keep class * extends com.bumptech.glide.module.AppGlideModule { <init>(...); }",
            "-keep public enum com.bumptech.glide.load.ImageHeaderParser$** { **[] $VALUES; public *; }",
            "-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder { *** rewind(); }",
            "-keep public class com.bumptech.glide.request.ThumbnailRequestCoordinator { *; }",
            "-keep class com.bumptech.glide.GeneratedAppGlideModuleImpl",
            "-keep public class com.bumptech.glide.integration.webp.WebpImage { *; }",
            "-keep public class com.bumptech.glide.integration.webp.WebpFrame { *; }",
            "-keep public class com.bumptech.glide.integration.webp.WebpBitmapFactory { *; }",
            "-dontwarn com.bumptech.glide.load.resource.bitmap.VideoDecoder",
            // ── React Native Reanimated ─────────────────────────────────────────
            "-keep class com.swmansion.reanimated.** { *; }",
            "-keep class com.facebook.react.turbomodule.** { *; }",
            "-keep class com.facebook.react.fabric.** { *; }",
            // ── React Native Worklets ───────────────────────────────────────────
            "-keep class com.swmansion.worklets.** { *; }",
            // ── React Native Gesture Handler ────────────────────────────────────
            "-keep class com.swmansion.gesturehandler.** { *; }",
            // ── React Native Screens ────────────────────────────────────────────
            "-keep class com.swmansion.rnscreens.** { *; }",
            // ── React Native SVG ────────────────────────────────────────────────
            "-keep public class com.horcrux.svg.** { *; }",
            // ── React Native Safe Area Context ──────────────────────────────────
            "-keep class com.th3rdwave.safeareacontext.** { *; }",
            // ── Expo Image Picker (câmara e galeria) ────────────────────────────
            "-keep class expo.modules.imagepicker.** { *; }",
            "-keep class com.imagepicker.** { *; }",
            "-dontwarn expo.modules.imagepicker.**",
            // ── Expo Print (exportação de PDF) ──────────────────────────────────
            "-keep class expo.modules.print.** { *; }",
            "-dontwarn expo.modules.print.**",
            // ── AsyncStorage ────────────────────────────────────────────────────
            "-keep class com.reactnativecommunity.asyncstorage.** { *; }",
            // ── OkHttp / okio (usado por axios e fetch) ─────────────────────────
            "-keep class sun.misc.Unsafe { *; }",
            "-dontwarn java.nio.file.*",
            "-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement",
            "-dontwarn okio.**",
            "-dontwarn okhttp3.**",
            // ── Serialização / Reflexão ────────────────────────────────────────
            "-keepattributes SourceFile,LineNumberTable",
            "-renamesourcefileattribute SourceFile",
            "-keepattributes *Annotation*",
            "-keepattributes Exceptions,InnerClasses,Signature",
            // ── Android 15+ compliance ──────────────────────────────────────────
            "-dontwarn android.view.Window",
            "-dontwarn com.facebook.react.modules.statusbar.**",
            "-dontwarn com.google.android.material.bottomsheet.**",
            "-dontwarn androidx.activity.EdgeToEdgeApi28",
          ].join("\n"),
          // R8/ProGuard: ativar minificação e shrink para gerar mapping.txt
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "2e51b0eb-f262-4410-babe-d71a97327bb9",
    },
  },
  owner: "onurblael",
};

export default config;
