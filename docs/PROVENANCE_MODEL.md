# Provenance and Evidence Model

## Purpose

The evidence ledger makes every consequential claim, action, payment and approval reconstructable. It is not an activity feed. It is the join layer between contracts, systems, assets, models, people and accounting treatment.

## Core record

Every evidence record should carry:

- stable record ID;
- source system, document or sensor identity;
- observed and effective timestamps;
- organisation, asset, workload and contract references;
- source owner and access class;
- evidence state: declared, documented, verified or accepted;
- input snapshot, stable source ID or content hash;
- model, tool, workflow and skill version;
- actor identity and delegated authority;
- output artefact and downstream decision;
- approval, rejection, exception or expiry;
- retention, deletion and legal-hold class.

## Decision receipt

A decision receipt binds:

1. the exact question;
2. the evidence set available at decision time;
3. the calculation or reasoning version;
4. the accountable human or delegated rule;
5. the accepted action and maximum exposure;
6. the rollback or exit path;
7. the next review trigger.

## Value ledger

Report these separately:

- booked revenue and contribution margin;
- verified operating cost avoided;
- capacity released but not monetised;
- working-capital or liquidity release;
- avoided future spend;
- narrative or strategic option value.

Never blend the categories into a single “AI value” number.

## Storage pattern

- Git: versioned skills, contracts, policies, schemas and system specifications.
- Operational database: current objects, approvals and immutable event references.
- Object storage: source documents, exports, acceptance evidence and large artefacts.
- Monitoring: time-series infrastructure, energy and service evidence.
- E-signature provider: envelope, signer and final document identifiers.

A production implementation must choose retention, residency, security and access controls before ingesting client data.
