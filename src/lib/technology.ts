export type TechnologyCategory = "Compute" | "Spatial" | "Robotics" | "Mobile" | "Display";
export type EditorialState = "manufacturer-sourced" | "research-queue";

export interface TechnologyRecord {
  slug: string;
  name: string;
  maker: string;
  category: TechnologyCategory;
  role: string;
  decision: string;
  fit: string[];
  avoid: string[];
  interfaces: string[];
  systemCosts: string[];
  source: { title: string; url: string; checked: string };
  state: EditorialState;
}

// Manufacturer references are research starting points, not offers or hands-on reviews.
// Add variants and merchant offers only through the editorial and rights gates in docs/COMMERCE_AND_OPERATIONS.md.
export const technology: TechnologyRecord[] = [
  {
    slug: "framework-desktop-ryzen-ai-max", name: "Framework Desktop", maker: "Framework", category: "Compute",
    role: "Compact local AI workstation", decision: "Examine when large shared memory and a small desktop footprint matter more than a discrete GPU upgrade path.",
    fit: ["Local models that benefit from a large shared memory pool", "A compact, repair-conscious desktop system"],
    avoid: ["You need a replaceable discrete GPU", "Your workflow requires CUDA-specific tooling"],
    interfaces: ["USB4", "5 Gb Ethernet", "Wi-Fi 7"],
    systemCosts: ["Display and input", "External backup", "Power and acoustics", "Software compatibility"],
    source: { title: "Framework Desktop specifications", url: "https://frame.work/desktop", checked: "2026-09-28" }, state: "manufacturer-sourced"
  },
  {
    slug: "geforce-rtx-5090", name: "GeForce RTX 5090", maker: "NVIDIA", category: "Compute",
    role: "32 GB discrete GPU", decision: "Consider only when a named, repeated workload needs the 32 GB memory envelope.",
    fit: ["Memory-bound local AI or creator pipelines", "A desktop with validated power and cooling headroom"],
    avoid: ["The workload fits reliably in a smaller memory envelope", "The rest of the build would lose backup, memory or storage budget"],
    interfaces: ["PCIe desktop host", "Display outputs; check board variant"],
    systemCosts: ["Power supply and cooling", "Case clearance", "System memory and storage", "Backup"],
    source: { title: "NVIDIA GeForce RTX 5090 family", url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", checked: "2026-09-28" }, state: "manufacturer-sourced"
  },
  {
    slug: "meta-quest-3s", name: "Meta Quest 3S", maker: "Meta", category: "Spatial",
    role: "Standalone mixed reality headset", decision: "Start here to test a standalone spatial workflow before committing to an expensive capture and development stack.",
    fit: ["Prototyping immersive experiences", "Standalone demos and team exploration"],
    avoid: ["You need a verified enterprise device policy", "Your content pipeline depends on another headset ecosystem"],
    interfaces: ["Standalone app ecosystem", "PC connection; verify workflow"],
    systemCosts: ["Content production", "Accessories and comfort", "Device management", "Hygiene for shared use"],
    source: { title: "Meta Quest 3S product and specifications", url: "https://www.meta.com/quest/quest-3s/", checked: "2026-09-28" }, state: "manufacturer-sourced"
  },
  {
    slug: "unitree-go2", name: "Unitree Go2", maker: "Unitree", category: "Robotics",
    role: "Quadruped research platform", decision: "Treat this as an evaluation candidate with a physical safety and support plan, not a plug-and-play fleet worker.",
    fit: ["Supervised robotics research", "A team with a controlled test area and operator"],
    avoid: ["You need unattended public-space operation", "The exact variant lacks a verified SDK, support or service path"],
    interfaces: ["Variant-specific SDK; verify before purchase", "Operator control", "Physical emergency procedure"],
    systemCosts: ["Training and supervision", "Battery and spares", "Service and repair", "Site safety and insurance"],
    source: { title: "Unitree Go2 specifications", url: "https://www.unitree.com/go2", checked: "2026-09-28" }, state: "manufacturer-sourced"
  },
  {
    slug: "google-pixel-10-pro", name: "Pixel 10 Pro", maker: "Google", category: "Mobile",
    role: "Mobile capture reference", decision: "Evaluate as a pocket capture and publishing node; the camera spec alone does not establish a complete production workflow.",
    fit: ["Fast capture, review and publication on the move", "A mobile companion to a desktop or studio workflow"],
    avoid: ["You need replaceable lenses or sustained professional recording", "Your capture chain requires an unverified external audio or storage path"],
    interfaces: ["USB-C; verify accessory protocol", "Camera and app export workflow"],
    systemCosts: ["Storage and cloud backup", "Audio capture", "Mounting and power", "Editing handoff"],
    source: { title: "Google Pixel 10 Pro specifications", url: "https://store.google.com/product/pixel_10_pro_specs", checked: "2026-09-28" }, state: "manufacturer-sourced"
  },
  {
    slug: "benq-pd3225u", name: "PD3225U", maker: "BenQ", category: "Display",
    role: "32-inch 4K creator display", decision: "Evaluate when color work and a single-cable desk matter; verify your host's display and charging path first.",
    fit: ["A fixed creator desk with 4K workspace", "A compatible Thunderbolt host and color workflow"],
    avoid: ["You need a high-refresh gaming display", "Your host or dock cannot support the intended video and power path"],
    interfaces: ["Thunderbolt 3 with up to 85 W power delivery", "HDMI 2.0 and DisplayPort 1.4"],
    systemCosts: ["Host and cable compatibility", "Desk space and mounting", "Calibration workflow", "Power and replacement plan"],
    source: { title: "BenQ PD3225U EU specifications", url: "https://www.benq.eu/en-eu/monitor/creative-pro/pd3225u/spec.html", checked: "2026-09-28" }, state: "manufacturer-sourced"
  }
];

export const coverage = [
  { name: "Computers & accelerators", status: "Open", detail: "Workstations, laptops, GPUs, local AI and cloud handoff" },
  { name: "Spatial computing", status: "Open", detail: "VR, AR, capture, development and fleet management" },
  { name: "Robotics", status: "Open", detail: "Platforms, control interfaces, supervision and operations" },
  { name: "Phones & mobile capture", status: "Open", detail: "Cameras, on-device AI, battery and workflow integration" },
  { name: "Displays & studios", status: "Open", detail: "Monitors, audio, storage, networking and ergonomics" },
  { name: "AI glasses & wearables", status: "Research queue", detail: "Privacy, capture, assistant access and battery" },
  { name: "Aerospace & frontier systems", status: "Research queue", detail: "Research and systems architecture; no consumer offers" }
] as const;

export function getTechnology(slug: string) { return technology.find((item) => item.slug === slug); }
