export type XRDevice = {
  id: string;
  name: string;
  class: "Immersive headset" | "Tethered display glasses" | "AI camera glasses";
  status: string;
  makerClaim: string;
  fit: string;
  avoid: string;
  system: string;
  source: { title: string; url: string; checked: string };
  officialUrl: string;
};

// Research only. No affiliate identifiers, merchant prices, stock claims, or hands-on claims.
// Status is a snapshot and requires re-verification before an offer is added.
export const xrDevices: readonly XRDevice[] = [
  {
    id: "quest-3",
    name: "Meta Quest 3",
    class: "Immersive headset",
    status: "Released · check local stock",
    makerClaim: "Standalone mixed reality headset with full-colour passthrough and an established Quest development path.",
    fit: "Build and test spatial lessons, interactive prototypes or immersive demos now.",
    avoid: "Your primary job is unobtrusive outdoor capture or a lightweight travel monitor.",
    system: "Headset + development machine + Unity/OpenXR workflow + testing budget.",
    source: { title: "Meta Quest 3 product and developer documentation", url: "https://developers.meta.com/horizon/documentation/unity/unity-tutorial-hello-vr/", checked: "2026-09-24" },
    officialUrl: "https://www.meta.com/quest/quest-3/"
  },
  {
    id: "xreal-one-pro",
    name: "XREAL One Pro",
    class: "Tethered display glasses",
    status: "Released · check local stock",
    makerClaim: "Micro-OLED wearable display glasses intended to work with a compatible source device.",
    fit: "Carry a large private display for laptop, handheld or mobile media workflows.",
    avoid: "You need a standalone VR platform, room-scale interaction or a general-purpose spatial app store.",
    system: "Glasses + compatible host + power/cable plan; verify fit and regional returns.",
    source: { title: "XREAL One Pro product specifications", url: "https://www.xreal.com/one-pro", checked: "2026-09-24" },
    officialUrl: "https://www.xreal.com/one-pro"
  },
  {
    id: "ray-ban-gen-3",
    name: "Ray-Ban Meta (Gen 3)",
    class: "AI camera glasses",
    status: "Announced as available · verify NL checkout",
    makerClaim: "Hands-free camera, audio and Meta AI in an everyday glasses format; no immersive VR display.",
    fit: "Capture creator field notes and point-of-view footage, then process them in your existing studio.",
    avoid: "You need spatial overlays, immersive simulations or a private virtual monitor.",
    system: "Glasses + phone + consent-aware capture workflow + archive and editing tools.",
    source: { title: "Meta Connect 2026 AI glasses announcement", url: "https://about.fb.com/news/2026/09/introducing-ray-ban-meta-audio-glasses-new-styles-plus-muse/", checked: "2026-09-24" },
    officialUrl: "https://www.meta.com/ai-glasses/"
  },
  {
    id: "meta-vr-glasses",
    name: "Meta VR Glasses",
    class: "Immersive headset",
    status: "Announced · spring 2027 target",
    makerClaim: "About 100 g glasses tethered to a compute and battery puck; 5K Infinite Display, eye and hand input. Meta announces US$1,299.99 for spring 2027.",
    fit: "Track the promise of a lighter spatial workspace and reassess once independent tests and regional launch details arrive.",
    avoid: "You must ship a VR experience or purchase hardware this quarter; NL price and availability are not established here.",
    system: "Future glasses + tethered puck; verify SDK, battery, prescription fit, launch region and real workflows at release.",
    source: { title: "Meta VR Glasses announcement, 23 September 2026", url: "https://about.fb.com/news/2026/09/introducing-meta-vr-glasses-3d-movies-immersive-live-sports-100-grams/", checked: "2026-09-24" },
    officialUrl: "https://www.meta.com/nl-nl/blog/meta-vr-glasses-announcement-meta-connect/"
  }
];
