import { DataSnapshot, limitToLast, onChildAdded, onValue, query, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
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
  const [displayLabels, setDisplayLabels] = useState<string[]>([]);

  const { timestamps, temperatures } = useHistoricalData();

  if (timestamps.length !== temperatures.length) {
    console.warn("Label/data length mismatch");
  }

  const hasValidData =
    timestamps.length > 0 &&
    temperatures.length > 0 &&
    timestamps.length === temperatures.length;

  // To limit label clutter on the x-axis of the chart
  // For more than 5 data points, only show ~5 labels
  const getFormattedLabels = () => {
    if (timestamps.length <= 5) {
      return timestamps;
    }
    const step = Math.ceil(timestamps.length / 5);
    return timestamps.map((label, index) => (index % step === 0 ? label : ""));
  };

  return (
    <View style={{ margin: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        Temperature History
      </Text>

      {!hasValidData ? (
        <Text>No temperature history available...</Text>
      ) : (
        <LineChart
          data={{
            labels: getFormattedLabels(),
            datasets: [
              {
                data: temperatures.length > 0 ? temperatures : [0],
              },
              {
                // "Dummy" dataset to push the y-axis to 50
                data: [50],
                color: (opacity = 1) => `rgba(0,0,0,0)`, 
                withDots: false,
              },
            ],
          }}
          width={Dimensions.get("window").width - 32}
          height={220}
          fromZero={true}
          chartConfig={{
            ...chartConfig,
            propsForLabels: {
              fontSize: 12,
            },
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      )}
    </View>
  );
}

export default TempHistory;
