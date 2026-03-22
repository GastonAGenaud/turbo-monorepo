import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
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
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(28,230,179,0.3)",
            filter: "blur(30px)",
          }}
        />
        {/* GG text */}
        <span
          style={{
            fontSize: 76,
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
            bottom: 26,
            right: 30,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#1ce6b3",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
