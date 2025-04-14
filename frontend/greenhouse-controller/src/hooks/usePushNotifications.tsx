import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Code based on this tutorial: https://www.youtube.com/watch?v=V-hois8dgM4

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notifications?: Notifications.Notification[];
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);

  const notificationsListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token");
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
    } else {
      console.log("ERROR: Please use physical device");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }


    useEffect(() => {
      registerForPushNotificationsAsync().then((token) => {
        setExpoPushToken(token);
      });

      notificationsListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
         setNotifications((old) => [...old, notification]);
        });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User tapped the notification:", response);
      });

      return () => {
        if (notificationsListener.current) {
          Notifications.removeNotificationSubscription(
            notificationsListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        }
      };
    }, [])

    return {
      expoPushToken,
      notifications,
    };
  };