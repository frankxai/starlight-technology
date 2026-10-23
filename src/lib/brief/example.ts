import type { SourceInput } from "./core";

// Worked example for the free lab. Fictional vendor decision; no real company data.
export const exampleTitle = "Q4 tooling decision: note sync vendor";
export const exampleSummary = "Decide whether to renew the current note sync vendor or move to Vendor B before the renewal date, with the open questions the team must answer first.";

export const exampleSources: SourceInput[] = [
  {
    label: "Meeting notes 23 Sep",
    url: "notes/meeting-0923.md",
    text: `Vendor B quoted 40% less per seat but requires a 24-month term.
Sam thinks we should wait for Q1 pricing before committing.
Current vendor renews on 15 November at the existing rate.
Should we ask the current vendor to match the quote?
Action: Priya to request a written quote from Vendor B by Friday. owner: @priya`
  },
  {
    label: "Support ticket export",
    url: "exports/support-2026-09.csv",
    text: `Sync failures were reported 11 times in September, up from 4 in August.
Average time to resolution was 2.3 days.
Three of the failures affected the shared research folder.
We need to confirm whether the failures correlate with the large PDF uploads. owner: @dan`
  },
  {
    label: "Finance thread",
    url: "mail/finance-renewal",
    text: `Finance confirmed the renewal is not yet signed and the current vendor renews on 30 November.
Decided: no new 24-month commitments without a documented exit clause.
Is the 40% saving still real once migration time is costed?
Prepare a one-page migration cost estimate before the decision call. owner: @priya`
  }
];
