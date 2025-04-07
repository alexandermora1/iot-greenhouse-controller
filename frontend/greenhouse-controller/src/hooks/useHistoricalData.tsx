// useHistoricalData.ts
import { useEffect, useState } from "react";
import { onValue, orderByChild, query, ref, startAt } from "firebase/database";
import { database } from "../firebase/firebase";

export interface HistoryData {
  temperature: number;
  humidity: number;
  light: number;
  timestamp: number;
}

/**
 * A custom hook that fetches up to the last 7 days of sensor readings from
 * "/greenhouseHistory" and returns them as a single array of objects, each
 * containing { timestamp, temperature, humidity, light }.
 */
export const useHistoricalData = (): HistoryData[] => {
  const [records, setRecords] = useState<HistoryData[]>([]);

  useEffect(() => {
    // Calculate the cutoff for the last 7 days
    const now = Math.floor(Date.now() / 1000);
    const oneWeekAgo = now - 7 * 24 * 60 * 60;

    // Build a query to get only entries where timestamp >= oneWeekAgo
    const historyRef = ref(database, "greenhouseHistory");
    const weekHistory = query(
      historyRef,
      orderByChild("timestamp"),
      startAt(oneWeekAgo)
    );

    // Listen for changes
    const unsubscribe = onValue(weekHistory, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("No data at greenhouseHistory");
        setRecords([]);
        return;
      }

      const dataObj = snapshot.val();
      const dataArray = Object.values(dataObj) as HistoryData[];

      // Sort by timestamp ascending
      dataArray.sort((a, b) => a.timestamp - b.timestamp);

      // Optional: Filter out invalid or NaN values
      const validItems = dataArray.filter((item) => {
        return (
          Number.isFinite(item.timestamp) &&
          Number.isFinite(item.temperature) &&
          Number.isFinite(item.humidity) &&
          Number.isFinite(item.light)
        );
      });

      // For debugging
      console.log("Fetched records:", validItems);

      setRecords(validItems);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return records;
};
