import { technology } from "./technology";

// A small, deterministic TF-IDF embedding index. It is lexical, not neural semantic search.
// It runs without provider credentials and never sends visitor queries to a third party.
const stop = new Set(["a", "and", "for", "in", "of", "or", "the", "to", "with", "you", "your", "when", "need", "system"]);
const tokens = (text: string) => text.toLowerCase().match(/[a-z0-9]+/g)?.filter((word) => word.length > 1 && !stop.has(word)) ?? [];
const documents = technology.map((item) => ({
  item,
  words: tokens([item.name, item.maker, item.category, item.role, item.decision, ...item.fit, ...item.avoid, ...item.interfaces].join(" "))
}));
const vocabulary = [...new Set(documents.flatMap((doc) => doc.words))].sort();
const documentFrequency = new Map(vocabulary.map((word) => [word, documents.filter((doc) => doc.words.includes(word)).length]));
const weight = (word: string) => Math.log(1 + documents.length / (1 + (documentFrequency.get(word) ?? 0)));

function embed(words: string[]): number[] {
  const counts = new Map<string, number>();
  words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  const vector = vocabulary.map((word) => (counts.get(word) ?? 0) * weight(word));
  const norm = Math.hypot(...vector);
  return norm ? vector.map((value) => value / norm) : vector;
}
const index = documents.map((doc) => embed(doc.words));

export function searchTechnology(query: string, limit = 10) {
  const words = tokens(query.slice(0, 160));
  if (!words.length) return technology.map((item) => ({ item, score: 0 })).slice(0, limit);
  const vector = embed(words);
  return documents.map((doc, position) => ({ item: doc.item, score: index[position].reduce((sum, value, i) => sum + value * vector[i], 0) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug))
    .slice(0, limit);
}

export const searchIndexInfo = { kind: "local-tfidf", dimensions: vocabulary.length, recordCount: technology.length, sourceDate: "2026-09-28" } as const;
