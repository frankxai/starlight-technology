import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Starlight Technology", short_name: "Starlight Tech", description: "Buying intelligence for AI-native studios.", start_url: "/", display: "standalone", background_color: "#050607", theme_color: "#c8f36b" }; }
