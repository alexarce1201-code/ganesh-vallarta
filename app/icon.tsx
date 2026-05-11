import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 240,
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ color: "#f0f0f0" }}>G</span>
        <span style={{ color: "#e0395a" }}>V</span>
      </div>
    ),
    { ...size }
  );
}
