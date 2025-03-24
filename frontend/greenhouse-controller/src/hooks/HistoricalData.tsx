import { onValue, ref } from "firebase/database";
import { database } from "../firebase/firebase";
import { useEffect, useRef, useState } from "react";

const formatTimestampToHour = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"} )
  }

interface HistoryData {
  temperature: number;
  humidity: number;
  light: number;
  timestamp: number;
}

export const useHistoricalData = () => {
  const [temperatures, setTemperatures] = useState <number[]>([]);
  const [timestamps, setTimestamps] = useState <string[]>([]);

  useEffect(() => {
    const historyRef = ref(database, "greenhouseHistory");
    // Listen for changes in /greenhouseHistory
    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("No data at greenhouseHistory");
        setTimestamps([]);
        setTemperatures([]);
        return;
      }
      // Convert object to an array
      const dataObj = snapshot.val();
      const dataArray = Object.values(dataObj) as HistoryData[];

      // Sort by timestamp
      dataArray.sort((a, b) => a.timestamp - b.timestamp);

      // Build new label array (converted to "HH:MM")
      const newTimes = dataArray.map((item) => formatTimestampToHour(item.timestamp));

      // Build new temperature array
      const newTemps = dataArray.map((item) => item.temperature);

      console.log("Labels:", newTimes);
      console.log("Temps:", newTemps);

      // Update state
      setTimestamps(newTimes);
      setTemperatures(newTemps);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { timestamps, temperatures };
}