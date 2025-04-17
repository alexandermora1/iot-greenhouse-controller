import React, { useState } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Button, SegmentedButtons, Text } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";


export interface HistoryRecord {
  timestamp: number;
  temperature: number;
  humidity: number;
  light: number;
}

type TimeRange = "24h" | "7d";

interface SensorChartProps {
  title: string; 
  unit: string; 
  color: string;
  records: HistoryRecord[]; 
  getValue: (rec: HistoryRecord) => number; 
  maxYValue?: number; 
}

export default function SensorChart({
  title,
  unit,
  color,
  records,
  getValue,
  maxYValue = 50, // default y-axis push if needed
}: SensorChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");

  // 1) Filter records by time range
  const filtered = filterByRange(records, timeRange);

  // 2) Build numeric arrays
  const timestamps = filtered.map((r) => r.timestamp);
  const values = filtered.map((r) => getValue(r));

  // 3) Compute summary stats
  const { min, max, avg } = getSummaryStats(values);

  // 4) Create chart labels
  const labelStrings = timestamps.map((ts) => formatTimestamp(ts, timeRange));

  // 5) Possibly skip some labels if large dataset
  function getFormattedLabels() {
    if (labelStrings.length <= 5) {
      return labelStrings;
    }
    const step = Math.ceil(labelStrings.length / 5);
    return labelStrings.map((lbl, i) => (i % step === 0 ? lbl : ""));
  }

  const hasValidData = values.length > 0;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>

      {/* Buttons to switch time range. */}
      <View style={styles.buttonRow}>
        <SegmentedButtons
          value={timeRange} 
          onValueChange={(val) => setTimeRange(val as TimeRange)}
          style={{ flex: 1 }}
          buttons={[
            { value: "24h", label: "24 Hours" },
            { value: "7d", label: "7 Days" },
          ]}
        />
      </View>

      {!hasValidData ? (
        <Text>No data available...</Text>
      ) : (
        <>
          {/* The chart */}
          <LineChart
            data={{
              labels: getFormattedLabels(),
              datasets: [
                {
                  data: values.length > 0 ? values : [0],
                  withDots: false,
                  color: (opacity = 1) => color, // use the chart color
                  strokeWidth: 3,
                },
                {
                  // "Dummy" dataset if there is a need to push the y-axis
                  data: [maxYValue],
                  withDots: false,
                  color: () => "rgba(0,0,0,0)",
                },
              ],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            fromZero
            chartConfig={{
              backgroundGradientFrom: "#014c52",
              backgroundGradientFromOpacity: 0.6,
              backgroundGradientTo: "#007982",
              backgroundGradientToOpacity: 0.6,
              color: (opacity = 1) => color, // line color
              strokeWidth: 3,
              barPercentage: 1,
              useShadowColorFromDataset: false,
              propsForBackgroundLines: {
                strokeWidth: 0,
              },
              decimalPlaces: 0,
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />

          {/* Textual summary to assist visually impaired users */}
          <View style={{ marginTop: 8 }}>
            {min != null && max != null && avg != null ? (
              <Text
                variant="bodyMedium"
                accessibilityLabel={`${title} Summary`}
              >
                Highest: {max.toFixed(1)} {unit} | Lowest: {min.toFixed(1)}{" "}
                {unit} | Average: {avg.toFixed(1)} {unit}
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

// Helper: filter by time range
function filterByRange(records: HistoryRecord[], range: "24h" | "7d") {
  const now = Math.floor(Date.now() / 1000);
  let cutoff = now - 24 * 3600;
  if (range === "7d") {
    cutoff = now - 7 * 24 * 3600;
  }
  return records.filter((r) => r.timestamp >= cutoff);
}

// Helper: Format timestamps differently for 24h vs 7d
function formatTimestamp(ts: number, range: "24h" | "7d") {
  const date = new Date(ts * 1000);
  if (range === "24h") {
    // e.g. "14:45"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    // e.g. "Mon", or "Mar 30"
    return date.toLocaleDateString([], { weekday: "long" });
  }
}

// Compute min, max, average for textual summary
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

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginVertical: 8,
  },
});
