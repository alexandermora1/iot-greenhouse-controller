import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text, Avatar } from "react-native-paper";
import { ScrollView, View, StyleSheet } from "react-native";
import { database } from "../firebase/firebase";
import * as Notifications from "expo-notifications";
import { ref, query, limitToLast, onValue, DataSnapshot } from "firebase/database";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../routes/Routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotificationsContext } from "../context/NotificationsContext";

export default function StatusScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { notifications } = useNotificationsContext();

  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null);
  const [lastLowTempNotify, setLastLowTempNotify] = useState<number | null>(null);
  const [lastHighHumidNotify, setLastHighHumidNotify] = useState<number | null>(null);
  const [lastLowLightNotify, setLastLowLightNotify] = useState<number | null>(null);


  // Fetch sensor data
  useEffect(() => {
    // Query that fetches only the last entry from greenhouseHistory
    const historyRef = ref(database, "greenhouseHistory");
    const lastOneQuery = query(historyRef, limitToLast(1));

    // Subscribe to changes
    const unsubscribe = onValue(lastOneQuery, (snapshot: DataSnapshot) => {
      if (!snapshot.exists()) {
        setTemperature(null);
        setHumidity(null);
        setLight(null);
        setLastReadingTime(null);
        return;
      }

      const dataObj = snapshot.val();
      const keys = Object.keys(dataObj);
      const lastKey = keys[0]; 
      const record = dataObj[lastKey];

      setTemperature(typeof record.temperature === "number" ? record.temperature : null);
      setHumidity(typeof record.humidity === "number" ? record.humidity : null);
      setLight(typeof record.light === "number" ? record.light : null);
      setLastReadingTime(typeof record.timestamp === "number" ? record.timestamp : null);
    });

    return () => unsubscribe();
  }, []);

  // Helper to format epoch time in seconds to a short string e.g.: "Apr 9, 14:50"
  function formatReadingTime(epochSec: number) {
    const date = new Date(epochSec * 1000);

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }


  // Push notifications
  useEffect(() => {
    const historyRef = ref(database, "/greenhouseHistory");
    const lastOneQuery = query(historyRef, limitToLast(1));

    const unsubscribe = onValue(lastOneQuery, (snapshot) => {
      if (!snapshot.exists()) return;

      const dataObj = snapshot.val();
      const keys = Object.keys(dataObj);
      const lastKey = keys[0];
      const record = dataObj[lastKey];

      const readingTime = record.timestamp ?? null;

      checkLowTemp(record.temperature, readingTime);
      checkHighHumidity(record.humidity, readingTime);
      checkLowLight(record.light, readingTime);
    });

    return () => unsubscribe();
  }, [
    lastLowTempNotify, // re-run if these states change
    lastHighHumidNotify,
    lastLowLightNotify,
  ]);

  // Notification sensor value checks
  function checkLowTemp(temp: number, readingTime: number | null) {
      console.log(`checkLowTemp called. Value = ${temp}`);
      if (temp < 10 && hasDayPassedSince(lastLowTempNotify)) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Heater switched on",
            body: `${
              readingTime ? formatReadingTime(readingTime) : "Unknown time"
            }: Heater ON – greenhouse is cold (${temp.toFixed(1)} °C)`,
            data: { sensor: "temperature" },
          },
          trigger: null,
        });
        setLastLowTempNotify(Date.now());
      }
    }

  function checkHighHumidity(humidity: number, readingTime: number | null) {
      console.log(`checkHighHumidity called. Value = ${humidity}`);
      if (humidity > 80 && hasDayPassedSince(lastHighHumidNotify)) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Ventilation opened",
            body: `${
              readingTime ? formatReadingTime(readingTime) : "Unknown time"
            }: Ventilation OPENED – humidity high (${humidity.toFixed(1)}%)`,
            data: { sensor: "humidity" },
          },
          trigger: null,
        });
        setLastHighHumidNotify(Date.now());
      }
    }

  function checkLowLight(light: number, readingTime: number | null) {
      console.log(`checkLowLight called. Value = ${light}`);
      if (light < 200 && hasDayPassedSince(lastLowLightNotify)) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Grow‑lights on",
            body: `${
              readingTime ? formatReadingTime(readingTime) : "Unknown time"
            }: Grow‑lights ON – low daylight ${light} L)`,
            data: { sensor: "light" },
          },
          trigger: null,
        });
        setLastLowLightNotify(Date.now());
      }
    }

  function hasDayPassedSince(lastTime: number | null): boolean {
    if (!lastTime) return true; 
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return Date.now() - lastTime >= ONE_DAY;
  }


  return (
    <SafeAreaView style={{ padding: 8, flex: 1 }}>
      <View style={styles.profileContainer}>
        <Avatar.Image
          size={80}
          source={require("../../assets/alex_avatar.jpeg")}
          accessibilityLabel="Profile picture"
        />
        <Text
          variant="headlineSmall"
          style={{ marginTop: 8 }}
          accessibilityRole="header"
        >
          Hello Alex!
        </Text>
      </View>

      <View style={styles.sensorRow}>
        {/* Temperature Card */}
        <Card
          mode="contained"
          accessibilityRole="button"
          accessibilityLabel={`Current temperature: ${temperature}°C. Double‑tap for details.`}
          style={[
            styles.sensorCard,
            { backgroundColor: SENSOR_COLORS.temperature },
          ]}
          onPress={() => navigation.navigate("Temperature")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons
              name="thermometer"
              size={32}
              color={contrastText(SENSOR_COLORS.temperature)}
              importantForAccessibility="no-hide-descendants"
            />
            <Text
              variant="headlineSmall"
              style={{ color: contrastText(SENSOR_COLORS.temperature) }}
            >
              {temperature !== null ? temperature.toFixed(1) : "N/A"}
            </Text>
            {temperature !== null && (
              <Text
                variant="bodyMedium"
                style={{ color: contrastText(SENSOR_COLORS.temperature) }}
              >
                °C
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Humidity Card */}
        <Card
          mode="contained"
          accessibilityRole="button"
          accessibilityLabel={`Current humidity: ${humidity}%. Double‑tap for details.`}
          style={[
            styles.sensorCard,
            { backgroundColor: SENSOR_COLORS.humidity },
          ]}
          onPress={() => navigation.navigate("Humidity")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons
              name="water-percent"
              size={32}
              color={contrastText(SENSOR_COLORS.humidity)}
              importantForAccessibility="no-hide-descendants"
            />
            <Text
              variant="headlineSmall"
              style={{ color: contrastText(SENSOR_COLORS.humidity) }}
            >
              {humidity !== null ? humidity.toFixed(1) : "N/A"}
            </Text>
            {humidity !== null && (
              <Text
                variant="bodyMedium"
                style={{ color: contrastText(SENSOR_COLORS.humidity) }}
              >
                %
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Light Card */}
        <Card
          mode="contained"
          accessibilityRole="button"
          accessibilityLabel={`Current light: ${light}L. Double‑tap for details.`}
          style={[styles.sensorCard, { backgroundColor: SENSOR_COLORS.light }]}
          onPress={() => navigation.navigate("Light")}
        >
          <Card.Content style={styles.sensorCardContent}>
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={32}
              color={contrastText(SENSOR_COLORS.light)}
              importantForAccessibility="no-hide-descendants"
            />
            <Text
              variant="headlineSmall"
              style={{ color: contrastText(SENSOR_COLORS.light) }}
            >
              {light !== null ? light : "N/A"}
            </Text>
            {light !== null && (
              <Text
                variant="bodyMedium"
                style={{ color: contrastText(SENSOR_COLORS.light) }}
              >
                L
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Show last reading time if present */}
      {lastReadingTime && (
        <View style={{ marginTop: 16, margin: 4 }}>
          <Text variant="bodyLarge">
            Last sensor update: {formatReadingTime(lastReadingTime)}
          </Text>
        </View>
      )}

      {/* Notifications */}
      <ScrollView style={{ flex: 1, margin: 4, marginTop: 36 }}>
        {/* Heading */}
        <Text
          style={{ marginBottom: 8 }}
          variant="titleLarge"
          accessibilityRole="header"
        >
          Notifications
        </Text>

        {/* Notification cards */}
        {notifications.map((notif, index) => (
          <Card key={index} style={{ marginBottom: 8 }}>
            <Card.Title title={notif.request.content.title} />
            <Card.Content>
              <Text>{notif.request.content.body}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


// temperature → orange, humidity → blue, light → grey/white
const SENSOR_COLORS = {
  temperature: "#f75f00",
  humidity: "#00ddff",
  light: "#FFFFFF", // very‑light grey so the white icon is still visible
};

// returns black for light backgrounds, white for dark
function contrastText(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}



const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 36,
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
