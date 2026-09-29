# PC and robotics sites → Starlight design direction

Research date: 2026-09-29. Decision: how should the cross-brand Technology Atlas, System Studio and future supervised robotics workspace look and behave? This is source-led analysis of public pages, not a claim to possess private design files or source code. The companion [three-direction board](technology-direction-board.svg) uses original schematics and Starlight copy. No competitor asset enters production.

## Category signals

| Reference | Public information architecture | Principle to extract | Limit for Starlight |
| --- | --- | --- | --- |
| [Apple Mac Studio](https://www.apple.com/nl/mac-studio/) | Product narrative; performance by creative workload; desk ecosystem, accessories, AR placement, model comparison. | Show a system in use before the specification decision; give one object room to breathe. | Single-vendor imagery cannot establish cross-brand compatibility or total cost. |
| [Framework Desktop](https://frame.work/desktop) | Compact thesis; overview, specs, gaming, machine learning, Linux and guides; configure action. [Parts marketplace](https://frame.work/marketplace/parts) continues ownership. | Expose configurability, OS fit, repair and long-tail ownership. | A vendor configurator cannot adjudicate alternatives across ecosystems. |
| [Alienware Area-51](https://www.dell.com/nl-nl/gaming/alienware) | Chassis identity and gaming imagery lead into performance, cooling, configurations and support. | Connect material and thermal design to actual performance. | Aggressive gaming styling obscures quieter creator and enterprise use. |
| [ROG G700](https://rog.asus.com/desktops/full-tower/rog-g700-2025-g700/) | Space-themed product image and lighting; components, reviews and recommended devices. ROG [describes its visual universe](https://rog.asus.com/articles/news/look-inside-the-visual-universe-of-the-republic-of-gamers/). | Material vocabulary can be distinctive when it belongs to the audience. | Neon spectacle is crowded; Starlight should not impersonate an OEM. |
| [Unitree Go2](https://www.unitree.com/go2/) | Movement/video and sensor capability lead; [official store](https://shop.unitree.com/products/unitree-go2) is a separate purchase path. | Motion can demonstrate physical capability. | Demos leave variant, site, support and operator authority unresolved. |
| [Boston Dynamics Spot](https://bostondynamics.com/products/spot/) | Inspection, construction, actual sites and customer stories. [Orbit](https://bostondynamics.com/orbit/) frames fleet operations around facilities and mission data. | Put task, site, data and operator around the machine. | Enterprise evidence cannot be generalized to every robot or site. |
| [Figure 03](https://www.figure.ai/) | Minimal navigation, large home-help proposition, full video, Helix intelligence and company proof. | Cinematic reveal earns one focused claim. | Aspirational video is weak as a procurement or readiness record. |
| [1X NEO](https://www.1x.tech/neo) | Home context, task list, keynote, utility/design/AI/hardware chapters, order and FAQ; expert help for unknown chores. | Put the assistance boundary near the promise. | Household imagery cannot substitute for a tested deployment model. |

The category code is large device imagery, minimal first-read copy, motion, then dense detail or conversion. Starlight's unoccupied role is the **cross-vendor evidence and operating layer**: workload → candidate → exclusion → interfaces → complete-system cost → source → readiness. Its visual signature should be an inspectable system map, with products presented at human scale when rights-approved media exists.

## What is actually known about web technology

The public pages do not disclose complete frontend frameworks, hosting, CMS contracts or private design tokens. Figure serves some images from images.ctfassets.net and 1X serves some icons from cdn.sanity.io. These CDN URLs do not establish their complete CMS or rendering stacks.

- [Dell Design System](https://www.delldesignsystem.com/) publicly documents foundations, components, tokens and Storybook examples; its [grid](https://www.delldesignsystem.com/foundations/grid/) uses a 4px standard. That does not prove every Alienware marketing page uses each component.
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) guide Apple platform experiences. They are not source code or a CSS kit for apple.com.
- ROG publishes brand and visual-language articles. No verified reusable website component package for ROG, Framework, Unitree, Boston Dynamics, Figure or 1X was established in this review.

For Starlight, retain **Next.js 16 App Router + typed Git records + Vercel Git previews**. Build a first-party token system in CSS and typed component contracts. Use [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/accessibility) selectively for keyboard-heavy controls when native HTML is insufficient; avoid a generic component skin. Use [Next Image](https://nextjs.org/docs/app/api-reference/components/image) for owned or licensed media with dimensions, alt text and rights records. Isolate any valuable 3D inspection behind a still fallback and performance budget. Motion should communicate state or physical capability; [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/) supports reduced motion, while CSS suffices for the current Atlas.

## Three original directions

The SVG board uses actual Starlight catalog claims in desktop and mobile examples. It is a composition study, not a screenshot.

| Direction | First read | Type, material and motion | Proof and signature | Assessment |
| --- | --- | --- | --- | --- |
| **A. Evidence Atlas** | “Choose the system. Then the device.” Workload, candidates and exclusion. | Current ink/paper/signal palette; restrained heading, mono evidence labels, calm dense grid. Search/filter responds immediately. | Source date, wrong-fit, interface and cost on the first card. Signature: the system-boundary line. | **Selected** for public Atlas. Proposed direction score 34/35 across fit, distinction, clarity, extension, access, feasibility and rights. |
| **B. Product Gallery** | “See the machine in its setting.” One device and task occupy the viewport. | Warm paper, charcoal, cobalt; rights-approved photography, quiet transitions and detail crops. | Caption leads to spec and comparison. Signature: human-scale setup frame. | Editorial feature pages only; weaker multi-category index. Proposed 28/35. |
| **C. Operations Console** | “What is deployed, where, under whose authority?” Site/asset/task map. | Deep blue, amber, compact operational type; motion only when state changes. | Evidence freshness, operator and stop path. Signature: authority boundary beside task. | Future authenticated fleet product only, after customer/site contract. Proposed 29/35. |

These are design hypotheses, not the repository's release score. Desktop/mobile browser inspection remains open. Anti-references: a cloned Apple hero, ROG neon overload, a Figure-like promise without readiness data, and fake live telemetry.

## Production handoff

1. Make **A** the public shell: first viewport contains a workload control and one real candidate/exclusion; below show evidence, total-cost anatomy, comparison and source. At 390px move the brief above cards, show decisive exclusions before secondary specs, and preserve 44px targets.
2. Use **B** only after a media ledger records owner, variant, license, allowed channel, attribution, expiry and alt text. Until then, use exact interface diagrams and owned schematic art.
3. Reserve **C** for private estate/robot runtime. The current Estate is local, unverified inventory. A site map, status or task control requires real provenance, tenancy and operator authority.
4. Define semantic surface, text, signal, warning, border, focus, spacing, type and motion tokens. Current root values include ink #050607, paper #f1f4ec, signal #c8f36b, cyan #75d8ff, amber #ffbf69. Build typed DecisionCard, EvidenceState, SystemBoundary, SourceStamp and AuthorityBadge with explicit unknown states.
5. Inspect 1440px and 390px, keyboard and 200% zoom; capture interaction and media rights. Score the implemented result against the repository's 26/30 release gate. This research board does not satisfy it.

Implementation on the Atlas branch: src/components/technology-art.tsx provides six original device-class SVG system studies; the public shop has a sourced compute/robotics decision stage, illustrated record grid and split detail headers. The studies are explicitly captioned as schematics. Actual viewport screenshots, interaction inspection and the release score remain pending; do not treat the board or source inspection as those receipts.

## Source and rights ledger

All OEM links above are **reference-only**. Their copy, images, videos, fonts, marks and layout combinations are not licensed to Starlight by this review. The board is an owned SVG using current Starlight catalog text and system-font fallbacks; it contains no OEM media. No third-party capture is packaged.
