// NotificationsContext.tsx
import React, { createContext, useContext } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import * as Notifications from "expo-notifications";

interface NotificationsContextType {
  expoPushToken?: Notifications.ExpoPushToken;
  notifications: Notifications.Notification[];
}

const NotificationsContext = createContext<NotificationsContextType>({
  expoPushToken: undefined,
  notifications: [],
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { expoPushToken, notifications = [] } = usePushNotifications();
  return (
    <NotificationsContext.Provider value={{ expoPushToken, notifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  return useContext(NotificationsContext);
}
