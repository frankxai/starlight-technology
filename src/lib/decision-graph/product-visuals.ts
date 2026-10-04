/** Public, fixed catalog media only. Private plans never become image URLs. */
export type ProductVisual = {
  nodeId: string;
  officialUrl: string;
  atlasSlug?: string;
  notice?: string;
  image?: {
    src: string; width: number; height: number; alt: string;
    author: string; license: string; licenseUrl: string; sourceUrl: string;
    reviewedAt: string; changes: string;
  };
};

export const productVisuals: readonly ProductVisual[] = [
  {
    nodeId: "dev-framework-desktop-395",
    officialUrl: "https://frame.work/blog/introducing-the-framework-desktop",
    atlasSlug: "framework-desktop-ryzen-ai-max",
    notice: "This plan describes the AI Max 300-series 395. Framework's current store also lists the newer 495 generation; confirm the generation and configuration before buying.",
  },
  {
    nodeId: "dev-gmktec-evox2-128-2tb",
    officialUrl: "https://de.gmktec.com/en/products/gmktec-evo-x2-amd-ryzen%E2%84%A2-ai-max-395-mini-pc-1?variant=51610049380536",
    notice: "Check the 128 GB / 2 TB variant and Netherlands delivery terms on the official listing. A listing price is not a delivered quote.",
  },
  {
    nodeId: "cmp-rtx-5090",
    officialUrl: "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
    atlasSlug: "geforce-rtx-5090",
  },
  {
    nodeId: "dev-mac-mini-m4", officialUrl: "https://www.apple.com/mac-mini/specs/",
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
