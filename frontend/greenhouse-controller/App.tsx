import './gesture-handler';
import * as React from 'react';
import { MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import Routes from "./src/routes/Routes";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { MD3DarkTheme as PaperDarkTheme } from "react-native-paper";
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from "./src/context/NotificationsContext";

export default function App() {
  return (
    <PaperProvider theme={PaperDarkTheme}>
      <AuthProvider>
        <NotificationsProvider>
          <NavigationContainer theme={DarkTheme}>
            <Routes />
          </NavigationContainer>
        </NotificationsProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
