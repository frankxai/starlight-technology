import type { Build, Comparison, Guide } from "./types";

const verified = "2026-07-19";

export const builds: Build[] = [
  {
    slug: "balanced-ai-creator-studio-3000",
    title: "The balanced AI creator studio around €3,000",
    summary: "A workload-first allocation for local AI, music production and creator work—without spending the whole budget on one headline component.",
    budget: "€2,500–€3,500 planning band",
    objective: "Local AI experimentation, music production, editing and dependable daily work from one Windows-first system.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    fit: ["You combine local AI with audio or video work", "You need one dependable primary machine", "You value upgrade room over a sealed showpiece"],
    avoidWhen: ["Your recurring models need more than 16 GB of GPU memory", "You travel every week and cannot maintain a desktop", "You require certified enterprise support"],
    allocation: [
      { label: "GPU and compute", value: "38–46%", rationale: "Buy enough accelerator memory for named workloads; gaming benchmarks should not decide the whole system." },
      { label: "CPU, board and memory", value: "22–28%", rationale: "Prioritise stability, quiet operation, capacity and expansion over marginal benchmark wins." },
      { label: "Storage and backup", value: "10–14%", rationale: "Separate active projects from models, samples and recoverable archives." },
      { label: "Audio, display and ergonomics", value: "16–24%", rationale: "Monitoring, capture and comfort change daily output more than an unused specification." }
    ],
    sections: [
      { heading: "The governing decision", body: ["Choose the largest recurring workload first: local model inference, video timelines, sample-heavy music sessions or mobile delivery. The budget follows the bottleneck you experience weekly, not the component receiving the most launch coverage."] },
      { heading: "Where the build becomes wrong", body: ["This band is not an automatic RTX 5090 recommendation. NVIDIA lists 32 GB GDDR7 for the RTX 5090 and 16 GB GDDR7 for the RTX 5080. Extra memory can change which workloads fit, but it also consumes budget that may produce more value elsewhere."], bullets: ["Choose 32 GB-class GPU memory only when a named workload needs it.", "Reserve budget for backup, power, cooling and peripherals.", "Do not treat a manufacturer price as a verified merchant offer."] },
      { heading: "Upgrade path", body: ["Use accessible memory and storage, leave power and thermal headroom, and design project storage before importing model libraries. The first upgrade should remove a measured bottleneck—not complete an aesthetic set."] }
    ],
    sourceIds: ["nvidia-rtx-5090", "nvidia-rtx-5080"]
  },
  {
    slug: "portable-ai-music-studio-under-4kg",
    title: "A portable AI and music studio under 4 kg",
    summary: "A weight-budget blueprint for creators who need capture, composition and AI-assisted work without carrying a desktop replacement everywhere.",
    budget: "€1,800–€4,000 planning band",
    objective: "Travel-ready writing, music, capture and selective local AI with a complete carried system under 4 kg.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    fit: ["You work from trains, hotels or multiple studios", "Capture matters more than maximum local model size", "Heavy inference can move to a home or governed cloud system"],
    avoidWhen: ["You need sustained maximum GPU power away from mains", "You require many always-connected studio peripherals", "Core work exceeds laptop memory limits"],
    allocation: [
      { label: "Laptop", value: "2.0–2.4 kg", rationale: "Protect screen, thermals, ports and battery before chasing the thinnest chassis." },
      { label: "Power", value: "0.5–0.8 kg", rationale: "Count the actual charger, cables and region adapters." },
      { label: "Audio and capture", value: "0.4–0.7 kg", rationale: "One compact microphone or interface should solve a named path." },
      { label: "Protection and storage", value: "0.3–0.5 kg", rationale: "Include the bag, SSD and backup route." }
    ],
    sections: [
      { heading: "Mass is a system constraint", body: ["Laptop comparisons hide the charger, audio device, storage, adapters and protection you actually carry. Set a complete-system mass before selecting products."] },
      { heading: "Local versus remote AI", body: ["Run the models you need offline and hand larger jobs to a home workstation or approved cloud service. A heavier mobile GPU for occasional inference can degrade every non-AI journey."] },
      { heading: "The one-cable test", body: ["At a desk, reach power, display, storage and audio with one primary connection or a documented two-cable fallback. On the move, the system must remain useful without the dock."] }
    ],
    sourceIds: []
  },
  {
    slug: "hybrid-desktop-travel-system",
    title: "Desktop plus travel laptop: the two-machine creator system",
    summary: "A resilient split for serious local compute and a calm mobile experience instead of one compromised flagship laptop.",
    budget: "€3,000–€7,000 planning band",
    objective: "Separate sustained compute from mobile creation while keeping projects, models and recovery paths governed.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    fit: ["You need sustained local GPU work and frequent travel", "You can maintain clear sync and backup rules", "You prefer a lighter mobile machine"],
    avoidWhen: ["You want one machine with zero coordination overhead", "Applications cannot move projects safely", "You lack a backup and access plan"],
    allocation: [
      { label: "Home compute", value: "50–64%", rationale: "Place thermally sustained workloads and expandable storage here." },
      { label: "Mobile machine", value: "24–34%", rationale: "Optimise for battery, display, keyboard and the offline work you actually do." },
      { label: "Storage and backup", value: "8–14%", rationale: "Two machines without recovery rules create fragility, not resilience." },
      { label: "Network and accessories", value: "4–8%", rationale: "Use the smallest set that makes handoff dependable." }
    ],
    sections: [
      { heading: "Why two machines can cost less", body: ["A flagship mobile workstation asks one chassis to maximise sustained power, battery, acoustics, repairability and portability. Splitting roles can improve both experiences at a similar total price."] },
      { heading: "The hidden cost", body: ["The expense is coordination: duplicate software, project sync, model placement, credentials and recovery. Define those before the second purchase."] },
      { heading: "A safe division of labour", body: ["Keep repositories and credentials governed. Sync working media intentionally; do not mirror every cache and model folder. The mobile device should support a meaningful offline session rather than only remote access."] }
    ],
    sourceIds: []
  }
];

export const comparisons: Comparison[] = [
  {
    slug: "rtx-5080-vs-5090-local-ai",
    title: "RTX 5080 vs RTX 5090 for local AI creators",
    summary: "The decisive difference is whether named workloads fit inside 16 GB or need the 5090's 32 GB memory envelope—not prestige.",
    verdict: "Choose the RTX 5080 when 16 GB fits recurring work and saved budget improves the system. Choose the RTX 5090 when 32 GB repeatedly unlocks work you perform.",
    evidenceStatus: "research-backed",
    lastVerified: verified,
    options: [
      { name: "GeForce RTX 5080", bestFor: "Balanced creator systems whose local workloads fit within 16 GB", wrongFor: "Workloads that repeatedly fail or require severe compromises at 16 GB", keyConstraint: "NVIDIA lists 16 GB GDDR7" },
      { name: "GeForce RTX 5090", bestFor: "Memory-bound local AI and high-end creator work that can use 32 GB", wrongFor: "Buyers sacrificing storage, memory, backup or acoustics without measured need", keyConstraint: "NVIDIA lists 32 GB GDDR7" }
    ],
    sections: [
      { heading: "What the specification proves", body: ["NVIDIA currently lists 16 GB GDDR7 for the RTX 5080 and 32 GB GDDR7 for the RTX 5090. That establishes memory capacity, not application performance, merchant availability or total-system value."] },
      { heading: "Where more memory changes the answer", body: ["The 5090 becomes rational when a model, context, batch, image/video pipeline or concurrent toolset cannot fit reliably in the smaller envelope. Record the workload and observed pressure first."] },
      { heading: "What we have not tested", body: ["This launch comparison is source-backed research, not an owned-hardware benchmark. It makes no unverified speed, acoustic or energy-cost claim."], bullets: ["No affiliate offer is active at launch.", "Future prices require merchant, region and timestamp.", "Partner cards can vary in size, cooling and power behaviour."] }
    ],
    sourceIds: ["nvidia-rtx-5080", "nvidia-rtx-5090", "google-review-guidance"]
  },
  {
    slug: "creator-laptop-vs-desktop",
    title: "Creator laptop vs desktop: buy for the constraint you cannot move",
    summary: "A laptop buys location flexibility. A desktop buys sustained power, serviceability and component choice. Start with where work must happen.",
    verdict: "Choose a laptop when the work itself must travel. Choose a desktop when sustained compute, acoustics, upgradeability or local storage is the hard constraint.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    options: [
      { name: "Creator laptop", bestFor: "Frequent travel, shared studios and one-device simplicity", wrongFor: "Maximum sustained local compute and component upgrades", keyConstraint: "Thermal, battery and portability trade-offs share one chassis" },
      { name: "Creator desktop", bestFor: "Sustained local AI, quiet studio use, storage and upgrades", wrongFor: "Work that must happen away from the desk", keyConstraint: "Location is fixed unless paired with a mobile workflow" }
    ],
    sections: [
      { heading: "Start with location", body: ["If missing a machine on location blocks meaningful work, portability is not a luxury. If demanding sessions happen at one desk, repeatedly paying for portability can be poor allocation."] },
      { heading: "Compare complete systems", body: ["Include the desktop display, keyboard, backup and travel device. Include the laptop dock, charger, storage and second display. Bare-device comparisons hide the decision."] },
      { heading: "Recovery matters", body: ["A single laptop concentrates risk. A two-machine setup multiplies sync complexity. Choose the failure mode you can manage and test recovery before optimising convenience."] }
    ],
    sourceIds: ["google-review-guidance"]
  },
  {
    slug: "usb-microphone-vs-xlr-chain",
    title: "USB microphone vs XLR chain for an AI creator studio",
    summary: "USB minimises setup. XLR separates microphone, interface and routing so the system can evolve. Buy the workflow, not the studio aesthetic.",
    verdict: "Start with USB for one voice source and rapid setup. Move to XLR when routing, multiple inputs, monitoring or replaceable components become recurring needs.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    options: [
      { name: "USB microphone", bestFor: "Single-person voice, calls, tutorials and portable capture", wrongFor: "Multiple sources, complex monitoring and component upgrades", keyConstraint: "Microphone, conversion and connection are one product" },
      { name: "XLR chain", bestFor: "Music, multiple inputs, monitoring and modular growth", wrongFor: "Buyers who need one cable and will not use the routing", keyConstraint: "Every component adds gain, cable and compatibility decisions" }
    ],
    sections: [
      { heading: "The decision trigger", body: ["Do not move to XLR because it looks professional. Move when you can name a routing, input, monitoring or replacement need a USB device cannot solve."] },
      { heading: "Room before microphone", body: ["Capture depends on distance, placement, room reflections, noise and technique. A more expensive chain does not remove those constraints."] },
      { heading: "Total-system cost", body: ["An XLR microphone may need an interface, stand, cable, headphones and acoustic work. Compare that complete path with the complete USB setup."] }
    ],
    sourceIds: ["google-review-guidance"]
  }
];

export const guides: Guide[] = [
  {
    slug: "how-much-vram-local-ai",
    title: "How much GPU memory do you need for local AI?",
    summary: "Use a workload ledger instead of a universal number: model, precision, context, batch, concurrent tools and required headroom.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    sections: [
      { heading: "Record the workload", body: ["Write down the model or pipeline, precision, context or resolution, batch/concurrency and other GPU applications. A recommendation without those fields is not decision-grade."] },
      { heading: "Separate fits from runs well", body: ["A workload loading once is not a reliable daily workflow. Reserve headroom for the interface, additional models, larger inputs and implementation overhead."] },
      { heading: "Buy for repeated constraints", body: ["If larger memory changes a weekly workflow, it can justify more budget. If it serves a quarterly experiment, remote capacity or a later upgrade may be more efficient."], bullets: ["16 GB and 32 GB are materially different envelopes.", "GPU memory is not system memory or storage.", "Software support can matter as much as capacity."] }
    ],
    sourceIds: ["nvidia-rtx-5080", "nvidia-rtx-5090"]
  },
  {
    slug: "complete-system-cost",
    title: "Calculate complete-system cost before comparing products",
    summary: "The purchase price is one line. Include power, storage, backup, display, audio, adapters, software, maintenance and the next likely upgrade.",
    evidenceStatus: "inferred",
    lastVerified: verified,
    sections: [
      { heading: "Use one boundary", body: ["Define what must be present for the promised workflow to operate. Compare every candidate inside that same boundary, including equipment you already own when it constrains compatibility."] },
      { heading: "Separate reusable from locked", body: ["Displays, microphones and storage may outlive the computer. Proprietary docks, soldered memory and model-specific accessories may not. Label transferability."] },
      { heading: "Add failure and recovery", body: ["Backup, warranty, replacement time and data recovery belong in system economics. The cheapest working configuration can be the most expensive failure."], bullets: ["Acquisition", "Operation", "Continuity", "Exit and reuse"] }
    ],
    sourceIds: ["google-review-guidance"]
  },
  {
    slug: "evidence-before-affiliate",
    title: "Evidence before affiliate: how Starlight reviews technology",
    summary: "A transparent standard for owned, hands-on, source-backed and inferred conclusions—and when commercial links may appear.",
    evidenceStatus: "research-backed",
    lastVerified: verified,
    sections: [
      { heading: "Four evidence states", body: ["Owned and tested means repeated use. Hands-on means direct but limited testing. Source-backed means cited evidence. Inferred means disclosed reasoning without hands-on proof."] },
      { heading: "Commercial separation", body: ["An affiliate relationship does not set the verdict. At launch no affiliate links are active. Future links will be labelled, direct where required and separate from evidence claims."] },
      { heading: "Why the standard exists", body: ["Google asks reviews to demonstrate expertise, evidence, measurements, comparison, benefits, drawbacks and decision factors. Its spam policy distinguishes value-adding affiliate work from replicated merchant content."], bullets: ["No copied merchant descriptions as analysis", "No fake hands-on voice", "No price without source and time", "No best verdict without a named user"] }
    ],
    sourceIds: ["google-review-guidance", "google-spam-policies", "bol-affiliate", "amazon-partnernet", "thomann-affiliate"]
  }
];

export const allEditorial = [...builds, ...comparisons, ...guides];
