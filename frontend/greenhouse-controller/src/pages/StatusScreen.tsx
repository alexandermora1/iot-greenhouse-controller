import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text, Avatar, useTheme } from "react-native-paper";
import { ScrollView, View, StyleSheet, useColorScheme } from "react-native";
import { database } from "../firebase/firebase";
import { ref, onValue, DataSnapshot } from "firebase/database";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../routes/Routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";



export default function StatusScreen() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const currentRef = ref(database, '/greenhouseCurrent');

    const unsubscribe = onValue(currentRef, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("data: ", data);
        setTemperature(data.temperature ?? null);
        setHumidity(data.humidity ?? null);
        setLight(data.light ?? null);
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <SafeAreaView style={{ padding: 8, flex: 1 }}>
      <View style={styles.profileContainer}>
        <Avatar.Image
          size={64}
          source={require("../../assets/alex_avatar.jpeg")}
        />
        <Text style={{ marginTop: 8 }}>Hello Alex!</Text>
      </View>

      <View style={styles.sensorRow}>
        <Card
          mode="contained"
          style={styles.sensorCard}
          onPress={() => navigation.navigate("Temperature")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons name="thermometer" size={32} />
            <Text variant="headlineSmall">
              {temperature !== null ? temperature.toFixed(1) : "N/A"}
            </Text>
            {temperature !== null && <Text variant="bodyMedium">°C</Text>}
          </Card.Content>
        </Card>

        
        <Card
          mode="contained"
          style={styles.sensorCard}
          onPress={() => navigation.navigate("Humidity")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons name="water-percent" size={32} />
            <Text variant="headlineSmall">
              {humidity !== null ? humidity.toFixed(1) : "N/A"}
            </Text>
            {humidity !== null && <Text variant="bodyMedium">%</Text>}
          </Card.Content>
        </Card>


        <Card
          mode="contained"
          style={styles.sensorCard}
          onPress={() => navigation.navigate("Light")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons name="lightbulb-on" size={32} />
            <Text variant="headlineSmall">
              {light !== null ? light : "N/A"}
            </Text>
            {light !== null && <Text variant="bodyMedium">Lux</Text>}
          </Card.Content>
        </Card>
      </View>

      
      <ScrollView style={{ flex: 1, margin: 4, marginTop: 36 }}>
        <Text style={{ marginBottom: 8 }} variant="titleLarge">
          Notifications
        </Text>
        <Card style={{ marginBottom: 8 }}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.{" "}
            </Text>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: 8 }}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.{" "}
            </Text>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: 8 }}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.{" "}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 0.3,
  },
  sensorCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  sensorCardContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCard: {
    marginBottom: 8,
  },
});