import React from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";
import { SafeAreaView, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { useNotificationsContext } from "../context/NotificationsContext";

export default function LightHistory() {
  const records = useHistoricalData();
  const { notifications } = useNotificationsContext();

  // Filter notifications by sensor type "temperature"
  const lightNotifications = notifications.filter((notif) => {
    const sensor = notif.request.content.data?.sensor;
    return sensor === "light";
  });

  return (
    <SafeAreaView>
      <SensorChart
        title="Light History"
        unit="L"
        color="#FFFFFF"
        backgroundColor="#FFFFFF"
        records={records}
        getValue={(r) => r.light}
        maxYValue={10000}
      />

      {/* Notifications */}
      <ScrollView style={{ margin: 16, marginTop: 36 }}>
        {/* Heading */}
        <Text style={{ marginBottom: 8 }} variant="titleLarge">
          Notifications
        </Text>

        {/* Notification cards */}
        {lightNotifications.map((notif, index) => (
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
