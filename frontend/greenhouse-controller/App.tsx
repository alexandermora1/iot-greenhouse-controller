import './gesture-handler';
import * as React from 'react';
import { MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import Routes from "./src/routes/Routes";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { MD3DarkTheme as PaperDarkTheme } from "react-native-paper";
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  return (
    <PaperProvider theme={PaperDarkTheme}>
      <AuthProvider>
        <NavigationContainer theme={DarkTheme}>
          <Routes />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
