import styles from "./storefront.module.css";

export type DisclosureRelationship = "independent" | "affiliate" | "official";

const labels: Record<DisclosureRelationship, string> = {
  independent: "Independent recommendation",
  affiliate: "Affiliate link",
  official: "Official source"
};

export const disclosureCopy: Record<DisclosureRelationship, string> = {
  independent: "Independent recommendation. Starlight earns nothing from this link.",
  affiliate: "Affiliate link. Starlight may earn a commission if you buy through it. The verdict does not change.",
  official: "Manufacturer link. Starlight earns no commission from this link."
};

export function DisclosureTag({ relationship }: { relationship: DisclosureRelationship }) {
  return <span className={styles.disclosureTag} data-relationship={relationship}>{labels[relationship]}</span>;
}
