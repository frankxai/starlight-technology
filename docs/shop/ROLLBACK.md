# Shop rollback plan

- Production remains on `main` (`20de9ec`) until this branch is reviewed on a Vercel preview and merged.
- Hardware decision pages (`/shop/[slug]`), their data (`src/lib/shop.ts`), the affiliate approval boundary and `/partners` are unchanged by this work.
- Rollback after merge: promote the previous production deployment in Vercel, or revert the squash merge. No data migration exists; the shop is Git-native.
- Environment variables introduced (none required): `BLOB_READ_WRITE_TOKEN`, `SHOP_AVAILABILITY_ENDPOINT`, `SHOP_AVAILABILITY_TOKEN`, `SHOP_ADMIN_TOKEN`, `SHOP_PAYMENT_WEBHOOK_SECRET`, `SHOP_CHECKOUT_URL_ST_WE_S2B_001`, `NEXT_PUBLIC_SHOP_ANALYTICS`. Absent values keep every path closed.
- Lead data: availability requests live only in the private Blob store (and the optional endpoint), never in Git or on the edge. Rolling back the code leaves the store intact; unlinking the store (or removing `BLOB_READ_WRITE_TOKEN`) stops writes and the form returns to the email fallback. Export first with `GET /api/shop/availability/export?format=csv` if the store is to be deleted.
- Embeds: `/shop/embed/[slug]` and `/api/shop/catalog` are read-only views of the catalogue. Removing them breaks third-party iframes only; nothing else depends on them.
