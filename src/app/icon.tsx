import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1c1e",
          color: "#ececed",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          borderRadius: 14,
        }}
      >
        tc
      </div>
    ),
    {
      ...size,
    },
  );
}
