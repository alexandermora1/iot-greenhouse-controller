import React, { useState } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { MD3Theme, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { contrastText } from "../utilities/contrastText";
import { filterByRange } from "../utilities/filterByTimeRange";
import { formatTimestamp } from "../utilities/formatTimestamp";
import { getSummaryStats } from "../utilities/getSummaryStats";
import { shift } from "../utilities/shiftHexColor";


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

  // Data prep
  const filtered = filterByRange(records, timeRange);
  const timestamps = filtered.map((r) => r.timestamp);
  const values = filtered.map((r) => getValue(r));
  const { min, max, avg } = getSummaryStats(values);
  const labelStrings = timestamps.map((ts) => formatTimestamp(ts, timeRange));
  const hasValidData = values.length > 0;

  // Possibly skip some labels if large dataset
  function getFormattedLabels() {
    if (labelStrings.length <= 5) {
      return labelStrings;
    }
    const step = Math.ceil(labelStrings.length / 5);
    return labelStrings.map((lbl, i) => (i % step === 0 ? lbl : ""));
  }

  
  // Theme adjustments
  // Background color gradient
  const backgroundColorFrom = backgroundColor ? shift(backgroundColor, -50) : "#014c52"; // darker
  const backgroundColorTo = backgroundColor ? shift(backgroundColor, -10) : "#007982"; // lighter

  const baseTheme = useTheme();
  const buttonsTheme: MD3Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      secondaryContainer: color, // selected background
      onSecondaryContainer: contrastText(color), // makes sure text is readable (enough contrast)
      outline: color, // border & un‑selected label
    },
  };

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`${title} charts and statistics. Shows sensor values for last twenty‑four hours or seven days. Textual summary of important values below chart.`}
    >
      {/* Title */}
      <Text variant="headlineSmall" style={styles.title} accessibilityRole="header">
        {title}
      </Text>

      {/* Buttons to switch time range. */}
      <View style={styles.buttonRow}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={(val) => setTimeRange(val as TimeRange)}
          style={{ flex: 1 }}
          buttons={[
            {
              value: "24h",
              label: "24 Hours",
              accessibilityLabel: "Show last twenty‑four hours",
            },
            {
              value: "7d",
              label: "7 Days",
              accessibilityLabel: "Show last seven days",
            },
          ]}
          theme={buttonsTheme}
        />
      </View>

      {!hasValidData ? (
        <Text>No data available...</Text>
      ) : (
        <>
          {/* The chart */}
          <View importantForAccessibility="no-hide-descendants" accessible={false} /* Makes screen readers skip chart */ >           
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
          </View>

          {/* Textual summary to assist visually impaired users */}
          <View
            style={{
              marginTop: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {min != null && max != null && avg != null ? (
              <Text
                variant="headlineSmall"
                style={{ fontSize: 14 }}
                accessibilityLabel={`${title} summary`}
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
