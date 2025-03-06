import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Text, Avatar } from "react-native-paper";
import { ScrollView, View } from "react-native";

export default function StatusScreen() {
  return (
    <SafeAreaView style={{ padding: 8, flex: 1 }}>
      <View style={{alignItems: "center", justifyContent: "center", marginTop: 36, marginBottom: 36}}>
        <Avatar.Image size={64} source={require("../../assets/alex_avatar.jpeg")} />
        <Text style={{marginTop: 8}}>Hello Alex!</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
        <Card style={{ flex: 1, marginHorizontal: 4 }}>
          <Card.Content>
            <Text variant="bodyMedium">Temperature:</Text>
            <Text variant="bodyMedium">24°C</Text>
          </Card.Content>
        </Card>
        <Card style={{ flex: 1, marginHorizontal: 4 }}>
          <Card.Content>
            <Text variant="bodyMedium">Humidity:</Text>
            <Text variant="bodyMedium">55%</Text>
          </Card.Content>
        </Card>
        <Card style={{ flex: 1, marginHorizontal: 4 }}>
          <Card.Content>
            <Text variant="bodyMedium">Light:</Text>
            <Text variant="bodyMedium">65%</Text>
          </Card.Content>
        </Card>
      </View>

      <ScrollView style={{ flex: 1, margin: 4, marginTop: 36}}>
        <Text style={{marginBottom: 8}} variant="titleLarge">Notifications</Text>
        <Card style={{ marginBottom: 8}}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. </Text>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: 8}}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. </Text>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: 8}}>
          <Card.Title title="Temperature low"></Card.Title>
          <Card.Content>
            <Text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
