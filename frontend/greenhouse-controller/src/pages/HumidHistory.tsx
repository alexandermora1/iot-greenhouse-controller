import React from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";
import { SafeAreaView, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { useNotificationsContext } from "../context/NotificationsContext";

export default function HumidityHistory() {
  const records = useHistoricalData();
  const { notifications } = useNotificationsContext();

  // Filter notifications by sensor type "humidity"
  const humidNotifications = notifications.filter((notif) => {
    const sensor = notif.request.content.data?.sensor;
    return sensor === "humidity";
  });

  return (
    <SafeAreaView>
      <SensorChart
        title="Humidity History"
        unit="%"
        color="#00ddff"
        backgroundColor="#00ddff"
        records={records}
        getValue={(r) => r.humidity}
        maxYValue={100}
      />

      {/* Notifications */}
      <ScrollView style={{ margin: 16, marginTop: 36 }}>
        {/* Heading */}
        <Text
          style={{ marginBottom: 8 }}
          variant="titleLarge"
          accessibilityRole="header"
        >
          Notifications
        </Text>

        {/* Notification cards */}
        {humidNotifications.map((notif, index) => (
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
