import { onValue, orderByChild, query, ref, startAt } from "firebase/database";
import { database } from "../firebase/firebase";
import { useEffect, useRef, useState } from "react";

const formatTimestampToHour = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  console.log("date to string: ", date.toString());
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

      dataArray.sort((a, b) => a.timestamp - b.timestamp);
      
      const validItems = dataArray.filter(
        (item) =>
          Number.isFinite(item.timestamp) &&
          Number.isFinite(item.temperature) &&
          Number.isFinite(item.humidity) &&
          Number.isFinite(item.light) &&
          !isNaN(item.temperature) &&
          !isNaN(item.humidity) &&
          !isNaN(item.light) &&
          isFinite(item.temperature) &&
          isFinite(item.humidity) &&
          isFinite(item.light)
      );

      const newTimes = validItems.map((item) => formatTimestampToHour(item.timestamp));
      console.log("newTimes: ", newTimes);
      
      const newTemps = validItems.map((item) => item.temperature);
      const newHumids = validItems.map((item) => item.humidity);
      const newLights = validItems.map((item) => item.light);

      if (!validItems.length) {
        setTimestamps([]);
        setTemperatures([]);
        setHumidities([]);
        setLight([]);
        return;
      }

      console.log("time:", newTimes);
      console.log("temp:", newTemps);
      console.log("hum:", newHumids);
      console.log("light:", newLights);

      setTimestamps(newTimes);
      setTemperatures(newTemps);
      setHumidities(newHumids);
      setLight(newLights);
    });

    return () => unsubscribe();
  }, []);

  return { timestamps, temperatures, humidities, light };
}