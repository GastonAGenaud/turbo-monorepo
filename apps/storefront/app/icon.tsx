import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#07090d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(28,230,179,0.35)",
            filter: "blur(6px)",
          }}
        />
        {/* GG text */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: "#eef3f8",
            lineHeight: 1,
          }}
        >
          GG
        </span>
        {/* Accent dot */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 5,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#1ce6b3",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
