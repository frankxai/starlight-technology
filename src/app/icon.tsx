import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050607", border: "5px solid #c8f36b", borderRadius: 16, color: "#c8f36b", fontSize: 34, fontWeight: 800, fontFamily: "Arial" }}>S</div>, size); }
