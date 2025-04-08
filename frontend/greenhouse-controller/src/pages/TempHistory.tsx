import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { HistoryData, useHistoricalData } from "../hooks/useHistoricalData";

const chartConfig = {
  backgroundGradientFrom: "#014c52",
  backgroundGradientFromOpacity: 0.6,
  backgroundGradientTo: "#007982",
  backgroundGradientToOpacity: 0.6,
  color: (opacity = 1) => `rgba(0, 238, 255, 0.8)`,
  strokeWidth: 3,
  barPercentage: 1,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    strokeWidth: "0"
  },
};

type TimeRange = "24h" | "7d";

export default function TempHistory() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // Retrieve data array from your custom hook (last 7 days)
  const records = useHistoricalData();

  // Filter records to last 24h or 7d
  const filteredRecords = filterByRange(records, timeRange);

  // Build numeric arrays
  const timestampsArray = filteredRecords.map((item) => item.timestamp);
  const temperaturesArray = filteredRecords.map((item) => item.temperature);

  // Compute summary stats
  const { min, max, avg } = getSummaryStats(temperaturesArray);

  // Convert numeric timestamps to strings, passing the range so we can format differently
  const labels = timestampsArray.map((ts) => formatTimestamp(ts, timeRange));

  // If the data is huge, skip some labels
  const getFormattedLabels = () => {
    if (labels.length <= 5) {
      return labels;
    }
    const step = Math.ceil(labels.length / 5);
    return labels.map((label, index) => (index % step === 0 ? label : ""));
  };

  // Check for zero data
  const hasValidData =
    temperaturesArray.length > 0 &&
    timestampsArray.length === temperaturesArray.length;

  return (
    <View style={{ margin: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        Temperature History
      </Text>

      {/* Buttons to choose time range. Needs proper styling. */}
      <View style={{ flexDirection: "row", marginVertical: 8 }}>
        <Button
          mode={timeRange === "24h" ? "contained" : "outlined"}
          onPress={() => setTimeRange("24h")}
        >
          24 Hours
        </Button>
        <Button
          mode={timeRange === "7d" ? "contained" : "outlined"}
          onPress={() => setTimeRange("7d")}
        >
          7 Days
        </Button>
      </View>

      {!hasValidData ? (
        <Text>No temperature history available...</Text>
      ) : (
        <>
          <LineChart
            data={{
              labels: getFormattedLabels(),
              datasets: [
                {
                  data: temperaturesArray.length > 0 ? temperaturesArray : [0],
                  withDots: false, // hide dots if you want
                },
                {
                  // "Dummy" dataset to push the y-axis to 50, if needed
                  data: [50],
                  withDots: false,
                  color: () => "rgba(0,0,0,0)",
                },
              ],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            fromZero
            chartConfig={chartConfig}
            style={{ marginVertical: 8, borderRadius: 16 }}
            bezier
          />

          {/* The textual summary for accessibility (and quick overview) */}
          <View style={{ marginTop: 8 }}>
            {min != null && max != null && avg != null ? (
              <Text
                variant="bodyMedium"
                accessibilityLabel="Temperature Summary"
              >
                Highest: {max.toFixed(1)} °C | Lowest: {min.toFixed(1)} °C |
                Average: {avg.toFixed(1)} °C
              </Text>
            ) : (
              <Text variant="bodyMedium">No valid data to summarize.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

/**
 * Filter the records array to only last 24h or last 7 days
 */
function filterByRange(records: HistoryData[], range: "24h" | "7d") {
  const now = Math.floor(Date.now() / 1000);
  let cutoff = now - 24 * 3600; // default to 24h

  if (range === "7d") {
    cutoff = now - 7 * 24 * 3600;
  }
  return records.filter((rec) => rec.timestamp >= cutoff);
}

/**
 * Format the timestamp differently depending on the range.
 * "24h" => e.g., "14:45"
 * "7d"  => e.g., "Mon" or "Mar 30"
 */
function formatTimestamp(ts: number, range: "24h" | "7d") {
  const date = new Date(ts * 1000);
  if (range === "24h") {
    // HH:MM
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    // e.g., day of week or short date
    // "short" weekday => "Mon", "Tue"
    // or "month: 'short', day: 'numeric'" => "Mar 30"
    return date.toLocaleDateString([], { weekday: "long" });
  }
}

function getSummaryStats(data: number[]) {
  if (data.length === 0) {
    return { min: null, max: null, avg: null };
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.length;

  return { min, max, avg };
}
