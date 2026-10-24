# Le Portier on Shopify with the AccelPay app (sales demo)

**Private sales demo.** This site uses Le Portier's name, marks, product imagery and copy
(from leportiercognac.com) to show their Shopify store with the AccelPay Shopify app
installed. It is not affiliated with or endorsed by Le Portier, it is not a store, and no
order is ever placed or charged. Gopuff, Shopify and ReserveBar marks belong to their
owners. Keep the link unlisted; share it 1:1 only.

Live: https://noshiftsherlock.github.io/leportier-accelpay-demo/

## The pitch it shows

leportiercognac.com runs on Shopify (confirmed 2026-10-24: `window.Shopify` present,
`/products.json` serves the catalog). The demo keeps their theme, the native Shopify cart
drawer and the Shopify one-page checkout. The AccelPay Shopify app takes over payments,
taxes and order routing to licensed retailers, so there is no third-party cart and the
order and customer record stay in the brand's Shopify admin. Small callouts at checkout
mark what AccelPay does.

Express checkout (Shop Pay, Apple Pay, Google Pay) is supported by the AccelPay Shopify
integration and appears at the top of checkout and in the cart drawer, as on a standard
Shopify store. In the demo the buttons fill a sample contact and address and continue.

| Page | What it shows |
| --- | --- |
| `index.html` | Home, collection, story, "How this works", team panel, reordering note |
| `product.html` | Shay VSOP 750ML product page (Shopify theme style) |
| `product.html?p=<handle>` | 375ML, Collector's Edition, Hall of Fame Edition (coming soon state) |
| `checkout.html` | Shopify one-page checkout: shipping rates by address (licensed retailer per state, Gopuff about 30 minute delivery in Arizona ZIPs), express checkout plus card payment, AccelPay callouts |

## Real vs illustrative

Real:
- Products, images, copy and Shopify prices: leportiercognac.com products.json, 2026-10-24.
- Licensed retailers stocking Shay VSOP 750ml (UPC 00736040005209), cities and stock:
  ReserveBar/AccelPay retailer catalog, 2026-10-24 (TX, NY, NJ, IL, DC). Vista Wine &
  Spirits, Longhorn Wine and Spirits and Mashbill Wine & Spirits are excluded on purpose.
- Gopuff: 7 Arizona locations listing "Le Portier Shay" in a live check on 2026-10-24,
  and their 77 delivery ZIPs.
- ReserveBar.com product link.

Illustrative:
- Shipping ($9.99, mirrors their current flat rate) and delivery rates, tax (8.5%).
- Liquor Barn same-day option, offered to ZIP3 600 only (radius not checked).
- Payment fields. Nothing is charged.
- 375ML, Collector's Edition and Hall of Fame Edition have no retailer listings today.

Deploy: GitHub Pages serves `main`; a push is a deploy. Bump `?v=` on `styles.css` and
`app.js` when they change.
