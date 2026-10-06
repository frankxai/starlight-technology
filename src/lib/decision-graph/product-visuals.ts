/** Public, fixed catalog media only. Private plans never become image URLs. */
export type ProductVisual = {
  nodeId: string;
  officialUrl: string;
  atlasSlug?: string;
  notice?: string;
  gallery: { url: string; label: string };
  video?: {
    id: string; title: string; publisher: string; channelUrl: string;
    sourceUrl: string; embed: boolean; reviewedAt: string; scope: string;
  };
  image?: {
    src: string; width: number; height: number; alt: string;
    author: string; license: string; licenseUrl: string; sourceUrl: string;
    reviewedAt: string; changes: string; official?: boolean; permissionUrl?: string;
  };
};

export const productVisuals: readonly ProductVisual[] = [
  {
    nodeId: "dev-framework-desktop-395",
    officialUrl: "https://frame.work/blog/introducing-the-framework-desktop",
    atlasSlug: "framework-desktop-ryzen-ai-max",
    gallery: { url: "https://frame.work/blog/introducing-the-framework-desktop", label: "Framework's 395 launch gallery" },
    image: {
      src: "/images/products/framework-desktop-395.jpg", width: 800, height: 600,
      alt: "Framework Desktop DIY kit laid out with the open chassis, side panel, cooling fan, front tiles, expansion cards and storage drives",
      author: "Iroh / Framework", license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      permissionUrl: "https://guides.frame.work/Info/Licensing",
      sourceUrl: "https://guides.frame.work/Guide/Framework+Desktop+DIY+Edition+Quick+Start+Guide/464?lang=en",
      reviewedAt: "2026-10-06", changes: "Unchanged Framework Guides large rendition.", official: true,
    },
    video: {
      id: "mmntN7zIekU", title: "Local AI on the Framework Desktop: Best Models for 32GB, 64GB, and 128GB",
      publisher: "Framework", channelUrl: "https://www.youtube.com/@FrameworkComputer",
      sourceUrl: "https://community.frame.work/t/choosing-a-framework-desktop-for-local-ai-32gb-64gb-and-128gb/84573",
      embed: true, reviewedAt: "2026-10-06",
      scope: "Manufacturer demonstration of local AI on the 32, 64 and 128 GB Desktop. Results depend on the model and runtime; this is not a test of your saved plan.",
    },
    notice: "This plan describes the AI Max 300-series 395. Framework's current store also lists the newer 495 generation; confirm the generation and configuration before buying.",
  },
  {
    nodeId: "dev-gmktec-evox2-128-2tb",
    officialUrl: "https://de.gmktec.com/en/products/gmktec-evo-x2-amd-ryzen%E2%84%A2-ai-max-395-mini-pc-1?variant=51610049380536",
    gallery: { url: "https://de.gmktec.com/en/products/gmktec-evo-x2-amd-ryzen%E2%84%A2-ai-max-395-mini-pc-1?variant=51610049380536", label: "GMKtec's EVO-X2 product gallery" },
    video: {
      id: "goPySD6_eXc", title: "Unboxing the GMKtec EVO-X2",
      publisher: "GMKtec", channelUrl: "https://www.youtube.com/@gmk782",
      sourceUrl: "https://www.gmktec.com/pages/drivers-and-software",
      embed: true, reviewedAt: "2026-10-06",
      scope: "GMKtec's official EVO-X2 unboxing, linked in its support center. Inspect the enclosure and ports; this demonstration does not establish the 128 GB / 2 TB configuration, delivered price or measured inference performance.",
    },
    notice: "Check the 128 GB / 2 TB variant and Netherlands delivery terms on the official listing. A listing price is not a delivered quote.",
  },
  {
    nodeId: "cmp-rtx-5090",
    officialUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
    atlasSlug: "geforce-rtx-5090",
    gallery: { url: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/", label: "NVIDIA's RTX 5090 gallery" },
    video: {
      id: "EZ5UBhEDm-I", title: "GeForce RTX 5090 Founders Edition Overview",
      publisher: "NVIDIA GeForce", channelUrl: "https://www.youtube.com/@NVIDIAGeForce",
      sourceUrl: "https://www.youtube.com/watch?v=EZ5UBhEDm-I",
      embed: true, reviewedAt: "2026-10-06",
      scope: "NVIDIA's Founders Edition card and features. A complete workstation also needs compatible CPU, memory, power, cooling and storage; partner cards can differ.",
    },
  },
  {
    nodeId: "dev-mac-mini-m4", officialUrl: "https://www.apple.com/mac-mini/specs/",
    gallery: { url: "https://www.apple.com/newsroom/2024/10/apples-new-mac-mini-is-more-mighty-more-mini-and-built-for-apple-intelligence/", label: "Apple's M4 Mac mini gallery" },
    video: {
      id: "bXNYCpZdXAE", title: "Introducing the all-new Mac mini | Apple",
      publisher: "Apple UK", channelUrl: "https://www.youtube.com/@AppleUK",
      sourceUrl: "https://www.apple.com/newsroom/2024/10/apples-new-mac-mini-is-more-mighty-more-mini-and-built-for-apple-intelligence/",
      embed: false, reviewedAt: "2026-10-06",
      scope: "Apple's M4 and M4 Pro introduction. The video does not identify your selected memory/storage configuration. Open on YouTube; the embed metadata request returned HTTP 403 during review, so in-page playback remains unverified.",
    },
    image: {
      src: "/images/products/mac-mini-m4.jpg", width: 960, height: 806,
      alt: "Silver Mac mini M4 photographed on a table; its memory and storage configuration cannot be identified from this photo.",
      author: "Seasider53", license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Mac_mini_2024_M4.jpg",
      reviewedAt: "2026-10-04", changes: "Wikimedia's 960-pixel thumbnail, used unchanged.",
    },
  },
];

export function productVisualFor(nodeId: string): ProductVisual | undefined {
  return productVisuals.find((item) => item.nodeId === nodeId);
}
