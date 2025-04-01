import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import StatusScreen from "../pages/StatusScreen";
import HumidHistory from "../pages/HumidHistory";
import LightHistory from "../pages/LightHistory";
import TempHistory from "../pages/TempHistory";
import { LoginScreen } from "../pages/LoginScreen";
import { useTheme } from "react-native-paper";
import { useAuth } from "../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Temperature: undefined;
  Humidity: undefined;
  Light: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        // Authenticated stack
        <>
          <Stack.Screen name="Home" component={StatusScreen} />
          <Stack.Screen name="Temperature" component={TempHistory} />
          <Stack.Screen name="Humidity" component={HumidHistory} />
          <Stack.Screen name="Light" component={LightHistory} />
        </>
      ) : (
        // Non-authenticated stack
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}