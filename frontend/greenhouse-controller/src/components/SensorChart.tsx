import React, { useState } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Button, MD3Theme, SegmentedButtons, Text, useTheme } from "react-native-paper";
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
  backgroundColor: string;
  records: HistoryRecord[]; 
  getValue: (rec: HistoryRecord) => number; 
  maxYValue?: number; 
}


export default function SensorChart({
  title,
  unit,
  color,
  backgroundColor,
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

  // Background color gradient
  const backgroundColorFrom = backgroundColor ? shift(backgroundColor, -50) : "#014c52"; // darker
  const backgroundColorTo = backgroundColor ? shift(backgroundColor, -10) : "#007982"; // lighter

  const baseTheme = useTheme();
  const buttonsTheme: MD3Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      secondaryContainer: color, // selected background
      onSecondaryContainer: contrastText(color), // selected text/icon
      outline: color, // border & un‑selected label
    },
  };

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
          theme={buttonsTheme}
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
              backgroundGradientFrom: backgroundColorFrom,
              backgroundGradientFromOpacity: 0.4,
              backgroundGradientTo: backgroundColorTo,
              backgroundGradientToOpacity: 0.7,
              color: (opacity = 1) => color, // line color
              strokeWidth: 4,
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
          <View style={{ marginTop: 8, justifyContent: "center", alignItems: "center" }}>
            {min != null && max != null && avg != null ? (
              <Text
                  variant="headlineSmall"
                  style={{ fontSize: 14 }}
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

// Filter by time range
function filterByRange(records: HistoryRecord[], range: "24h" | "7d") {
  const now = Math.floor(Date.now() / 1000);
  let cutoff = now - 24 * 3600;
  if (range === "7d") {
    cutoff = now - 7 * 24 * 3600;
  }
  return records.filter((r) => r.timestamp >= cutoff);
}

// Format timestamps differently for 24h vs 7d
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

// Darken or lighten a hex colour by `percent` (‑100 ➜ black, 100 ➜ white)
function shift(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = (num >> 16) + amt;
  const g = ((num >> 8) & 0xff) + amt;
  const b = (num & 0xff) + amt;
  return (
    '#' +
    (0x1000000 +
      (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 1 ? 0 : b) : 255))
      .toString(16)
      .slice(1)
  );
}

// Black text on light background and white on dark
function contrastText(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000" : "#fff"; // light bg → black text
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
