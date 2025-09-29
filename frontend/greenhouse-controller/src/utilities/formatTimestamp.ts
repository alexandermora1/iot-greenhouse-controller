// Format timestamps differently for 24h vs 7d
export function formatTimestamp(ts: number, range: "24h" | "7d") {
  const date = new Date(ts * 1000);
  if (range === "24h") {
    // e.g. "14:45"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else {
    // e.g. "Mon", or "Mar 30"
    return date.toLocaleDateString([], { weekday: "long" });
  }
}