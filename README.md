# Le Portier x AccelPay checkout demo

**Private sales demo.** This site uses Le Portier's name, marks, product imagery and copy
(from leportiercognac.com) to show what their store looks like with AccelPay checkout in
place of the current Bottle Nexus checkout. It is not affiliated with or endorsed by Le
Portier, it is not a store, and no order is ever placed or charged. Gopuff and ReserveBar
marks belong to their owners. Keep the link unlisted; share it 1:1 only.

Live: https://noshiftsherlock.github.io/leportier-accelpay-demo/

| Page | What it shows |
| --- | --- |
| `index.html` | Home, collection, story, "how your order arrives", ReserveBar note |
| `product.html` | Shay VSOP 750ml with address gate, ship vs deliver, licensed retailer picker |
| `product.html?p=<handle>` | 375ml, Collector's Edition, Hall of Fame Edition (not yet connected state) |
| `checkout.html` | Contact, ship-to, fulfilling retailer, delivery option where it applies, payment placeholder |

Cart drawer opens from the Cart button on every page.

## Real vs illustrative

Real:
- Products, images, copy and current site prices: leportiercognac.com (Shopify products.json), 2026-10-24.
- Retailers, cities, per-retailer prices and stock for Le Portier Shay VSOP 750ml
  (UPC 00736040005209): active listings in the ReserveBar/AccelPay retailer catalog
  (BigQuery `liquidcommerce_mongo_retailer.variants`), pulled 2026-10-24. A few in-stock
  listings per state are shown (TX, NY, NJ, IL, CA, DC).
- Gopuff: the 7 Arizona locations (Chandler, Glendale, Goodyear, Peoria, Phoenix,
  Scottsdale, Tucson) listing "Le Portier Shay" in a live check on 2026-10-24, and the
  77 ZIP codes they deliver to.
- ReserveBar.com product link.

Illustrative (not quotes):
- Shipping ($9.99, mirrors the current site's flat rate), delivery fees, tax (8.5%).
- The Gopuff price ($98.99 brand-site price stands in; Gopuff's own price was not read).
- Liquor Barn same-day option, offered to ZIP3 600 only (Liquor Barn has an On Demand
  fulfillment type in the catalog; its real radius was not checked).
- Payment step. No Stripe, no order API.
- 375ml, Collector's Edition and Hall of Fame Edition have no retailer listings today and
  render a "connected at launch" state.

## How it is wired

Same pattern as `kendall-jackson-lc-demo` (see the `liquidcommerce-elements-demo` skill):
`elements-config.js` holds the LiquidCommerce Elements config behind `enabled: false`,
and `app.js` is a static commerce layer that publishes the same `lce:actions.*` events
with the same `{data, metadata}` envelope as the SDK. Le Portier has no LiquidCommerce
partner account, so there is no Elements token yet.

Address routing: the ZIP in the entered address maps to a state; shipping options are the
licensed retailers in that state that stock Shay VSOP; delivery options appear for Gopuff
delivery ZIPs (about 30 minutes) and Liquor Barn's local area. Sample addresses are one
click away on the product page.

Deploy: GitHub Pages serves `main` at the repo root, so a push to `main` is a deploy.
Bump the `?v=` stamps on `styles.css` / `app.js` when they change.
