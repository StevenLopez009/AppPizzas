/** UUID v4 con `crypto.randomUUID` (Node 19+ y navegadores modernos). */
export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback simple
  const hex = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += "-";
    else if (i === 14) s += "4";
    else if (i === 19) s += hex[(Math.random() * 4) | (8 & 0xf)];
    else s += hex[(Math.random() * 16) | 0];
  }
  return s;
}
