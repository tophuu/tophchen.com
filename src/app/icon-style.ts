const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif";

/** Visual match across favicon (32) and apple-touch-icon (180). */
export function appIconDivStyle(canvasPx: number) {
  const scale = canvasPx / 180;
  return {
    width: "100%",
    height: "100%",
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    background: "#1c1c1e",
    color: "#ececed",
    fontFamily: FONT,
    fontSize: Math.round(104 * scale),
    fontWeight: 700 as const,
    letterSpacing: "0.02em",
    borderRadius: Math.round(36 * scale),
  };
}
