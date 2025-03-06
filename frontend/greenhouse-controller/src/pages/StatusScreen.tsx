// StatusScreen.tsx
import React from 'react';
import { View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

export default function StatusScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Sensor Readings" subtitle="Current greenhouse status" />
        <Card.Content>
          <Text variant="bodyMedium">Temperature: 24°C</Text>
          <Text variant="bodyMedium">Humidity: 55%</Text>
        </Card.Content>
      </Card>
    </View>
  );
}
