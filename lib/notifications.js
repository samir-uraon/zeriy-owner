
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Display notifications while Zeriy is open.
// Configure this handler only once in your app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  try {
    // Physical device required
    if (!Device.isDevice) {
      throw new Error(
        "Push notifications require a physical Android device."
      );
    }

    // Create Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Zeriy Notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6C3CE9",
        sound: "default",
        enableVibrate: true,
      });
    }

    // Check notification permission
    let permission = await Notifications.getPermissionsAsync();

    if (permission.status !== "granted") {
      if (!permission.canAskAgain) {
        throw new Error(
          "Notifications are blocked. Enable them in Android Settings."
        );
      }

      permission = await Notifications.requestPermissionsAsync();
    }

    if (permission.status !== "granted") {
      throw new Error("Notification permission was not granted.");
    }

    // Get EAS project ID
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error("EAS project ID not found.");
    }

    // Generate Expo Push Token
    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const expoPushToken = tokenResponse.data;

    if (!expoPushToken) {
      throw new Error("Expo Push Token generation failed.");
    }

    console.log("ZERIY EXPO PUSH TOKEN:", expoPushToken);

    return expoPushToken;
  } catch (error) {
    console.error("Zeriy push registration error:", error);
    throw error;
  }
}
