// Compute min, max, average for textual summary
export function getSummaryStats(data: number[]) {
  if (data.length === 0) {
    return { min: null, max: null, avg: null };
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const avg = sum / data.length;
  return { min, max, avg };
}