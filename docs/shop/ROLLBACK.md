# Shop rollback plan

- Production remains on `main` (`20de9ec`) until this branch is reviewed on a Vercel preview and merged.
- Hardware decision pages (`/shop/[slug]`), their data (`src/lib/shop.ts`), the affiliate approval boundary and `/partners` are unchanged by this work.
- Rollback after merge: promote the previous production deployment in Vercel, or revert the squash merge. No data migration exists; the shop is Git-native.
- Environment variables introduced (none required): `SHOP_AVAILABILITY_ENDPOINT`, `SHOP_AVAILABILITY_TOKEN`, `SHOP_PAYMENT_WEBHOOK_SECRET`, `SHOP_CHECKOUT_URL_ST_WE_S2B_001`, `NEXT_PUBLIC_SHOP_ANALYTICS`. Absent values keep every path closed.
