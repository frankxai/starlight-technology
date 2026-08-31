import { ImageResponse } from "next/og";

export const alt = "Starlight Infrastructure Partnership OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 66px", color: "#f3f1ea", background: "#101112", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 3, color: "#b8bdb9" }}>
        <span>STARLIGHT / INFRASTRUCTURE</span><span>PARTNERSHIP OS</span>
      </div>
      <div style={{ display: "flex", gap: 66, alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "58%" }}>
          <div style={{ fontSize: 70, lineHeight: .93, letterSpacing: -4 }}>Make the operating agreement the first machine.</div>
          <div style={{ marginTop: 24, fontSize: 21, color: "#b8bdb9", lineHeight: 1.45 }}>Sites · power · capital · workloads · contracts · evidence</div>
        </div>
        <div style={{ width: "42%", display: "flex", flexDirection: "column", border: "1px solid #3a3d3c" }}>
          {["AssetCo → host + assets", "OperatorCo → runtime + skills", "Bank → finance + diligence", "Energy → PV + storage"].map((line, index) => (
            <div key={line} style={{ display: "flex", alignItems: "center", padding: "18px 20px", borderBottom: index === 3 ? "none" : "1px solid #3a3d3c", fontSize: 18 }}><span style={{ color: "#c6a36a", width: 42 }}>0{index + 1}</span>{line}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: "#c6a36a" }}><span>WORKLOAD BEFORE HARDWARE</span><span>STARLIGHT.TECHNOLOGY/INFRASTRUCTURE</span></div>
    </div>,
    size
  );
}
