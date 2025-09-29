import { HistoryRecord } from "../components/SensorChart";

// Filter by time range
export function filterByRange(records: HistoryRecord[], range: "24h" | "7d") {
  const now = Math.floor(Date.now() / 1000);
  let cutoff = now - 24 * 3600;
  if (range === "7d") {
    cutoff = now - 7 * 24 * 3600;
  }
  return records.filter((r) => r.timestamp >= cutoff);
}