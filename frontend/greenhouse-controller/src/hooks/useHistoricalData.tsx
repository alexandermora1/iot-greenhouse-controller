import { onValue, orderByChild, query, ref, startAt } from "firebase/database";
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
  const [temperatures, setTemperatures] = useState<number[]>([]);
  const [humidities, setHumidities] = useState<number[]>([]);
  const [light, setLight] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState <string[]>([]);

  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - 7 * 24 * 60 * 60; // now minus one week in seconds (604800 seconds)

  useEffect(() => {
    const historyRef = ref(database, "greenhouseHistory");
    const weekHistory = query(historyRef, orderByChild("timestamp"), startAt(oneWeekAgo));

    // Listen for changes in /greenhouseHistory
    const unsubscribe = onValue(weekHistory, (snapshot) => {
      if (!snapshot.exists()) {
        console.log("No data at greenhouseHistory");
        setTimestamps([]);
        setTemperatures([]);
        setHumidities([]);
        setLight([]);
        return;
      }
      // Convert object to an array
      const dataObj = snapshot.val();
      const dataArray = Object.values(dataObj) as HistoryData[];

      // Sort by timestamp
      dataArray.sort((a, b) => a.timestamp - b.timestamp);

      // Build new label array (converted to "HH:MM")
      const newTimes = dataArray.map((item) => formatTimestampToHour(item.timestamp));

      // Build new sensor arrays
      const newTemps = dataArray.map((item) => item.temperature);
      const newHumids = dataArray.map((item) => item.humidity);
      const newLights = dataArray.map((item) => item.light);

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