import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { database } from "../firebase/firebase";
import { RootStackParamList } from "../routes/Routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function StatusScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [light, setLight] = useState<number | null>(null);
  const [lastReadingTime, setLastReadingTime] = useState<number | null>(null);

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
      const lastKey = keys[0]; // Should only be 1 key here
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
        {/* Temperature Card */}
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

        {/* Humidity Card */}
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

        {/* Light Card */}
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

      {/* Show last reading time if present */}
      {lastReadingTime && (
        <View style={{ marginTop: 16 }}>
          <Text variant="bodyLarge">
            Last sensor update: {formatReadingTime(lastReadingTime)}
          </Text>
        </View>
      )}

      {/* Example notifications (placeholder) */}
      <ScrollView style={{ flex: 1, margin: 4, marginTop: 36 }}>
        <Text style={{ marginBottom: 8 }} variant="titleLarge">
          Notifications
        </Text>
        <Card style={styles.notificationCard}>
          <Card.Title title="Temperature low" />
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.notificationCard}>
          <Card.Title title="Temperature low" />
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.notificationCard}>
          <Card.Title title="Temperature low" />
          <Card.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
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
