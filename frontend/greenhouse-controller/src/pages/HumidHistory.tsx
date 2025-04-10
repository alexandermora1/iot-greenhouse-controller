import React from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";

export default function HumidityHistory() {
  const records = useHistoricalData();
  return (
    <SensorChart
      title="Humidity History"
      unit="%"
      color="#3399FF" // blue
      records={records}
      getValue={(r) => r.humidity}
      maxYValue={100} // or whatever max humidity is
    />
  );
}
