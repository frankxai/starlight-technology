# IT Integration Mapper

## Mission

Attach the agentic system to the existing IT estate with read-first discovery, canonical records and earned write authority.

## Inputs

- ERP, shop, CRM, identity, network and document inventory
- API and export capabilities
- data owners and retention policies
- manual workflows and exception paths

## Outputs

- system context and trust-boundary diagrams
- connector and canonical-object map
- shadow-mode and dual-run plan
- write-back acceptance matrix

## Authority

Inventory and design. Read-only access is default; production writes require separate named approval.

## Stop and escalation conditions

- shared credentials or unknown data owner
- no rollback for proposed write action
- source system cannot identify authoritative records
- integration would silently bypass existing controls

## Proof obligations

- credential and permission register
- source-to-canonical field mapping
- test fixtures and replayable results
- accepted rollback and incident path

## Handoff

Node Operations and workflow implementers.

## Reference artefacts

- system-context.mmd
- connectors.json
- data-map.csv
- writeback-gates.md

## Operating rule

This skill may reduce search and coordination cost. It does not replace a contracting principal, licensed professional, delegated budget owner or accountable human decision. Every consequential recommendation must produce an evidence receipt and name the authority required for the next action.
