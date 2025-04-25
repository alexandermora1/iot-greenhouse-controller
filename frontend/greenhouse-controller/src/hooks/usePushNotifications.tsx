import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";


// Types                                                                    
export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notifications: Notifications.Notification[];
}


// Helpers for secure persistence                                           
const STORAGE_KEY = "@notifications";

// Read notifications from Secure Store on launch
async function loadStored(): Promise<Notifications.Notification[]> {
  try {
    const json = await SecureStore.getItemAsync(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

// Write notifications array to Secure Store 
async function store(notifs: Notifications.Notification[]) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(notifs));
  } catch {
    console.log("Secure store write error");
  }
}


// Hook
export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] =
    useState<Notifications.ExpoPushToken>();
  const [notifications, setNotifications] = useState<
    Notifications.Notification[]
  >([]);

  useEffect(() => {
    loadStored().then(setNotifications);
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(setExpoPushToken);

    const foregroundSub = Notifications.addNotificationReceivedListener(
      (notif) => {
        setNotifications((prev) => {
          const updated = [...prev, notif];
          store(updated);
          return updated;
        });
      }
    );

    const tapSub = Notifications.addNotificationResponseReceivedListener(
      (resp) => {
        console.log("User tapped notification", resp);
      }
    );

    return () => {
      foregroundSub.remove();
      tapSub.remove();
    };
  }, []);

  return { expoPushToken, notifications };
};


/* Permission + channel helper */

async function registerForPushNotificationsAsync() {
  let token: Notifications.ExpoPushToken | undefined;

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push‑token permissions!");
    return undefined;
  }

  token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
