import React, { useEffect } from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";
import { SafeAreaView, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { useNotificationsContext } from "../context/NotificationsContext";


export default function TempHistory() {
  const records = useHistoricalData();
  const { notifications } = useNotificationsContext();

  // Filter notifications by sensor type "temperature"
  const tempNotifications = notifications.filter((notif) => {
    const sensor = notif.request.content.data?.sensor;
    return sensor === "temperature";
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SensorChart
        title="Temperature History"
        unit="°C"
        color="#f75f00" // orange color
        backgroundColor="#f75f00"
        records={records}
        getValue={(r) => r.temperature}
        maxYValue={50}
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
        {tempNotifications.map((notif, index) => (
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
