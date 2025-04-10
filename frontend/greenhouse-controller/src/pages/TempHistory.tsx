import React from "react";
import SensorChart, { HistoryRecord } from "../components/SensorChart";
import { useHistoricalData } from "../hooks/useHistoricalData";


export default function TempHistory() {
  const records = useHistoricalData(); 

  
  return (
    <SensorChart
      title="Temperature History"
      unit="°C"
      color="#FF9900" // orange color
      records={records}
      getValue={(r) => r.temperature}
      maxYValue={50}
    />
  );
}
