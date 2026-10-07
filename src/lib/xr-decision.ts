import { xrDevices } from "./xr-catalog";

export type XRGoal = "prototype" | "workspace" | "capture" | "future";
export type XRTiming = "now" | "later";
export type XRHost = "laptop" | "phone" | "none";
export type XRSelection = { goal: XRGoal; timing: XRTiming; host: XRHost };
export type XRAdvice = {
  deviceId: string;
  verdict: string;
  reason: string;
  constraint: string;
  next: readonly string[];
  alternatives: readonly string[];
  state: "usable-now" | "watchlist";
};

export const defaultXRSelection: XRSelection = { goal: "prototype", timing: "now", host: "laptop" };
export const xrGoalOptions: readonly { id: XRGoal; label: string; detail: string }[] = [
  { id: "prototype", label: "Build in space", detail: "Prototype and test an immersive experience" },
  { id: "workspace", label: "Expand my workspace", detail: "Take a private screen on the move" },
  { id: "capture", label: "Capture what I see", detail: "Record field notes and point-of-view stories" },
  { id: "future", label: "Track what is next", detail: "Explore new spatial interfaces before committing" }
];

const ids = new Set(xrDevices.map((device) => device.id));
export function parseXRSelection(input: unknown): XRSelection {
  if (!input || typeof input !== "object") return defaultXRSelection;
  const value = input as Partial<XRSelection>;
  return {
    goal: xrGoalOptions.some((option) => option.id === value.goal) ? value.goal as XRGoal : defaultXRSelection.goal,
    timing: value.timing === "later" ? "later" : "now",
    host: value.host === "phone" || value.host === "none" ? value.host : "laptop"
  };
}

export function getXRAdvice(input: XRSelection): XRAdvice {
  const selection = parseXRSelection(input);
  if (selection.goal === "capture") return {
    deviceId: "ray-ban-gen-3", verdict: "Start with hands-free capture.",
    reason: "Your output is a recording and an editable note, not a virtual display.",
    constraint: "Confirm local availability, permissions, phone pairing and the archive path before buying.",
    next: ["Test the capture workflow with your phone first.", "Plan transcription and consent before recording people.", "Check the exact frame, fit and local checkout."],
    alternatives: ["quest-3"], state: "usable-now"
  };
  if (selection.goal === "future" && selection.timing === "later") return {
    deviceId: "meta-vr-glasses", verdict: "Keep this on the watchlist.",
    reason: "Meta has announced a lighter, tethered immersive system for spring 2027; the workflow has not been independently validated.",
    constraint: "This is an announced device, not a verified Netherlands offer or a purchase recommendation.",
    next: ["Prototype interactions with existing hardware or a simulator.", "Recheck developer support, fit and regional availability at launch.", "Demand an independent comfort and text-legibility test."],
    alternatives: ["quest-3"], state: "watchlist"
  };
  if (selection.goal === "workspace" && selection.host !== "none") return {
    deviceId: "xreal-one-pro", verdict: "Test a wearable display against your host.",
    reason: selection.host === "phone" ? "A connected phone may be your display source, subject to model-specific compatibility." : "A connected laptop gives the clearest starting test for a portable private display.",
    constraint: "Confirm video output, cable, power, fit and return terms for the exact host. These are display glasses, not standalone VR.",
    next: ["Check your exact host model and video output.", "Test legibility and comfort for a full working session.", "Count the host, power and adapters in the carried system."],
    alternatives: ["quest-3"], state: "usable-now"
  };
  if (selection.goal === "workspace") return {
    deviceId: "quest-3", verdict: "Use a standalone headset for a host-free trial.",
    reason: "With no phone or laptop source, tethered display glasses do not form a complete system.",
    constraint: "Check that the apps you need support the headset; text comfort and battery require direct testing.",
    next: ["Name the app and the exact task before purchasing.", "Try the workspace for a full session.", "Compare a normal laptop against the full headset setup."],
    alternatives: ["xreal-one-pro"], state: "usable-now"
  };
  return {
    deviceId: "quest-3", verdict: selection.goal === "future" ? "Explore now on a testable platform." : "Prototype on hardware you can test now.",
    reason: "Quest 3 has a documented Unity development path and an available device for validating spatial input.",
    constraint: selection.host === "none" ? "You still need access to a suitable development machine for building and testing." : "A simulator is useful, but comfort and interaction require a real headset.",
    next: ["Make one five-minute prototype with a measurable task.", "Test input and comfort on real hardware.", "Capture failure cases before designing a larger world."],
    alternatives: selection.timing === "later" ? ["meta-vr-glasses"] : ["xreal-one-pro"], state: "usable-now"
  };
}

export function getXRDevice(id: string) {
  return ids.has(id) ? xrDevices.find((device) => device.id === id) : undefined;
}

export function answerFromEvidence(question: string, selection: XRSelection) {
  const advice = getXRAdvice(selection);
  const device = getXRDevice(advice.deviceId)!;
  const q = question.toLowerCase();
  let answer: string;
  if (/price|cost|afford|buy|stock|netherlands|available|release/.test(q)) {
    answer = device.id === "meta-vr-glasses"
      ? "Meta quotes US$1,299.99 and spring 2027. The Netherlands price and availability are unverified; do not treat this as a local offer."
      : "This catalog does not carry verified regional merchant prices or stock. Use the official product link to check your region and include the complete system in your budget.";
  } else if (/compatib|connect|laptop|phone|cable|power|battery/.test(q)) {
    answer = device.id === "xreal-one-pro"
      ? "The key unknown is your exact host: verify its video output, cable, power and fit directly before buying. A generic phone or laptop label is not a compatibility guarantee."
      : "Check the complete-system requirements below. Device support for your exact app or host remains unverified until you test it.";
  } else if (/wait|2027|future|new meta|upgrade/.test(q)) {
    answer = "Meta VR Glasses are announced for spring 2027. Build and validate the experience on available hardware now; reassess when developer support, regional availability and independent testing arrive.";
  } else {
    answer = `${advice.verdict} ${advice.reason} ${advice.constraint}`;
  }
  return { answer, mode: "catalog" as const, sources: [device.source], unknown: advice.constraint };
}