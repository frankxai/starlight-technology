import { useId } from "react";
import type { HardwareShape } from "@/lib/shop";

// Original illustrated machine portraits. Drawn from the manufacturer's
// published dimensions and layout, shaded as vector art. They are not
// photographs or model-accurate renders, and the nearby caption says so.
// Variants pick the silhouette for a specific record; the shape is the class.

export type PortraitVariant = "spark" | "mini" | "studio" | "card" | "tower" | "stick" | "deck" | "mic";

export const portraitVariantBySlug: Record<string, PortraitVariant> = {
  "nvidia-dgx-spark": "spark",
  "minisforum-ms-s1-max": "mini",
  "apple-mac-studio": "studio",
  "nvidia-rtx-5090": "card",
  "ugreen-dxp4800-plus": "tower",
  "samsung-990-pro-2tb": "stick",
  "elgato-stream-deck-plus": "deck",
  "rode-podmic-usb": "mic"
};

const shapeVariant: Record<HardwareShape, PortraitVariant> = { workstation: "mini", gpu: "card", nas: "tower", ssd: "stick", controller: "deck", microphone: "mic" };

export function HardwareDiagram({ shape, slug }: { shape: HardwareShape; slug?: string }) {
  const variant = (slug && portraitVariantBySlug[slug]) || shapeVariant[shape];
  const id = useId().replace(/:/g, "");
  const g = (name: string) => `url(#${id}-${name})`;
  return <svg viewBox="0 0 480 360" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4440" /><stop offset=".55" stopColor="#1b2220" /><stop offset="1" stopColor="#0c100f" /></linearGradient>
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a6660" /><stop offset="1" stopColor="#242c29" /></linearGradient>
      <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#161c1a" /><stop offset="1" stopColor="#070908" /></linearGradient>
      <linearGradient id={`${id}-alu`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9dcd3" /><stop offset=".5" stopColor="#9aa198" /><stop offset="1" stopColor="#5e665f" /></linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9c08a" /><stop offset=".5" stopColor="#9f8a55" /><stop offset="1" stopColor="#4d4328" /></linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f2a2c" /><stop offset="1" stopColor="#0b1112" /></linearGradient>
      <linearGradient id={`${id}-signal`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c8f36b" stopOpacity=".9" /><stop offset="1" stopColor="#75d8ff" stopOpacity=".9" /></linearGradient>
      <radialGradient id={`${id}-floor`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".7" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-halo`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#c8f36b" stopOpacity=".18" /><stop offset="1" stopColor="#c8f36b" stopOpacity="0" /></radialGradient>
      <filter id={`${id}-blur`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      <pattern id={`${id}-mesh`} width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.1" fill="#0a0d0c" /></pattern>
      <pattern id={`${id}-vents`} width="5" height="8" patternUnits="userSpaceOnUse"><rect x="1.5" y="0" width="2" height="8" fill="#0a0d0c" /></pattern>
    </defs>
    <ellipse cx="240" cy="306" rx="190" ry="26" fill={g("floor")} filter={`url(#${id}-blur)`} />
    <ellipse cx="240" cy="180" rx="210" ry="150" fill={g("halo")} />

    {variant === "spark" && <g>
      <path d="M118 128l126-30 120 44v102l-120 46-126-50z" fill={g("side")} />
      <path d="M118 128l126-30 120 44-126 34z" fill={g("gold")} />
      <path d="M118 128l120 48v114l-120-50z" fill="#2a2516" opacity=".95" />
      <path d="M118 128l120 48v114l-120-50z" fill={g("mesh")} opacity=".7" />
      <path d="M238 176l126-34v102l-126 46z" fill={g("body")} />
      <path d="M124 140l108 43" stroke="#f1dca0" strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M248 186l108-30" stroke="#f8f8f0" strokeOpacity=".18" strokeWidth="1.5" />
      <rect x="258" y="215" width="40" height="3" fill={g("signal")} opacity=".9" transform="skewY(-14)" />
      <circle cx="139" cy="212" r="3" fill="#c8f36b" />
    </g>}

    {variant === "mini" && <g>
      <path d="M96 150l150-36 142 40v92l-142 44-150-44z" fill={g("side")} />
      <path d="M96 150l150-36 142 40-150 36z" fill={g("top")} />
      <path d="M96 150l142 40v96l-142-46z" fill="#121715" />
      <path d="M110 162l114 32v70l-114-38z" fill={g("vents")} opacity=".8" />
      <path d="M238 190l150-36v92l-150 44z" fill={g("body")} />
      <path d="M254 206l118-28" stroke="#f8f8f0" strokeOpacity=".16" strokeWidth="1.5" />
      <rect x="258" y="232" width="30" height="6" rx="1" fill="#0a0d0c" transform="skewY(-13)" />
      <rect x="296" y="222" width="30" height="6" rx="1" fill="#0a0d0c" transform="skewY(-13)" />
      <rect x="334" y="212" width="12" height="6" rx="1" fill="#0a0d0c" transform="skewY(-13)" />
      <circle cx="360" cy="206" r="2.5" fill="#75d8ff" />
      <path d="M102 156l140 40" stroke="#9aa198" strokeOpacity=".35" />
    </g>}

    {variant === "studio" && <g>
      <path d="M104 150c0-8 6-14 14-14l220-30c10-1 18 6 18 16v88c0 8-6 14-14 14l-220 30c-10 1-18-6-18-16z" fill={g("alu")} />
      <path d="M104 150l136 44v98l-120-40c-10-3-16-10-16-20z" fill="#8a918a" />
      <path d="M240 194l116-32v88c0 8-6 14-14 14l-102 28z" fill="#6f776f" />
      <path d="M240 194v98" stroke="#f5f7f2" strokeOpacity=".35" strokeWidth="1.5" />
      <ellipse cx="166" cy="234" rx="5" ry="8" fill="#2b302c" transform="rotate(18 166 234)" />
      <ellipse cx="184" cy="240" rx="5" ry="8" fill="#2b302c" transform="rotate(18 184 240)" />
      <ellipse cx="206" cy="247" rx="4" ry="6" fill="#2b302c" transform="rotate(18 206 247)" />
      <circle cx="152" cy="228" r="2" fill="#f8f8f0" />
      <path d="M118 136l220-30" stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.5" />
    </g>}

    {variant === "card" && <g>
      <path d="M86 160l250-62 54 24-250 62z" fill={g("top")} />
      <path d="M86 160l250-62v54L86 214z" fill={g("body")} />
      <path d="M86 214l250-62 54 24v22l-250 62-54-24z" fill={g("side")} />
      <path d="M336 98l54 24v22l-54-24z" fill="#0f1413" />
      <circle cx="166" cy="166" r="34" fill="#0c100f" stroke="#3e4b42" strokeWidth="2" />
      <circle cx="262" cy="142" r="34" fill="#0c100f" stroke="#3e4b42" strokeWidth="2" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => <g key={a}><path d={`M166 166l${Math.cos((a * Math.PI) / 180) * 30} ${Math.sin((a * Math.PI) / 180) * 30}`} stroke="#5a6660" strokeWidth="5" strokeLinecap="round" opacity=".9" /><path d={`M262 142l${Math.cos(((a + 20) * Math.PI) / 180) * 30} ${Math.sin(((a + 20) * Math.PI) / 180) * 30}`} stroke="#5a6660" strokeWidth="5" strokeLinecap="round" opacity=".9" /></g>)}
      <circle cx="166" cy="166" r="8" fill="#1b2220" stroke="#8a918a" /><circle cx="262" cy="142" r="8" fill="#1b2220" stroke="#8a918a" />
      <rect x="96" y="222" width="120" height="7" fill={g("gold")} transform="skewY(-14)" />
      <rect x="300" y="170" width="46" height="6" rx="1" fill={g("signal")} transform="skewY(-14)" opacity=".85" />
    </g>}

    {variant === "tower" && <g>
      <path d="M150 84l130-24 60 26v170l-60 26-130-28z" fill={g("side")} />
      <path d="M150 84l130-24 60 26-130 26z" fill={g("top")} />
      <path d="M150 84l130 28v170l-130-28z" fill={g("body")} />
      {[0, 1, 2, 3].map((i) => <g key={i}><path d={`M162 ${100 + i * 36}l106 24v26l-106-24z`} fill="#0c100f" stroke="#3e4b42" strokeWidth="1.2" /><path d={`M170 ${112 + i * 36}l16 4`} stroke="#c8f36b" strokeWidth="2" strokeLinecap="round" opacity={i === 3 ? 0.35 : 0.9} /><path d={`M200 ${118 + i * 36}l54 12`} stroke="#3e4b42" strokeWidth="1" /></g>)}
      <path d="M280 112l60-26v170l-60 26z" fill="#121715" />
      <path d="M290 130l40-17v120l-40 17z" fill={g("mesh")} opacity=".8" />
      <circle cx="180" cy="262" r="3" fill="#75d8ff" />
    </g>}

    {variant === "stick" && <g>
      <path d="M78 196l300-70 24 10-300 70z" fill={g("top")} />
      <path d="M78 196l300-70v22L78 218z" fill="#0d1211" />
      <path d="M78 218l300-70 24 10v22l-300 70-24-10z" fill={g("side")} />
      <path d="M378 126l24 10v22l-24-10z" fill="#1b2220" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 78} ${182 - i * 18}l54-13 10 5-54 13z`} fill="#161c1a" stroke="#3e4b42" strokeWidth="1.2" />)}
      <path d="M350 136l14-3 8 4-14 3z" fill="#2b302c" stroke="#5a6660" />
      <path d="M86 203l16-4 4 2-16 4z" fill="#0c100f" />
      <path d="M382 134v22M388 137v22M394 140v22" stroke={g("gold")} strokeWidth="2.5" />
      <path d="M100 206l260-61" stroke="#c8f36b" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 5" />
    </g>}

    {variant === "deck" && <g>
      <path d="M96 196l212-56 90 30-212 60z" fill={g("top")} />
      <path d="M96 196l90 34v34l-90-34z" fill={g("side")} />
      <path d="M186 230l212-60v32l-212 62z" fill={g("body")} />
      {[0, 1, 2, 3].map((c) => [0, 1].map((r) => <path key={`${c}-${r}`} d={`M${126 + c * 40 + r * 22} ${196 - c * 10 + r * 9}l24-6 20 7-24 6z`} fill={g("glass")} stroke="#5a6660" strokeWidth="1" />))}
      <path d="M156 228l152-40 24 8-152 42z" fill="#0c100f" stroke="#3e4b42" />
      <path d="M170 231l120-32" stroke={g("signal")} strokeWidth="3" strokeLinecap="round" opacity=".9" />
      {[0, 1, 2, 3].map((i) => <g key={i}><ellipse cx={200 + i * 46} cy={250 - i * 12} rx="13" ry="7" fill="#1b2220" stroke="#8a918a" /><ellipse cx={200 + i * 46} cy={246 - i * 12} rx="13" ry="7" fill={g("alu")} /><path d={`M${200 + i * 46} ${241 - i * 12}v5`} stroke="#0a0d0c" strokeWidth="1.5" /></g>)}
      <path d="M126 196l24-6" stroke="#c8f36b" strokeWidth="1.5" opacity=".8" />
    </g>}

    {variant === "mic" && <g>
      <rect x="196" y="50" width="88" height="150" rx="40" fill={g("body")} />
      <rect x="196" y="50" width="88" height="150" rx="40" fill={g("mesh")} opacity=".85" />
      <path d="M212 62c0-6 6-10 12-10h32c6 0 12 4 12 10v10H212z" fill="#3a4440" opacity=".9" />
      <path d="M204 150h72v28c0 14-16 24-36 24s-36-10-36-24z" fill={g("alu")} />
      <rect x="226" y="196" width="28" height="22" fill="#1b2220" />
      <path d="M168 120c0 50 24 92 72 92s72-42 72-92" stroke={g("alu")} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M240 212v42" stroke="#1b2220" strokeWidth="14" strokeLinecap="round" />
      <rect x="150" y="248" width="180" height="12" rx="4" fill={g("side")} />
      <circle cx="240" cy="232" r="3" fill="#c8f36b" />
      <path d="M210 70v120" stroke="#f8f8f0" strokeOpacity=".12" strokeWidth="6" />
    </g>}
  </svg>;
}
