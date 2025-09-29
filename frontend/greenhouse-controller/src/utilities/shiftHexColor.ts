// Darken or lighten a hex colour by `percent` (‑100 ➜ black, 100 ➜ white)
export function shift(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = (num >> 16) + amt;
  const g = ((num >> 8) & 0xff) + amt;
  const b = (num & 0xff) + amt;
  return (
    '#' +
    (0x1000000 +
      (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 1 ? 0 : b) : 255))
      .toString(16)
      .slice(1)
  );
}