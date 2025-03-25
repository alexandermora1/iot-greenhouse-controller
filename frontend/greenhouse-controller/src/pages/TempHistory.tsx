import { DataSnapshot, limitToLast, onChildAdded, onValue, query, ref } from "firebase/database";
import React, { useEffect } from "react";
import { Dimensions, View } from "react-native";
import { Text } from "react-native-paper";
import { database } from "../firebase/firebase";
import { LineChart } from "react-native-chart-kit";
import { useHistoricalData } from "../hooks/useHistoricalData";


const chartConfig = {
  backgroundGradientFrom: "#014c52",
  backgroundGradientFromOpacity: 0.6,
  backgroundGradientTo: "#007982",
  backgroundGradientToOpacity: 0.6,
  color: (opacity = 1) => `rgba(0, 238, 255, ${opacity})`,
  strokeWidth: 3, // optional, default 3
  barPercentage: 1,
  useShadowColorFromDataset: false // optional
};


const TempHistory = () => {
  const { timestamps, temperatures } = useHistoricalData();

  return (
    <View style={{ margin: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        Temperature History
      </Text>

      <LineChart
        data={{
          labels: timestamps,
          datasets: [
            {
              data: temperatures 
            }
          ]
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  )
}

export default TempHistory;
