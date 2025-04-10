import React from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";

export default function LightHistory() {
  const records = useHistoricalData();
  return (
    <SensorChart
      title="Light History"
      unit="Lux"
      color="#FFFFFF" // white
      records={records}
      getValue={(r) => r.light}
      maxYValue={2000}
    />
  );
}
