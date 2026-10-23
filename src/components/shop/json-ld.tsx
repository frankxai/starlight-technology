import { serializeJsonLd } from "@/lib/catalog/schema";

export function JsonLd({ schema }: { schema: Record<string, unknown> | null }) {
  if (!schema) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />;
}
