/* Le Portier demo: their Shopify store with the AccelPay Shopify app.
 *
 * The storefront, cart drawer and one-page checkout imitate Shopify (Dawn theme
 * cart, Shopify checkout). What AccelPay adds is shown as small callouts at
 * checkout: payments, taxes and routing each order to a licensed retailer by the
 * shipping address. No third-party cart.
 *
 * AccelPay Payments does not support Shop Pay, Apple Pay, Google Pay or
 * subscriptions, so the checkout shows card payment only. Do not add express
 * checkout buttons.
 *
 * WHAT IS REAL AND WHAT IS NOT
 *   Real:  products, images, copy and Shopify prices from leportiercognac.com
 *          (products.json, 2026-10-24). Licensed retailers stocking Le Portier Shay
 *          VSOP 750ml (UPC 00736040005209), their cities and stock, from the
 *          ReserveBar/AccelPay retailer catalog, 2026-10-24. The 7 Gopuff locations
 *          and their 77 delivery ZIPs, from a live Gopuff check, 2026-10-24.
 *   Not:   shipping and delivery rates, the tax rate, the payment step. No order is
 *          ever placed.
 */
(function () {
  'use strict';

  const VSOP = 'le-portier-shay-vsop';
  const CATALOG = {
    'le-portier-shay-vsop': {
      name: 'LE PORTIER SHAY VSOP', short: 'Le Portier Shay VSOP', size: '750ML', tag: 'VSOP Cognac',
      price: 9899, connected: true, donate: 5,
      image: 'assets/vsop.png', gallery: ['assets/vsop.png', 'assets/banner.jpg', 'assets/box-bottle.jpg'],
      lead: 'Timeless VSOP Cognac, blending tradition with modern allure.', specs: 'ABV: 40% / VOLUME: 750ML',
      desc: ['Le Portier Shay is a timeless VSOP Cognac which embodies intricate craftsmanship and centuries-old tradition.',
             'Crafted with traditional methods in a Charentais copper pot still and aged in French Oak barrels, Shay artfully blends Grande Champagne, Petite Champagne, and Fins Bois grapes.']
    },
    'shay-vsop-375ml': {
      name: 'SHAY VSOP, 375ML', short: 'Shay VSOP, 375ML', size: '375ML', tag: 'VSOP Cognac',
      price: 5999, connected: false, donate: 3,
      image: 'assets/vsop-375.png', gallery: ['assets/vsop-375.png'],
      lead: 'Smooth. Layered. Refined.', specs: 'ABV: 40% / VOLUME: 375ML',
      desc: ['An elevated French cognac designed for gifting, celebrating, and savoring the moments that matter most.',
             'Flavor profile: caramelized spiced apples, chocolate tones, velvety butterscotch, and a hint of warm smokiness.']
    },
    'collectors-edition': {
      name: "COLLECTOR'S EDITION", short: "Collector's Edition", size: '750ML', tag: 'Limited to 25,000 bottles',
      price: 12999, connected: false,
      image: 'assets/collectors.png', gallery: ['assets/collectors.png', 'assets/box.png'],
      lead: 'An exclusive release of just 25,000 bottles.', specs: 'SHAY VSOP / PRESENTATION BOX',
      desc: ['Produced in collaboration with Hall of Fame great, acclaimed broadcaster and podcast host, Shannon Sharpe, Shay by Le Portier is an exclusive release of just 25,000 bottles.',
             'A cognac to share with friends and family, toasting to life’s milestones and the successes we build on the foundations loved ones provide.']
    },
    'the-hall-of-fame-edition': {
      name: 'HALL OF FAME EDITION', short: 'Hall of Fame Edition', size: '750ML', tag: 'Limited edition',
      price: 14999, connected: false,
      image: 'assets/cutout.png', gallery: ['assets/cutout.png', 'assets/hof.jpg'],
      lead: 'LIMITED EDITION', specs: 'SHAY VSOP / CUSTOM WOODEN BOX',
      desc: ['Crafted to honor the induction of Sterling Sharpe into the Hall of Fame, this limited release pays tribute to the bond between two greats: Shannon and Sterling Sharpe.',
             'Encased in a custom-designed wooden box, with a hand-drawn portrait of the Sharpe brothers.']
    }
  };
  const ORDER = [VSOP, 'shay-vsop-375ml', 'collectors-edition', 'the-hall-of-fame-edition'];

  // REAL: licensed retailers with an active, in-stock Le Portier Shay VSOP listing in
  // the ReserveBar/AccelPay retailer catalog, 2026-10-24 (a few per state).
  const RETAILERS = [
    { id: 'specs-0',   name: "Spec's Wines, Spirits & Finer Foods", city: 'Houston',       st: 'TX', stock: 15 },
    { id: 'specs-116', name: "Spec's Wines, Spirits & Finer Foods", city: 'Westlake',      st: 'TX', stock: 8 },
    { id: 'specs-151', name: "Spec's Wines, Spirits & Finer Foods", city: 'Plano',         st: 'TX', stock: 6 },
    { id: 'bottlebuys', name: 'BottleBuys',                         city: 'Glen Head',     st: 'NY', stock: 3 },
    { id: 'bottlescases', name: 'Bottles and Cases',                city: 'Huntington',    st: 'NY', stock: 8 },
    { id: 'bottlerepublic', name: 'Bottle Republic',                city: 'Somerset',      st: 'NJ', stock: 5 },
    { id: 'hollywood', name: 'Hollywood Liquors',                   city: 'West New York', st: 'NJ', stock: 2 },
    { id: 'liquorbarn', name: 'Liquor Barn',                        city: 'Wheeling',      st: 'IL', stock: 8, localZip3: ['600'] },
    { id: 'westdupont', name: '1 West Dupont Wine & Liquors',       city: 'Washington',    st: 'DC', stock: 19 }
  ];
  // REAL: Gopuff locations listing "Le Portier Shay" (live check 2026-10-24) and their delivery ZIPs.
  const GOPUFF_ZIPS = ['85016','85018','85020','85022','85023','85024','85027','85028','85029','85032','85037','85044','85045','85048','85050','85053','85054','85083','85085','85086','85226','85251','85253','85254','85255','85256','85258','85259','85260','85283','85284','85302','85304','85306','85307','85308','85309','85310','85323','85326','85329','85335','85338','85339','85340','85345','85351','85353','85355','85363','85373','85374','85375','85378','85379','85381','85382','85383','85387','85392','85395','85396','85619','85707','85708','85710','85711','85712','85713','85715','85716','85718','85730','85747','85748','85749','85750'];

  // ILLUSTRATIVE rates and tax.
  const RATES = { shipping: 999, gopuff: 499, local: 999 };
  const TAX_RATE = 0.085;
  const STATE_NAMES = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming' };
  const ZIP3 = [[5,5,'NY'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],[70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,200,'DC'],[201,201,'VA'],[202,205,'DC'],[206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],[430,459,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[569,569,'DC'],[570,577,'SD'],[580,588,'ND'],[590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,715,'LA'],[716,729,'AR'],[730,749,'OK'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[885,885,'TX'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],[995,999,'AK']];
  function stateForZip(zip) {
    if (!/^\d{5}$/.test(zip)) return null;
    const n = parseInt(zip.slice(0, 3), 10);
    for (const [a, b, s] of ZIP3) if (n >= a && n <= b) return s;
    return null;
  }

  // Shipping rates the AccelPay app returns for a ZIP: one per licensed in-state
  // retailer, plus delivery where it applies.
  function ratesFor(zip) {
    const st = stateForZip(zip); if (!st) return null;
    const out = [];
    if (GOPUFF_ZIPS.indexOf(zip) >= 0) out.push({ id: 'gopuff', kind: 'delivery', title: 'Delivery in about 30 minutes',
      sub: 'Gopuff, ' + (/^85[67]/.test(zip) ? 'Tucson' : 'Phoenix area') + ' · licensed retailer', price: RATES.gopuff, icon: 'assets/gopuff-icon.png', by: 'Gopuff' });
    RETAILERS.filter(r => r.localZip3 && r.localZip3.indexOf(zip.slice(0, 3)) >= 0).forEach(r => out.push({ id: r.id + '-local', kind: 'delivery',
      title: 'Same-day local delivery', sub: r.name + ', ' + r.city + ', ' + r.st + ' · licensed retailer', price: RATES.local, by: r.name + ' (' + r.city + ', ' + r.st + ')' }));
    RETAILERS.filter(r => r.st === st && r.stock > 0).forEach(r => out.push({ id: r.id, kind: 'shipping',
      title: 'Standard shipping, 2 to 5 business days', sub: 'Ships from ' + r.name + ', ' + r.city + ', ' + r.st + ' · licensed retailer', price: RATES.shipping, by: r.name + ' (' + r.city + ', ' + r.st + ')' }));
    return { st: st, rates: out };
  }

  // ---------------------------------------------------------------- cart (Shopify AJAX cart stand-in)
  const LS = 'leportier-shopify-demo-v1';
  const state = load() || { items: [] };
  function load() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }
  const money = c => '$' + (c / 100).toFixed(2);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function subtotal() { return state.items.reduce((a, i) => a + CATALOG[i.h].price * i.qty, 0); }
  function count() { return state.items.reduce((a, i) => a + i.qty, 0); }
  function add(h, qty) {
    const ex = state.items.filter(i => i.h === h)[0];
    if (ex) ex.qty = Math.min(12, ex.qty + qty); else state.items.push({ h: h, qty: qty });
    save(); renderAll(); openDrawer();
  }
  function setQty(h, q) { const it = state.items.filter(i => i.h === h)[0]; if (!it) return; it.qty = Math.max(0, Math.min(12, q)); if (!it.qty) state.items = state.items.filter(i => i.h !== h); save(); renderAll(); }

  function openDrawer() { const d = $('#drawer'); if (!d) return; d.classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { const d = $('#drawer'); if (!d) return; d.classList.remove('on'); $('#scrim').classList.remove('on'); document.body.style.overflow = ''; }

  function renderHeader() { $$('[data-cart-count]').forEach(el => { el.textContent = count(); el.hidden = !count(); }); }

  function renderDrawer() {
    const box = $('#drawer-items'); if (!box) return;
    box.innerHTML = state.items.length ? state.items.map(i => {
      const p = CATALOG[i.h];
      return '<div class="cline"><div class="im"><img src="' + p.image + '" alt=""></div><div>' +
        '<div class="nm">' + esc(p.name) + '</div><div class="pr">' + money(p.price) + '</div>' +
        '<div class="qrow"><div class="qty"><button data-q="' + (i.qty - 1) + '" data-h="' + i.h + '" aria-label="Decrease quantity">−</button><span>' + i.qty + '</span><button data-q="' + (i.qty + 1) + '" data-h="' + i.h + '" aria-label="Increase quantity">+</button></div>' +
        '<button class="rm" data-q="0" data-h="' + i.h + '" aria-label="Remove">\u{1F5D1}︎</button></div></div>' +
        '<div class="tot">' + money(p.price * i.qty) + '</div></div>';
    }).join('') : '<div class="empty">Your cart is empty</div>';
    const f = $('#drawer-foot');
    if (f) f.innerHTML = '<div class="est"><span>Estimated total</span><span>' + money(subtotal()) + ' USD</span></div>' +
      '<div class="small">Taxes and shipping calculated at checkout. Orders ship from a licensed retailer in your state.</div>' +
      '<a class="btn block" href="checkout.html"' + (state.items.length ? '' : ' style="opacity:.4;pointer-events:none"') + '>Check out</a>';
    $$('[data-q]', box).forEach(b => b.addEventListener('click', () => setQty(b.getAttribute('data-h'), +b.getAttribute('data-q'))));
  }

  // ---------------------------------------------------------------- product page
  const pd = { img: 0, qty: 1 };
  function renderProduct() {
    const host = $('#pdp'); if (!host) return;
    const h = host.getAttribute('data-handle'); const p = CATALOG[h] || CATALOG[VSOP];
    document.title = p.name + ' | Shop Le Portier Shay';
    host.innerHTML = [
      '<div class="gallery"><div class="main"><img src="', p.gallery[pd.img], '" alt="', esc(p.short), '"></div>',
        p.gallery.length > 1 ? '<div class="thumbs">' + p.gallery.map((g, i) => '<button data-img="' + i + '" aria-selected="' + (i === pd.img) + '"><img src="' + g + '" alt=""></button>').join('') + '</div>' : '',
      '</div>',
      '<div class="info">',
        '<h1>', esc(p.name), '</h1>',
        '<div class="price">', money(p.price), ' USD</div>',
        '<div class="small"><a href="#">Shipping</a> calculated at checkout.</div>',
        '<div class="qty-wrap">Quantity<div class="qty"><button id="qm" aria-label="Decrease quantity">−</button><span>', pd.qty, '</span><button id="qp" aria-label="Increase quantity">+</button></div></div>',
        p.connected
          ? '<button class="btn atc" id="atc">Add to cart</button>' +
            '<div class="fulfil-line"><img src="assets/logo.png" alt=""><span>Ships from a licensed retailer in your state. Delivery in about 30 minutes in the Phoenix and Tucson areas. Rates show at checkout once you enter your address.</span></div>'
          : '<button class="btn atc" disabled>Coming soon</button><div class="notice">Not yet stocked by a retailer in the network. It goes live here once it is connected to licensed retailers during onboarding. <a href="product.html" style="color:var(--gold-hi)">Shay VSOP 750ML</a> is connected today.</div>',
        p.donate ? '<div class="small">$' + p.donate + ' from this bottle will be donated to America’s Gold Star Families.</div>' : '',
        '<div class="desc"><p><b>', esc(p.lead), '</b><br>', esc(p.specs), '</p>', p.desc.map(d => '<p>' + esc(d) + '</p>').join(''), '</div>',
        '<div class="rb-note"><span class="rb-mark">ReserveBar</span><span><b>Also on ReserveBar.com.</b> Shay VSOP is listed on <a href="https://www.reservebar.com/products/le-portier-shay-vsop-cognac/GROUPING-1771428" target="_blank" rel="noopener">ReserveBar.com</a> for gifting.</span></div>',
      '</div>'].join('');
    $$('[data-img]', host).forEach(b => b.addEventListener('click', () => { pd.img = +b.getAttribute('data-img'); renderProduct(); }));
    $('#qm', host).addEventListener('click', () => { if (pd.qty > 1) { pd.qty--; renderProduct(); } });
    $('#qp', host).addEventListener('click', () => { if (pd.qty < 12) { pd.qty++; renderProduct(); } });
    const atc = $('#atc', host); if (atc) atc.addEventListener('click', () => add(h in CATALOG ? h : VSOP, pd.qty));
  }

  // ---------------------------------------------------------------- checkout
  const co = { rate: null };
  function renderCheckout() {
    const side = $('#os'); if (!side) return;
    const zipEl = $('#zip'), stEl = $('#state');
    const zip = (zipEl.value || '').trim();
    const r = ratesFor(zip);
    if (r && stEl.value !== r.st) stEl.value = r.st;
    const box = $('#rates');
    let rate = null;
    if (!state.items.length) box.innerHTML = '<div class="co-empty">Your cart is empty. <a href="product.html">Shop Shay VSOP</a></div>';
    else if (!r) box.innerHTML = '<div class="co-empty">Enter your shipping address to view available shipping methods.</div>';
    else if (!r.rates.length) box.innerHTML = '<div class="co-empty">No licensed retailer in ' + esc(STATE_NAMES[r.st] || r.st) + ' stocks Shay VSOP yet. Today it ships from licensed retailers in Texas, New York, New Jersey, Illinois and Washington, DC, and delivers in about 30 minutes through Gopuff around Phoenix and Tucson.</div>';
    else {
      if (!r.rates.filter(x => x.id === co.rate)[0]) co.rate = r.rates[0].id;
      rate = r.rates.filter(x => x.id === co.rate)[0];
      box.innerHTML = '<div class="rates">' + r.rates.map(x => '<label class="rate' + (x.id === co.rate ? ' on' : '') + '"><input type="radio" name="rate" value="' + x.id + '"' + (x.id === co.rate ? ' checked' : '') + '>' +
        (x.icon ? '<img class="ic" src="' + x.icon + '" alt="">' : '') + '<span class="t">' + esc(x.title) + '<span>' + esc(x.sub) + '</span></span><span class="p">' + money(x.price) + '</span></label>').join('') + '</div>' +
        '<div class="callout"><span class="dot"></span><span><b>Retailer routing by AccelPay.</b> Your address decides which licensed retailer sells and ships the order. The order still lands in Le Portier’s Shopify admin with the full customer record.</span></div>';
      $$('input[name=rate]', box).forEach(i => i.addEventListener('change', () => { co.rate = i.value; renderCheckout(); }));
    }
    const sub = subtotal(), ship = rate ? rate.price : null, tax = rate ? Math.round(sub * TAX_RATE) : null;
    side.innerHTML = state.items.map(i => { const p = CATALOG[i.h];
        return '<div class="os-item"><div class="im"><img src="' + p.image + '" alt=""><span class="q">' + i.qty + '</span></div><div class="nm">' + esc(p.name) + '<span>' + p.size + '</span></div><div class="pr">' + money(p.price * i.qty) + '</div></div>'; }).join('') +
      '<div class="os-disc"><input placeholder="Discount code or gift card" aria-label="Discount code"><button type="button">Apply</button></div>' +
      '<div class="os-line"><span class="m">Subtotal · ' + count() + ' item' + (count() === 1 ? '' : 's') + '</span><span>' + money(sub) + '</span></div>' +
      '<div class="os-line"><span class="m">' + (rate && rate.kind === 'delivery' ? 'Delivery' : 'Shipping') + '</span><span>' + (ship === null ? '<span class="m">Enter shipping address</span>' : money(ship)) + '</span></div>' +
      '<div class="os-line"><span class="m">Estimated taxes</span><span>' + (tax === null ? '<span class="m">-</span>' : money(tax)) + '</span></div>' +
      '<div class="os-line total"><span>Total</span><span><small>USD</small>' + money(sub + (ship || 0) + (tax || 0)) + '</span></div>' +
      '<div class="callout"><span class="dot"></span><span><b>Taxes by AccelPay.</b> Sales tax calculated for the ship-to address.</span></div>' +
      (rate ? '<div class="callout"><span class="dot"></span><span>' + (rate.kind === 'delivery' ? 'Delivered by ' : 'Sold and shipped by ') + '<b>' + esc(rate.by) + '</b>, a licensed retailer. Adult signature (21+) required.</span></div>' : '');
    const pay = $('#pay');
    if (pay) { pay.disabled = !rate; pay.textContent = 'Pay now'; }
    co.current = rate; co.total = sub + (ship || 0) + (tax || 0);
  }
  function wireCheckout() {
    const form = $('#co-form'); if (!form) return;
    ['#zip', '#state'].forEach(s => $(s).addEventListener('input', () => { co.rate = null; renderCheckout(); }));
    $('#zip').addEventListener('change', renderCheckout);
    $$('[data-fill]').forEach(b => b.addEventListener('click', () => {
      const v = b.getAttribute('data-fill').split('|');
      form.address1.value = v[0]; form.city.value = v[1]; $('#zip').value = v[2]; co.rate = null; renderCheckout();
    }));
    form.addEventListener('submit', e => {
      e.preventDefault(); if (!co.current) return;
      const n = 'LP-DEMO-' + (1000 + Math.floor(Math.random() * 9000));
      try { sessionStorage.setItem('lp-order', JSON.stringify({ n: n, total: co.total, by: co.current.by, kind: co.current.kind })); } catch (err) {}
      state.items = []; save();
      location.href = 'checkout.html?confirmed=1';
    });
  }

  function renderAll() { renderHeader(); renderDrawer(); renderProduct(); renderCheckout(); }
  function boot() {
    $$('[data-cart-toggle]').forEach(b => b.addEventListener('click', openDrawer));
    const x = $('#drawer-close'); if (x) x.addEventListener('click', closeDrawer);
    const s = $('#scrim'); if (s) s.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    const burger = $('#burger'); if (burger) burger.addEventListener('click', () => $('nav.main').classList.toggle('open'));
    wireCheckout(); renderAll();
  }
  window.LPDemo = { catalog: CATALOG, order: ORDER, money: money, add: add };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
