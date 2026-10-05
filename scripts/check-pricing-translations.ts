// Lists every English string shown on /pricing and /services that has no
// translation in one of the site's languages. Run: npx tsx scripts/check-pricing-translations.ts
// Exits 1 when anything is missing, so it can gate a commit or CI step.
import { readFileSync } from "node:fs";
import { pricingGroups } from "../src/lib/data/pricing-detailed";
import { aiAutomationTiers } from "../src/lib/data/ai-automation-pricing";
import { pricingTranslations } from "../src/lib/i18n/pricing-text";

export function pricingSourceStrings(): string[] {
  const strings = new Set<string>();
  for (const g of pricingGroups) {
    strings.add(g.title);
    strings.add(g.description);
    for (const item of g.items) {
      strings.add(item.name);
      strings.add(item.tier);
      item.bullets.forEach((b) => strings.add(b));
    }
  }
  for (const t of aiAutomationTiers) {
    strings.add(t.audience);
    strings.add(t.summary);
    t.inclusions.forEach((b) => strings.add(b));
  }
  // Literal tp("...") calls, plus the /services timeline table.
  for (const file of [
    "src/components/sections/pricing-content.tsx",
    "src/components/sections/services-content.tsx",
    "src/components/nigeria-discount-banner.tsx",
  ]) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/tp\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g)) strings.add(JSON.parse(`"${m[1]}"`));
    for (const m of src.matchAll(/^\s+[a-z]+: "((?:[^"\\]|\\.)*)",$/gm)) strings.add(JSON.parse(`"${m[1]}"`));
  }
  // Drop link targets (href: "/booking") caught by the key: "value" pattern.
  return [...strings].filter((s) => !s.startsWith("/"));
}

if (process.argv[1]?.includes("check-pricing-translations")) {
  const source = pricingSourceStrings();
  let missing = 0;
  for (const [lang, dict] of Object.entries(pricingTranslations)) {
    const gaps = source.filter((s) => !dict[s]);
    const unused = Object.keys(dict).filter((k) => !source.includes(k));
    missing += gaps.length;
    console.log(`${lang}: ${source.length - gaps.length}/${source.length} translated` + (unused.length ? `, ${unused.length} unused` : ""));
    gaps.forEach((g) => console.log(`  missing: ${g}`));
    unused.forEach((u) => console.log(`  unused:  ${u}`));
  }
  process.exit(missing ? 1 : 0);
}
