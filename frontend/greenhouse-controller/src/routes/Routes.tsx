
import React from "react";
import { createStaticNavigation, NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import StatusScreen from "../pages/StatusScreen";
import HumidHistory from "../pages/HumidHistory";
import LightHistory from "../pages/LightHistory";
import TempHistory from "../pages/TempHistory";
import { useTheme } from "react-native-paper";



export type RootStackParamList = {
  Home: undefined;
  Temperature: undefined;
  Humidity: undefined;
  Light: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Routes() {
  const theme = useTheme();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={StatusScreen}/>
      <Stack.Screen name="Temperature" component={TempHistory}/>
      <Stack.Screen name="Humidity" component={HumidHistory}/>
      <Stack.Screen name="Light" component={LightHistory}/>
    </Stack.Navigator>
  )
};