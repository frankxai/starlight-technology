export const shopCategories = ["All", "Compute", "Storage", "Controls", "Audio"] as const;
export type ShopCategory = Exclude<(typeof shopCategories)[number], "All">;
export type HardwareShape = "workstation" | "gpu" | "nas" | "ssd" | "controller" | "microphone";

export interface ShopProduct {
  slug: string;
  brand: string;
  name: string;
  category: ShopCategory;
  shape: HardwareShape;
  role: string;
  summary: string;
  fit: string;
  avoid: string;
  runtime: string;
  systemCost: string;
  checks: string[];
  sourceUrl: string;
  verifiedOn: string;
  region: string;
  affiliateEnvKey: string;
  buildPath: string;
}

// Source-backed product identities. Fit, avoid and complete-cost notes are
// editorial inferences, not independent benchmarks or claims of ownership.
export const shopProducts: ShopProduct[] = [
  {
    slug: "nvidia-dgx-spark", brand: "NVIDIA", name: "DGX Spark", category: "Compute", shape: "workstation",
    role: "A dedicated local AI node",
    summary: "A compact NVIDIA platform to evaluate for local model development and persistent agent workloads.",
    fit: "Your local AI roadmap depends on NVIDIA tooling and a separate development node.",
    avoid: "You need one general-purpose machine for your existing Windows creative applications.",
    runtime: "NVIDIA AI stack · verify Linux / ARM64 dependencies",
    systemCost: "Include storage configuration, networking, backup and support. Validate your exact model and runtime before ordering.",
    checks: ["Select the exact memory and storage configuration.", "Verify ARM64 wheels, containers and native extensions for your stack.", "Request a benchmark using your model, context length and concurrency."],
    sourceUrl: "https://www.nvidia.com/en-us/products/workstations/dgx-spark/", verifiedOn: "2026-10-07", region: "Regional NVIDIA sellers",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_DGX_SPARK_URL", buildPath: "/builds"
  },
  {
    slug: "nvidia-rtx-5090", brand: "NVIDIA", name: "GeForce RTX 5090", category: "Compute", shape: "gpu",
    role: "The GPU inside a complete system",
    summary: "A discrete GPU candidate for a workstation that combines CUDA workloads, rendering and creative production.",
    fit: "You have a named CUDA workload and a compatible workstation plan.",
    avoid: "You are treating the graphics card alone as a finished AI workstation.",
    runtime: "CUDA · application and driver compatibility required",
    systemCost: "The card is one component. Budget for the host, PSU, cooling, chassis, memory, storage and backup.",
    checks: ["Check the exact partner card dimensions and power requirements.", "Measure whether the model, KV cache and runtime fit GPU memory.", "Verify driver and application support for your operating system."],
    sourceUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", verifiedOn: "2026-10-07", region: "Local authorised retailers",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_RTX_5090_URL", buildPath: "/compare/rtx-5080-vs-5090-local-ai"
  },
  {
    slug: "minisforum-ms-s1-max", brand: "MINISFORUM", name: "MS-S1 MAX · 64 GB", category: "Compute", shape: "workstation",
    role: "An AMD-based compact workstation",
    summary: "The 64 GB Ryzen AI Max+ 395 configuration is a candidate for a compact desktop and a separately validated local AI stack.",
    fit: "You want an AMD-based compact host and can validate your inference runtime before purchase.",
    avoid: "Your application or model runtime requires an NVIDIA CUDA GPU.",
    runtime: "AMD platform · validate OS, runtime and model support",
    systemCost: "Confirm the shipped SSD, OS licence, RAM configuration, regional plug and return destination; include external backup.",
    checks: ["Match the listing to the 64 GB Ryzen AI Max+ 395 SKU.", "Validate the exact inference backend; unified memory does not imply CUDA support.", "Confirm EU shipping, VAT treatment, warranty and return address with the seller."],
    sourceUrl: "https://store.minisforum.com/products/minisforum-ms-s1-max-64gb", verifiedOn: "2026-10-07", region: "Confirm NL delivery at merchant",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_MINISFORUM_URL", buildPath: "/builds"
  },
  {
    slug: "apple-mac-studio", brand: "Apple", name: "Mac Studio", category: "Compute", shape: "workstation",
    role: "The creative production desk",
    summary: "An Apple silicon desktop candidate for a macOS studio, with the precise chip and memory configuration chosen around your applications.",
    fit: "Your production workflow already runs on macOS and your local AI runtime supports Apple silicon.",
    avoid: "A critical plug-in, application or training workflow requires Windows or CUDA.",
    runtime: "macOS · Metal / Apple silicon runtime support",
    systemCost: "Select memory and internal storage before purchase. Include display, peripherals, external project storage and backup.",
    checks: ["Choose the current chip, memory and SSD configuration on Apple's regional store.", "Validate DAW plug-ins, video codecs and inference backends.", "Compare the complete desk cost with an upgrade to the system you already own."],
    sourceUrl: "https://www.apple.com/nl/mac-studio/", verifiedOn: "2026-10-07", region: "Netherlands",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_MAC_STUDIO_URL", buildPath: "/builds"
  },
  {
    slug: "ugreen-dxp4800-plus", brand: "UGREEN", name: "NASync DXP4800 Plus", category: "Storage", shape: "nas",
    role: "A shared project library",
    summary: "A four-bay NAS candidate for shared media, project archives and a deliberate storage workflow.",
    fit: "You need shared storage and have a plan for disks, permissions and a separate backup.",
    avoid: "You expect a NAS or RAID alone to protect the only copy of your work.",
    runtime: "NAS storage · check apps and network compatibility",
    systemCost: "Add compatible drives, network upgrades where needed, backup storage and an appropriate power-protection plan.",
    checks: ["Confirm whether the offer includes drives and match their compatibility.", "Plan usable capacity, redundancy and a separate off-site copy.", "Check your actual network path and access permissions before migrating projects."],
    sourceUrl: "https://ai-eu.ugreen.com/products/ugreen-nasync-dxp4800-plus-nas-storage", verifiedOn: "2026-10-07", region: "EU · confirm destination",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_UGREEN_NAS_URL", buildPath: "/builds"
  },
  {
    slug: "samsung-990-pro-2tb", brand: "Samsung", name: "990 PRO · 2 TB", category: "Storage", shape: "ssd",
    role: "Fast local project storage",
    summary: "A PCIe 4.0 NVMe M.2 SSD candidate for a compatible workstation's active projects and local assets.",
    fit: "Your host has a compatible slot and fast local storage is the measured bottleneck.",
    avoid: "You need portable storage, shared network storage or your only backup.",
    runtime: "M.2 NVMe · host and cooling compatibility",
    systemCost: "Check heatsink clearance, any required enclosure and a separate backup destination.",
    checks: ["Match the 2 TB SKU and select the correct heatsink variant.", "Verify the motherboard or laptop slot, clearance and cooling.", "Check firmware guidance and migrate with a verified backup."],
    sourceUrl: "https://www.samsung.com/nl/memory-storage/nvme-ssd/990-pro-2tb-nvme-pcie-gen-4-mz-v9p2t0bw/", verifiedOn: "2026-10-07", region: "Netherlands",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_SAMSUNG_SSD_URL", buildPath: "/builds"
  },
  {
    slug: "elgato-stream-deck-plus", brand: "Elgato", name: "Stream Deck +", category: "Controls", shape: "controller",
    role: "Make repeated actions tangible",
    summary: "A desktop controller with keys, dials and a touch strip to evaluate for supported creative and production workflows.",
    fit: "You repeat specific supported actions often enough to justify physical controls.",
    avoid: "You have not identified the actions or verified the required integrations.",
    runtime: "Stream Deck software · verify plug-ins and OS",
    systemCost: "Include setup time and any required software or audio integration. Check what the controller actually controls.",
    checks: ["List the five repeated actions that will earn their place on the controller.", "Verify current OS and plug-in support for every integration.", "Check whether your audio workflow requires additional Elgato hardware or software."],
    sourceUrl: "https://www.elgato.com/eu/en/p/stream-deck-plus", verifiedOn: "2026-10-07", region: "EU · confirm destination",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_STREAM_DECK_URL", buildPath: "/builds"
  },
  {
    slug: "rode-podmic-usb", brand: "RØDE", name: "PodMic USB", category: "Audio", shape: "microphone",
    role: "A repeatable voice setup",
    summary: "A dynamic USB and XLR microphone candidate for spoken-word recording, calls and a desktop creator workflow.",
    fit: "You need a consistent close-mic voice setup and can position the microphone correctly.",
    avoid: "Your actual problem is room noise, poor placement or an untreated distant recording setup.",
    runtime: "USB / XLR · confirm host and audio chain",
    systemCost: "Include a suitable stand or arm, headphones and the correct connection; an XLR workflow also needs an interface.",
    checks: ["Choose USB or XLR and verify the complete connection path.", "Check mounting, placement and monitoring requirements.", "Test the recording position in your room before spending on more processing."],
    sourceUrl: "https://rode.com/en-us/products/podmic-usb", verifiedOn: "2026-10-07", region: "Local retailers · verify region",
    affiliateEnvKey: "STARLIGHT_AFFILIATE_RODE_URL", buildPath: "/builds"
  }
];

export const studioKits = [
  { id: "local-ai", name: "Local AI desk", objective: "A dedicated host, fast assets and recoverable work.", constraint: "Choose one compute platform after validating your exact runtime. These are planning components, not a prevalidated bundle.", slugs: ["minisforum-ms-s1-max", "samsung-990-pro-2tb", "ugreen-dxp4800-plus"] },
  { id: "creator", name: "Creator studio", objective: "A production machine, tactile controls and a consistent voice.", constraint: "Check your applications and plug-ins first. Microphone mounting, headphones and backup remain separate purchases.", slugs: ["apple-mac-studio", "elgato-stream-deck-plus", "rode-podmic-usb"] },
  { id: "ai-lab", name: "NVIDIA AI lab", objective: "A local NVIDIA development node with a shared asset library.", constraint: "DGX Spark and an RTX workstation are different system paths. Benchmark the intended model and verify software architecture before choosing.", slugs: ["nvidia-dgx-spark", "ugreen-dxp4800-plus", "elgato-stream-deck-plus"] }
] as const;

export function getShopProduct(slug: string) { return shopProducts.find((product) => product.slug === slug); }

export function filterShopProducts(products: ShopProduct[], category: (typeof shopCategories)[number], query: string) {
  const needle = query.trim().toLowerCase();
  return products.filter((product) => (category === "All" || product.category === category) && `${product.brand} ${product.name} ${product.role} ${product.runtime}`.toLowerCase().includes(needle));
}
