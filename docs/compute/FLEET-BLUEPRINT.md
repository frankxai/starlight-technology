# AI agent fleet blueprint: mini PCs, Windows first

Status: research only, 2026-10-05. No machine here was tested hands-on. Buyer region is assumed to be the Netherlands/EU, which is still open. Every number below comes from `data/compute/` and carries its source there. The generated companion is `ENGINEERING-INDEX.md`.

## What the research found

1. In the page-read data a 128 GB Strix Halo machine costs EUR 3,499.99 (GMKtec EVO-X3, EU store, tax not stated) to EUR 4,450.20 incl. VAT (GMKtec EVO-X2, Estonian shop). The lowest VAT-inclusive Dutch listing is the HP Z2 Mini G1a at EUR 3,890.15 (EUR 3,215 ex VAT) from a business reseller that ships when available. A 128 GB DDR5 kit went from USD 329 to USD 3,399 by 18 August 2026, and TrendForce expects DRAM up another 10-15% in Q4 2026. Framework's 128 GB mainboard alone is EUR 3,539 incl. VAT, while a complete Bosgame M5 128 GB/2 TB was EUR 2,439.95 on 24 June.
2. Token speed follows memory bandwidth. Strix Halo has 256 GB/s theoretical. On it, independent tests show 30-35B mixture-of-experts models at 43-86 tokens/s and 70B dense models at 3.7-5.3 (Q4_K_M and Q6_K runs on different machines); one secondary source reports 8-12 at Q4. Apple's M5 Max reaches 614 GB/s and the M5 Ultra 1.2 TB/s. A Mac Studio M5 Max with 64 GB is reported at EUR 3,689 (EveryMac; Apple's NL pages show no prices). No independent Apple tokens/s figure was verified.
3. Most Chinese Strix Halo machines share one board. A community wiki (no counting method stated) estimates the Sixunited platform at about 90% of them, including GMKtec, Bosgame, Corsair, FEVM and NIMO; its hardware page lists the EVO-X2 with the Sixunited board. Minisforum designs its own board. Framework names its partners: FSP for power, Cooler Master and Noctua for cooling.
4. Windows runs this hardware. Lemonade supports Windows 11 with Vulkan, ROCm and NPU backends and an OpenAI-compatible API. Linux is reported to address about 124 GB as GPU memory (the ROCm documentation shows a 100 GB example on a 125.65 GB system), and a Windows cap of 96 GB is reported but unconfirmed from a primary source.
5. Direct sourcing from Alibaba showed no price edge for a single unit. The one Strix Halo 128 GB listing (a search snippet) was USD 3,027-3,107 at MOQ 1.

## Roles in a fleet

| Role | Runs | Memory | Basis |
|---|---|---|---|
| Cockpit | Interactive sessions, headed browser | Existing laptop or desktop | n/a |
| Agent node | Background coding agents, headless browsers, builds | 32 GB for 10 sessions, 64 GB for 20 | Estimate: 1.0-1.5 GB per session plus 8-12 GB for build bursts, from one unpublished 30-minute profile of a 31 GB Windows machine. Replicate it with the method below before buying |
| Local model node | 30-35B mixture-of-experts, occasional 70B | 128 GB class | Size arithmetic: 25 GB and 46 GB including KV cache, plus 24 GB for the OS and 10 agent sessions |
| GPU box | Image and video generation | VRAM, not system RAM | Rent first |

Agent nodes need cores and RAM, not bandwidth. Page-read prices for 64 GB class machines: GMKtec EVO-X2 EUR 1,999.99 (tax not stated), EVO-X1 Pro EUR 1,499.99, Framework mainboard EUR 1,859 incl. VAT (board only). The cheaper serviceable route is SO-DIMM: Minisforum AI X1 Pro-370 at EUR 729 sale and GMKtec K11 from EUR 469.99, both without a verified RAM price, and DDR5 prices have risen sharply. That RAM cost is the open item for this route.

For the local model node, capacity alone gives:

| Machine | 30B MoE | 70B dense | 120B MoE |
|---|---|---|---|
| 64 GB class | yes | no | no |
| 96 GB (Mac Studio M5 Ultra) | yes | yes | no |
| 128 GB class | yes | yes | yes |

Speed is a separate question: independent tests of 70B dense models on 256 GB/s class memory gave about 4-5 tokens/s. That makes a 70B model a batch tool there, not an interactive one.

## When to buy

- Agent node: sample RAM and CPU every 5 seconds for 30 minutes on the machine you use now. Buy a node when median free RAM sits below your floor (4 GB is a reasonable one for Windows) during normal work, and when the same period shows the cost: longer task completion times, queue waits, retries or timeouts. Free RAM alone does not show that another machine will help.
- Local model node: buy when the monthly API cost of the tasks you would move is higher than the machine's monthly cost. The data holds no usage figures, so this trigger is open for each buyer.
- GPU box: rent until daily use justifies owning. At EUR 5,499 for an RTX 5090 against RunPod at USD 0.69-0.99 per hour, break-even is roughly 1.9-2.7 years of 8-hour days, before power and host costs. That arithmetic ignores the USD/EUR rate, whether a rented GPU gives equivalent results, how fully you would use an owned card, and the admin and recovery time an owned machine costs.

## Windows, Linux and Mac

Windows is cheaper to start and familiar. Windows 11 Home has no incoming Remote Desktop and no Hyper-V (both need Pro). Update restarts follow active hours of 8-17 by default, and Microsoft documents that the "no auto-restart" policy does not work as described, so agent sessions need a supervisor that survives reboots. WSL2 defaults to 50% of host RAM, NAT networking and a 60-second idle shutdown; set `.wslconfig` explicitly.

Linux has the best-documented Strix Halo path and is the only OS for the NVIDIA DGX Spark. Docker Desktop is free for companies under 250 employees and under USD 10M revenue.

macOS has the bandwidth lead and works as an always-on host: desktop Macs can restart after power loss, and launchd daemons run without a login. Apple hardware is not affiliate-eligible on the Apple program pages read.

Mixing them needs one network layer. Tailscale's free Personal plan covers 6 users and unlimited devices. Sunshine hosts on Windows, Linux and macOS and Moonlight clients exist for all three. Universal Control works only between Apple devices.

## Operating stack (all free or open source in the sources read)

Remote access: Tailscale and OpenSSH Server. Monitoring: Uptime Kuma, Beszel, Netdata or windows_exporter, all with Windows support. Backup: restic or Kopia to Backblaze B2 at USD 6.95 per TB per month. Secrets: Infisical (MIT, self-hostable) or 1Password service accounts. Windows licence prices were not verified because Microsoft's pages timed out.

## Sourcing playbook

| Channel | Finding | Verdict |
|---|---|---|
| Brand EU stores | GMKtec ships from Bremen with a 24-month warranty on its EU store (its US store states 12), a 7-day return and a 15% restocking fee. Minisforum lists sale and regular prices with tax not stated. | Compare against a VAT-stated reseller before ordering |
| Framework | VAT-inclusive, named suppliers, serviceable, out of stock on the day read. Support and warranty terms were not read. | Highest price for 128 GB among the complete options seen; confirm support terms first |
| B2B reseller | HP Z2 Mini G1a EUR 3,890.15 incl. VAT, ships when available | Cheapest verified in-NL 128 GB with VAT stated; confirm the SKU |
| Alibaba | One Strix Halo 128 GB listing seen (a search snippet) at USD 3,027-3,107, MOQ 1; no landed quote obtained | No price edge shown for one unit; use for samples and ODM talks |
| Refurbished business mini PCs | EUR 164-495 on refurbed.nl, 4-16 GB base RAM | Light agent nodes only |
| Used Mac Studio, used GPUs | Marktplaats, Tweakers V&A and Back Market NL blocked; used RTX 3090 EUR 660-1,039 from four snippets | Unverified |

Import facts, with their sources in the data: from 1 July 2026 until 1 July 2028 a EUR 3 duty applies per item category on parcels up to EUR 150, which does not touch a 128 GB machine. Duty on heading 8471 is reported as 0% and import VAT in the Netherlands as 21%, both from search summaries rather than Douane or TARIC pages. EU consumers get a 2-year legal guarantee from the seller regardless of a shorter brand warranty (GMKtec's US store states 12 months, its EU store 24). GMKtec's EU shipping policy summary mentions declaring a lower commodity value. Customs undervaluation is a compliance risk and must not be used.

## Building machines or partnering

- White-label on an existing platform: Sixunited supplies the AXB35 board and a stock case, so an own brand can start with case, firmware and packaging. No public Sixunited MOQ, NRE or certification cost was found. Search snippets for generic Shenzhen mini PCs show custom branding from 500-1,000 units and 30-60 days of lead time. Neither is verified for Strix Halo.
- Reseller route: Minisforum's bulk programme starts at 10 units with wholesale pricing, a 3-year warranty and a German warehouse. Beelink offers ODM and OEM through wholesale@bee-link.com.
- Framework's model, a standard board plus named partners, is the closest public example of designing the case, cooling and power around a vendor platform.
- No evidence was found that Taiwan ODMs such as Compal, Wistron or Quanta build these machines. Lite-On, FSP and Cooler Master are Taiwan component suppliers named in sources.

A sensible order is reseller or integrator first, then a co-branded case, then a board. The data does not support a manufacturing plan: certification costs for CE, RoHS, WEEE and ecodesign have no sourced figure.

## Revenue routes

Affiliate programs found: Minisforum 2% on Awin, 30-day cookie (page also says 7 days). Beelink 5-10% and Framework 1-5% are directory claims. GMKtec is on Awin with terms behind signup. Amazon's NL and DE fee pages conflict (6% and 5% for electronics). Apple's program covers digital content only. Minisforum's terms apply 2% to the price excluding VAT and postage, so a EUR 4,000 machine incl. 21% VAT earns about EUR 66 before reversals.

Disclosure: Awin requires #Ad or #sponsorship style labels, which is stricter than a footer note. The Dutch advertising code requires recognisable advertising. UK specifics were not verified.

Fleet offer: hardware resale margins appear as about 30-40% in one source and about 16% in another (both search summaries). Managed IT services show gross margins of 50-60% and USD 2,000-3,000 per month for a fully managed team of up to 20, from search summaries and for conventional IT, not AI fleets. No sourced price exists for an AI-agent fleet setup fee or retainer. Adjacent offers: Puget Systems from USD 4,812.73, tinygrad tinybox, Framework Desktop (no managed agent layer) and the Dutch AiBitches.nl (software modules, no price). This blueprint makes no revenue forecast.

## Research programme

Re-verify each price before it is used for a decision, and treat anything older than 30 days as stale. The validator warns on that and refuses a price without a date, an Amazon price, a variant that disagrees with the machine's memory, or a measurement claim that rests only on search snippets.

Open items that block a purchase decision:

1. NL merchant prices (Tweakers Pricewatch, Coolblue, Megekko, Azerty and others returned 403 to plain fetches; a browser session is needed).
2. EU official price for EVO-X2 128 GB, and a live Bosgame M5 price.
3. Windows 96 GB GPU-memory cap on 128 GB Strix Halo machines, from AMD or Microsoft.
4. Independent Windows benchmarks, and any Mac Studio tokens/s.
5. Mac Studio M5 Max 128 GB and Ultra 128-512 GB prices in EUR.
6. Complete DIY totals (case, PSU, SSD) for the 64 GB and 128 GB builds.
7. Dutch used-market prices for Mac Studio, mini PCs and GPUs.
8. Sixunited MOQ, NRE and certification costs.
9. Primary pages for Douane, TARIC, ACM and EU consumer rules.
10. Microsoft licence prices, and the EU price of any machine that reaches a short list.

Only the owner applies to affiliate programs, contacts makers for wholesale or ODM terms, or makes a purchase.
