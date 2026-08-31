# Data Model Roadmap

## Launch: Git-native typed records

- `SourceRecord`: publisher, URL, primary/secondary, verification date.
- `Build`: objective, budget, fit/avoid rules, allocation, evidence and sources.
- `Comparison`: options, key constraints, verdict, evidence and sources.
- `Guide`: decision framework, evidence and sources.

Tests enforce unique slugs, dated verification, source resolution and editorial depth.

## Later: governed product graph

Add a database only after product volume and repeated offer updates make Git-native records expensive. Candidate entities: Product, Variant, Specification, CompatibilityEdge, Workload, Evidence, Merchant, Offer, PriceObservation, Build, Comparison, VerdictRevision, ClickEvent and AlertSubscription.

## Price rules

- Never call merchant APIs in page requests.
- Ingest centrally and retain source and timestamp.
- Separate manufacturer reference price from merchant offer.
- Expire stale offers; never display invented continuity.
