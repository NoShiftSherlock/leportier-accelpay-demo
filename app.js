/* Le Portier x AccelPay demo: static commerce layer.
 *
 * WHY THIS EXISTS
 * Le Portier has no LiquidCommerce partner account, so the Elements SDK cannot
 * run against its catalog. This file reproduces the Elements behaviour closely
 * enough to demo (address gate, retailer selection, cart drawer, checkout) and
 * is meant to be deleted, not migrated, once a partner account exists.
 *
 * DESIGN RULE (copied from the kendall-jackson-lc-demo build)
 * Every state change publishes the SAME `lce:actions.*` CustomEvent the real SDK
 * publishes, with the same { data, metadata } envelope. Anything wired to these
 * events keeps working after the switchover. See elements-config.js.
 *
 * WHAT IS REAL AND WHAT IS NOT
 *   Real:  retailers, cities, states, per-retailer prices and stock for Le Portier
 *          Shay VSOP 750ml (UPC 00736040005209), from the ReserveBar/AccelPay
 *          retailer catalog, pulled 2026-10-24. The 7 Gopuff locations and their
 *          delivery ZIPs, from a live Gopuff check on 2026-10-24. Product names,
 *          images, copy and current site prices from leportiercognac.com.
 *   Not:   shipping and delivery fees, tax rate, the Gopuff shelf price (Gopuff
 *          does not expose it signed out; the brand-site price stands in), and
 *          the payment step. No order is ever placed.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- catalog
  const VSOP = '00736040005209';
  const CATALOG = {
    '00736040005209': {
      upc: VSOP, handle: 'le-portier-shay-vsop', name: 'Le Portier Shay VSOP', size: '750 ML',
      tag: 'VSOP Cognac', sitePrice: 9899, connected: true, donate: 5,
      image: 'assets/vsop.png', gallery: ['assets/vsop.png', 'assets/banner.jpg', 'assets/box-bottle.jpg'],
      lead: 'Timeless VSOP Cognac, blending tradition with modern allure.',
      specs: 'ABV: 40% / Volume: 750ML',
      desc: 'Le Portier Shay is a timeless VSOP Cognac which embodies intricate craftsmanship and centuries-old tradition. Crafted with traditional methods in a Charentais copper pot still and aged in French Oak barrels, Shay artfully blends Grande Champagne, Petite Champagne, and Fins Bois grapes.'
    },
    'shay-vsop-375ml': {
      upc: null, handle: 'shay-vsop-375ml', name: 'Shay VSOP, 375ML', size: '375 ML',
      tag: 'VSOP Cognac', sitePrice: 5999, connected: false, donate: 3,
      image: 'assets/vsop-375.png', gallery: ['assets/vsop-375.png'],
      lead: 'Smooth. Layered. Refined.',
      specs: 'ABV: 40% / Volume: 375ML',
      desc: 'An elevated French cognac designed for gifting, celebrating, and savoring the moments that matter most. Caramelized spiced apples, chocolate tones, velvety butterscotch, and a hint of warm smokiness.'
    },
    'collectors-edition': {
      upc: null, handle: 'collectors-edition', name: "Collector's Edition", size: '750 ML',
      tag: 'Limited to 25,000 bottles', sitePrice: 12999, connected: false,
      image: 'assets/collectors.png', gallery: ['assets/collectors.png', 'assets/box.png'],
      lead: 'An exclusive release of just 25,000 bottles.',
      specs: 'Shay VSOP / Presentation box',
      desc: 'Produced in collaboration with Hall of Fame great, acclaimed broadcaster and podcast host, Shannon Sharpe, Shay by Le Portier is an exclusive release of just 25,000 bottles. A cognac to share with friends and family, toasting to life’s milestones.'
    },
    'the-hall-of-fame-edition': {
      upc: null, handle: 'the-hall-of-fame-edition', name: 'Hall of Fame Edition', size: '750 ML',
      tag: 'Limited edition', sitePrice: 14999, connected: false,
      image: 'assets/cutout.png', gallery: ['assets/cutout.png', 'assets/hof.jpg'],
      lead: 'Honoring the first brothers inducted into the Hall of Fame.',
      specs: 'Shay VSOP / Custom wooden box',
      desc: 'Crafted to honor the induction of Sterling Sharpe into the Hall of Fame, this limited release pays tribute to the bond between Shannon and Sterling Sharpe. Encased in a custom-designed wooden box with a hand-drawn portrait of the Sharpe brothers.'
    }
  };
  const ORDER = [VSOP, 'shay-vsop-375ml', 'collectors-edition', 'the-hall-of-fame-edition'];

  // ---------------------------------------------------------------- retailers
  // REAL DATA: active Le Portier Shay VSOP listings in the ReserveBar/AccelPay
  // retailer catalog (liquidcommerce_mongo_retailer.variants), 2026-10-24.
  // Price is the retailer's own price; stock is the retailer's reported count.
  // A few in-stock listings per state are kept so the selector stays readable.
  const RETAILERS = {
    'r-specs-0':    { name: "Spec's Wines, Spirits & Finer Foods", city: 'Houston',       st: 'TX', price: 10525, stock: 15 },
    'r-specs-116':  { name: "Spec's Wines, Spirits & Finer Foods", city: 'Westlake',      st: 'TX', price: 10052, stock: 8 },
    'r-specs-151':  { name: "Spec's Wines, Spirits & Finer Foods", city: 'Plano',         st: 'TX', price: 10052, stock: 6 },
    'r-specs-61':   { name: "Spec's Wines, Spirits & Finer Foods", city: 'Austin',        st: 'TX', price: 10525, stock: 3 },
    'r-mashbill':   { name: 'Mashbill Wine & Spirits',             city: 'New York',      st: 'NY', price: 10399, stock: 141 },
    'r-bottlebuys': { name: 'BottleBuys',                          city: 'Glen Head',     st: 'NY', price: 9999,  stock: 3 },
    'r-bottlescases': { name: 'Bottles and Cases',                 city: 'Huntington',    st: 'NY', price: 11999, stock: 8 },
    'r-bottlerepublic': { name: 'Bottle Republic',                 city: 'Somerset',      st: 'NJ', price: 11499, stock: 5 },
    'r-hollywood':  { name: 'Hollywood Liquors',                   city: 'West New York', st: 'NJ', price: 11099, stock: 2 },
    'r-liquorbarn': { name: 'Liquor Barn',                         city: 'Wheeling',      st: 'IL', price: 11499, stock: 8, localZip3: ['600'] },
    'r-vista':      { name: 'Vista Wine & Spirits',                city: 'Santee',        st: 'CA', price: 10599, stock: 146 },
    'r-westdupont': { name: '1 West Dupont Wine & Liquors',        city: 'Washington',    st: 'DC', price: 10995, stock: 19 }
  };
  Object.keys(RETAILERS).forEach(k => { RETAILERS[k].id = k; });

  // REAL DATA: the 7 Gopuff locations listing "Le Portier Shay" in a live check of
  // all 173 spirits-licensed Gopuff locations on 2026-10-24, and the ZIP codes
  // those locations deliver to.
  const GOPUFF = {
    id: 'r-gopuff', name: 'Gopuff', st: 'AZ', city: 'Phoenix and Tucson areas',
    locations: ['Chandler', 'Glendale', 'Goodyear', 'Peoria', 'Phoenix', 'Scottsdale', 'Tucson'],
    price: 9899, priceIllustrative: true, stock: 12,
    zips: ['85016','85018','85020','85022','85023','85024','85027','85028','85029','85032','85037','85044','85045','85048','85050','85053','85054','85083','85085','85086','85226','85251','85253','85254','85255','85256','85258','85259','85260','85283','85284','85302','85304','85306','85307','85308','85309','85310','85323','85326','85329','85335','85338','85339','85340','85345','85351','85353','85355','85363','85373','85374','85375','85378','85379','85381','85382','85383','85387','85392','85395','85396','85619','85707','85708','85710','85711','85712','85713','85715','85716','85718','85730','85747','85748','85749','85750']
  };

  // ILLUSTRATIVE: fees and tax are placeholders for the demo, not quotes.
  const FEES = { shipping: 999, gopuff: 499, local: 999 };   // $9.99 mirrors the current site's flat shipping
  const TAX_RATE = 0.085;
  const MAX_QTY = 12;
  const STATE_NAMES = { TX: 'Texas', NY: 'New York', NJ: 'New Jersey', IL: 'Illinois', CA: 'California', DC: 'Washington, DC', AZ: 'Arizona' };

  // ZIP3 -> state. Enough to route the demo; the live checkout geocodes properly.
  const ZIP3 = [
    [5,5,'NY'],[6,9,'PR'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],
    [70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,200,'DC'],[201,201,'VA'],[202,205,'DC'],
    [206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],
    [350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],[430,459,'OH'],[460,479,'IN'],
    [480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[569,569,'DC'],[570,577,'SD'],[580,588,'ND'],
    [590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,715,'LA'],[716,729,'AR'],
    [730,749,'OK'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],
    [870,884,'NM'],[885,885,'TX'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],
    [995,999,'AK']
  ];
  function stateForZip(zip) {
    const n = parseInt(zip.slice(0, 3), 10);
    for (const [a, b, s] of ZIP3) if (n >= a && n <= b) return s;
    return null;
  }

  // ---------------------------------------------------------------- availability
  function inStateShipping(st) {
    return Object.keys(RETAILERS).map(k => RETAILERS[k])
      .filter(r => r.st === st && r.stock > 0)
      .map(r => Object.assign({}, r, { retailerId: r.id, type: 'shipping', fee: FEES.shipping,
        expectation: 'Ships in 2 to 5 business days', icon: null }))
      .sort((a, b) => a.price - b.price);
  }
  function onDemandFor(addr) {
    if (!addr) return [];
    const out = [];
    if (GOPUFF.zips.indexOf(addr.zip) >= 0) {
      out.push(Object.assign({}, GOPUFF, { retailerId: GOPUFF.id, type: 'onDemand', fee: FEES.gopuff,
        city: /^85[67]/.test(addr.zip) ? 'Tucson' : 'Phoenix area',
        expectation: 'Delivered in about 30 minutes', icon: 'assets/gopuff-icon.png' }));
    }
    Object.keys(RETAILERS).map(k => RETAILERS[k]).forEach(r => {
      if (r.localZip3 && r.localZip3.indexOf(addr.zip.slice(0, 3)) >= 0) {
        out.push(Object.assign({}, r, { retailerId: r.id, type: 'onDemand', fee: FEES.local,
          expectation: 'Same-day local delivery', icon: null }));
      }
    });
    return out;
  }
  function variantsFor(upc, type) {
    const p = CATALOG[upc];
    if (!p || !p.connected || !state.address) return [];
    return type === 'onDemand' ? onDemandFor(state.address) : inStateShipping(state.address.state);
  }
  function hasAvailability(upc) {
    return variantsFor(upc, 'shipping').length + variantsFor(upc, 'onDemand').length > 0;
  }
  function optionById(upc, type, rid) {
    return variantsFor(upc, type).filter(v => v.retailerId === rid)[0] || null;
  }
  function networkFromPrice() {
    return Math.min.apply(null, Object.keys(RETAILERS).map(k => RETAILERS[k].price));
  }

  // ---------------------------------------------------------------- state
  const LS = 'leportier-accelpay-demo-v1';
  const state = load() || { address: null, items: [], cartId: 'cart_' + Math.random().toString(36).slice(2, 10) };
  function load() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  // ---------------------------------------------------------------- events
  let evtSeq = 0;
  function publish(name, data, ns) {
    const detail = { data: data, metadata: {
      eventId: 'evt_' + (++evtSeq), namespace: 'actions', event: name, originalEvent: name,
      actionNamespace: ns || 'other', timestamp: Date.now(), sdkVersion: 'static-standin',
      env: 'demo', tenantName: 'Le Portier', tenantCode: 'leportier' } };
    window.dispatchEvent(new CustomEvent('lce:actions.' + name, { detail: detail }));
    window.dispatchEvent(new CustomEvent('lce:actions', { detail: detail }));
  }

  // ---------------------------------------------------------------- helpers
  const money = c => '$' + (c / 100).toFixed(2);
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function itemOption(i) { return optionById(i.upc, i.fulfillmentType, i.retailerId); }

  function groups() {
    const map = {};
    state.items.forEach(i => {
      const o = itemOption(i); if (!o) return;
      const k = i.fulfillmentType + ':' + i.retailerId;
      if (!map[k]) map[k] = { option: o, items: [], subtotal: 0 };
      map[k].items.push(i); map[k].subtotal += o.price * i.qty;
    });
    return Object.keys(map).map(k => map[k]);
  }
  function cartTotals() {
    let subtotal = 0, itemCount = 0, delivery = 0;
    groups().forEach(g => { subtotal += g.subtotal; delivery += g.option.fee; g.items.forEach(i => { itemCount += i.qty; }); });
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, delivery, tax, total: subtotal + delivery + tax, itemCount };
  }
  function cartSnapshot() { const t = cartTotals(); return { cartId: state.cartId, subtotal: t.subtotal, itemCount: t.itemCount }; }

  // ---------------------------------------------------------------- address
  function setAddress(raw) {
    const text = (raw || '').trim();
    const m = text.match(/\b(\d{5})(?:-\d{4})?\b/);
    if (!m) { announce('Add a ZIP code so we can find a licensed retailer near you'); return 'nozip'; }
    const zip = m[1], st = stateForZip(zip);
    if (!st) { announce('That ZIP code was not recognized'); return 'badzip'; }
    state.address = { formattedAddress: text, zip: zip, state: st,
      address: (function () {
        const parts = text.replace(m[0], '').split(',').map(x => x.trim()).filter(Boolean);
        const city = parts.length > 1 ? parts[1].replace(/\b[A-Z]{2}$/, '').trim() : '';
        return { one: parts[0] || '', two: '', city: city, state: st, zip: zip, country: 'US' };
      })() };
    // Drop cart lines that cannot be fulfilled at the new address.
    state.items = state.items.filter(i => itemOption(i));
    save();
    publish('address_updated', { googlePlacesId: 'demo_places_id', formattedAddress: text,
      address: state.address.address, coordinates: null }, 'address');
    pstate.retailerId = null;
    renderAll();
    return 'ok';
  }
  function clearAddress() {
    state.address = null; state.items = []; save();
    publish('address_cleared', true, 'address'); publish('cart_reset', true, 'cart');
    renderAll();
  }

  // ---------------------------------------------------------------- cart ops
  let pendingAdd = null;
  function addProduct(params, openCart) {
    if (!state.address) {
      pendingAdd = { params: params, openCart: openCart };
      const a = $('#lce-address-input');
      if (a) { a.focus(); a.closest('.lce-address').classList.add('needs'); }
      announce('Enter a delivery address to continue');
      return false;
    }
    if (!optionById(params.upc, params.fulfillmentType, params.retailerId)) return false;
    const key = [params.upc, params.fulfillmentType, params.retailerId].join('::');
    const ex = state.items.filter(i => i.key === key)[0];
    if (ex) ex.qty = Math.min(MAX_QTY, ex.qty + (params.quantity || 1));
    else state.items.push({ key: key, upc: params.upc, qty: params.quantity || 1,
      fulfillmentType: params.fulfillmentType, retailerId: params.retailerId, engravingLines: [] });
    save();
    publish('product_add_to_cart', { identifier: params.upc, fulfillmentId: params.retailerId, partNumber: params.upc, quantity: params.quantity || 1, engravingLines: [] }, 'product');
    publish('cart_item_added', { cartId: state.cartId, itemId: key, fulfillmentId: params.retailerId, partNumber: params.upc, quantity: params.quantity || 1, engravingLines: [] }, 'cart');
    publish('cart_updated', { current: cartSnapshot() }, 'cart');
    renderAll();
    if (openCart !== false) openDrawer();
    return true;
  }
  function setQty(key, delta) {
    const it = state.items.filter(i => i.key === key)[0]; if (!it) return;
    const prev = it.qty; it.qty = Math.min(MAX_QTY, it.qty + delta);
    if (it.qty < 1) { state.items = state.items.filter(i => i.key !== key); publish('cart_item_removed', { cartId: state.cartId, itemId: key }, 'cart'); }
    else publish(delta > 0 ? 'cart_item_quantity_increase' : 'cart_item_quantity_decrease', { cartId: state.cartId, itemId: key, quantity: it.qty, previousQuantity: prev }, 'cart');
    save(); renderAll();
  }
  function removeItem(key) {
    state.items = state.items.filter(i => i.key !== key); save();
    publish('cart_item_removed', { cartId: state.cartId, itemId: key }, 'cart'); renderAll();
  }
  function resetCart() { state.items = []; save(); publish('cart_reset', true, 'cart'); renderAll(); }

  // Move every cart line to the best option of a fulfillment type (used by checkout).
  function switchFulfillment(type) {
    let changed = false;
    state.items.forEach(i => {
      if (i.fulfillmentType === type) return;
      const opt = variantsFor(i.upc, type)[0]; if (!opt) return;
      const prevT = i.fulfillmentType, prevR = i.retailerId;
      i.fulfillmentType = type; i.retailerId = opt.retailerId; i.key = [i.upc, type, opt.retailerId].join('::');
      changed = true;
      publish('product_fulfillment_type_changed', { identifier: i.upc, selectedFulfillmentType: type, selectedFulfillmentId: opt.retailerId, previousFulfillmentType: prevT, previousFulfillmentId: prevR, fulfillmentHasAvailability: true }, 'product');
    });
    if (changed) { save(); publish('cart_updated', { current: cartSnapshot() }, 'cart'); renderAll(); }
  }

  // ---------------------------------------------------------------- a11y
  let liveRegion;
  function announce(msg) {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status'); liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = msg;
    const hint = $('#lce-addr-hint'); if (hint) hint.textContent = msg;
  }

  // ---------------------------------------------------------------- product element
  const pstate = { upc: null, fulfillmentType: 'shipping', retailerId: null, qty: 1, img: 0 };

  function renderProduct() {
    const host = $('#lce-product'); if (!host) return;
    const upc = host.getAttribute('data-upc');
    const p = CATALOG[upc]; if (!p) { host.innerHTML = '<div class="lce-body">Product not found.</div>'; return; }
    if (pstate.upc !== upc) { pstate.upc = upc; pstate.qty = 1; pstate.retailerId = null; pstate.img = 0; }

    const ship = variantsFor(upc, 'shipping'), od = variantsFor(upc, 'onDemand');
    if (pstate.fulfillmentType === 'shipping' && !ship.length && od.length) pstate.fulfillmentType = 'onDemand';
    if (pstate.fulfillmentType === 'onDemand' && !od.length && ship.length) pstate.fulfillmentType = 'shipping';
    const rs = pstate.fulfillmentType === 'onDemand' ? od : ship;
    if (!rs.filter(x => x.retailerId === pstate.retailerId)[0]) pstate.retailerId = (rs[0] || {}).retailerId || null;
    const r = rs.filter(x => x.retailerId === pstate.retailerId)[0] || null;
    const hasAddr = !!state.address;
    const unit = r ? r.price : null;
    const maxQty = Math.min(MAX_QTY, r ? r.stock : MAX_QTY);
    if (pstate.qty > maxQty) pstate.qty = Math.max(1, maxQty);
    const stName = hasAddr ? (STATE_NAMES[state.address.state] || state.address.state) : '';

    let priceHtml;
    if (!p.connected) priceHtml = money(p.sitePrice) + '<span class="unit">' + p.size + ' · current site price</span>';
    else if (r) priceHtml = money(unit) + '<span class="unit">' + p.size + ' · ' + (r.priceIllustrative ? 'illustrative price' : 'price from ' + esc(r.name)) + '</span>';
    else priceHtml = 'From ' + money(networkFromPrice()) + '<span class="unit">' + p.size + ' · at licensed retailers</span>';

    const gallery = p.gallery.map((g, i) => '<button aria-selected="' + (i === pstate.img) + '" data-img="' + i + '"><img src="' + g + '" alt=""></button>').join('');

    let notice = '';
    if (!p.connected) {
      notice = '<div class="lce-alert">Not yet stocked by a retailer in the AccelPay network. During onboarding we connect each SKU to licensed retailers, and it goes live here. <a href="product.html" style="color:var(--gold-hi)">See Shay VSOP 750ml</a>, which is connected today.</div>';
    } else if (hasAddr && !ship.length && !od.length) {
      notice = '<div class="lce-alert warn">No network retailer in ' + esc(stName) + ' stocks Shay VSOP yet. Today it ships from licensed retailers in Texas, New York, New Jersey, Illinois, California and Washington, DC, with about 30 minute Gopuff delivery around Phoenix and Tucson. Try one of the sample ZIPs above.</div>';
    }

    host.innerHTML = [
      '<div class="lce-note">AccelPay checkout (static stand-in for the LiquidCommerce Elements product element)</div>',
      '<div class="lce-product">',
        '<div class="lce-gallery"><div class="main"><img src="', p.gallery[pstate.img] || p.image, '" alt="', esc(p.name), '"></div>',
          p.gallery.length > 1 ? '<div class="lce-thumbs">' + gallery + '</div>' : '', '</div>',
        '<div class="lce-body">',
          '<div class="lce-brandline">Le Portier · ', esc(p.tag), '</div>',
          '<h1>', esc(p.name), '</h1>',
          '<div class="lce-price">', priceHtml, '</div>',
          '<p class="lce-desc"><strong style="color:#fff;font-weight:600">', esc(p.lead), '</strong></p>',
          '<div class="lce-specs">', esc(p.specs), '</div>',
          p.connected ? [
            addressBlock(hasAddr),
            '<div class="lce-field"><span class="lce-label">How would you like it?</span>',
              '<div class="lce-tabs" role="tablist">',
                '<button role="tab" data-ft="shipping" aria-selected="', pstate.fulfillmentType === 'shipping', '"', hasAddr && !ship.length ? ' disabled' : '', '>Ship it',
                  '<span class="sub">', hasAddr ? (ship.length ? 'From a licensed ' + esc(stName) + ' retailer' : 'Not available here yet') : 'From a licensed retailer in your state', '</span></button>',
                '<button role="tab" data-ft="onDemand" aria-selected="', pstate.fulfillmentType === 'onDemand', '"', hasAddr && !od.length ? ' disabled' : '', '>Deliver now',
                  '<span class="sub">', hasAddr ? (od.length ? od[0].expectation : 'Not available at this address') : 'Where a local option exists', '</span></button>',
              '</div></div>',
            rs.length ? '<div class="lce-field"><span class="lce-label">' + (pstate.fulfillmentType === 'onDemand' ? 'Delivering from' : 'Shipping from') + '</span><div class="lce-retailers" role="radiogroup">' +
              rs.map(rr => [
                '<button class="lce-retailer" role="radio" data-rid="', rr.retailerId, '" aria-checked="', rr.retailerId === pstate.retailerId, '">',
                  rr.icon ? '<img class="ico" src="' + rr.icon + '" alt="">' : '',
                  '<span style="flex:1;min-width:0"><span class="nm">', esc(rr.name), '<span class="lic">Licensed</span></span><br>',
                  '<span class="meta">', esc(rr.city), ', ', rr.st, ' · ', rr.expectation, rr.stock <= 5 ? ' · only ' + rr.stock + ' left' : '', '</span></span>',
                  '<span class="fee">', money(rr.price), '<small>', money(rr.fee), rr.type === 'onDemand' ? ' delivery' : ' shipping', '</small></span>',
                '</button>'].join('')).join('') + '</div></div>' : '',
            '<div class="lce-buy"><div class="qty"><button id="qminus" aria-label="Decrease quantity">−</button><span id="qval">', pstate.qty, '</span><button id="qplus" aria-label="Increase quantity">+</button></div>',
              '<button class="btn" id="addbtn"', hasAddr && !r ? ' disabled' : '', '>', r ? 'Add to cart · ' + money(unit * pstate.qty) : 'Add to cart', '</button></div>'
          ].join('') : '',
          notice,
          p.donate ? '<p class="donate">$' + p.donate + ' from this bottle will be donated to America’s Gold Star Families.</p>' : '',
          '<p class="lce-desc">', esc(p.desc), '</p>',
          '<div class="rb-note"><span class="rb-mark">ReserveBar</span><span><b>Also on ReserveBar.com.</b> Le Portier Shay VSOP is listed on <a href="https://www.reservebar.com/products/le-portier-shay-vsop-cognac/GROUPING-1771428" target="_blank" rel="noopener">ReserveBar.com</a>, the network’s gifting marketplace.</span></div>',
        '</div>',
      '</div>'
    ].join('');
    wireProduct();
  }

  function addressBlock(hasAddr) {
    if (hasAddr) {
      const st = STATE_NAMES[state.address.state] || state.address.state;
      return '<div class="lce-address set"><div class="cur"><span>Delivering to <strong>' + esc(state.address.formattedAddress) +
        '</strong> (' + esc(st) + ')</span><button class="chg" id="lce-addr-change">Change</button></div></div>';
    }
    return ['<div class="lce-address"><span class="lce-label">Where should it go?</span>',
      '<div class="row"><input id="lce-address-input" placeholder="Street address with ZIP, or just a ZIP" autocomplete="off">',
      '<button class="btn ghost" id="lce-addr-set" style="padding:.55rem 1.1rem">Check</button></div>',
      '<div class="try">Try: ',
        '<button data-try="350 E 13th St, New York, NY 10009">New York</button>',
        '<button data-try="1001 Westheimer Rd, Houston, TX 77006">Houston</button>',
        '<button data-try="7014 E Camelback Rd, Scottsdale, AZ 85251">Scottsdale</button>',
        '<button data-try="1350 Connecticut Ave NW, Washington, DC 20036">Washington, DC</button>',
        '<button data-try="300 N State St, Chicago, IL 60654">Chicago</button>',
      '</div><div id="lce-addr-hint" class="try" aria-hidden="true"></div></div>'].join('');
  }

  function wireProduct() {
    const host = $('#lce-product'); if (!host) return;
    $$('[data-img]', host).forEach(b => b.addEventListener('click', () => { pstate.img = +b.getAttribute('data-img'); renderProduct(); }));
    $$('.lce-tabs button', host).forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      const prev = pstate.fulfillmentType; pstate.fulfillmentType = b.getAttribute('data-ft');
      pstate.retailerId = ((variantsFor(pstate.upc, pstate.fulfillmentType))[0] || {}).retailerId || null;
      publish('product_fulfillment_type_changed', { identifier: pstate.upc, selectedFulfillmentType: pstate.fulfillmentType, selectedFulfillmentId: pstate.retailerId, previousFulfillmentType: prev, previousFulfillmentId: null, fulfillmentHasAvailability: true }, 'product');
      renderProduct();
    }));
    $$('.lce-retailer', host).forEach(b => b.addEventListener('click', () => {
      const prev = pstate.retailerId; pstate.retailerId = b.getAttribute('data-rid');
      publish('product_fulfillment_changed', { identifier: pstate.upc, selectedFulfillmentId: pstate.retailerId, selectedFulfillmentType: pstate.fulfillmentType, previousFulfillmentId: prev, previousFulfillmentType: pstate.fulfillmentType }, 'product');
      renderProduct();
    }));
    const setBtn = $('#lce-addr-set', host), inp = $('#lce-address-input', host);
    const go = v => {
      if (setAddress(v) === 'ok' && pendingAdd) { const pa = pendingAdd; pendingAdd = null;
        const opt = variantsFor(pa.params.upc, pstate.fulfillmentType)[0] || variantsFor(pa.params.upc, 'shipping')[0] || variantsFor(pa.params.upc, 'onDemand')[0];
        if (opt) addProduct({ upc: pa.params.upc, fulfillmentType: opt.type, retailerId: opt.retailerId, quantity: pa.params.quantity }, pa.openCart); }
    };
    if (setBtn && inp) {
      setBtn.addEventListener('click', () => go(inp.value));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(inp.value); } });
    }
    $$('[data-try]', host).forEach(b => b.addEventListener('click', () => go(b.getAttribute('data-try'))));
    const chg = $('#lce-addr-change', host); if (chg) chg.addEventListener('click', clearAddress);
    const qm = $('#qminus', host), qp = $('#qplus', host);
    if (qm) qm.addEventListener('click', () => { if (pstate.qty > 1) { pstate.qty--; publish('product_quantity_decrease', { identifier: pstate.upc, quantity: pstate.qty, previousQuantity: pstate.qty + 1 }, 'product'); renderProduct(); } });
    if (qp) qp.addEventListener('click', () => {
      const o = optionById(pstate.upc, pstate.fulfillmentType, pstate.retailerId);
      const cap = Math.min(MAX_QTY, o ? o.stock : MAX_QTY);
      if (pstate.qty >= cap) { announce(o && o.stock < MAX_QTY ? 'Only ' + o.stock + ' in stock at this retailer' : 'Maximum ' + MAX_QTY + ' per order'); return; }
      pstate.qty++; publish('product_quantity_increase', { identifier: pstate.upc, quantity: pstate.qty, previousQuantity: pstate.qty - 1 }, 'product'); renderProduct();
    });
    const add = $('#addbtn', host);
    if (add) add.addEventListener('click', () => addProduct({ upc: pstate.upc, fulfillmentType: pstate.fulfillmentType, retailerId: pstate.retailerId, quantity: pstate.qty }, true));
  }

  // ---------------------------------------------------------------- drawer
  function openDrawer() { const d = $('#drawer'); if (!d) return; d.classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; publish('cart_opened', true, 'cart'); }
  function closeDrawer() { const d = $('#drawer'); if (!d || !d.classList.contains('on')) return; d.classList.remove('on'); $('#scrim').classList.remove('on'); document.body.style.overflow = ''; publish('cart_closed', true, 'cart'); }

  function lineHtml(i, o, withControls) {
    const p = CATALOG[i.upc];
    return ['<div class="line"><div class="thumb"><img src="', p.image, '" alt=""></div><div class="info">',
      '<span class="nm">', esc(p.name), '</span>',
      '<span class="sz">', p.size, ' · ', i.fulfillmentType === 'onDemand' ? 'Delivery' : 'Shipping', withControls ? '' : ' · Qty ' + i.qty, '</span>',
      '<div class="lf">', withControls ? '<div class="qty"><button data-q="-1" data-k="' + i.key + '" aria-label="Decrease">−</button><span>' + i.qty + '</span><button data-q="1" data-k="' + i.key + '" aria-label="Increase">+</button></div>' : '<span></span>',
      '<span class="amt">', money(o.price * i.qty), '</span></div>',
      withControls ? '<button class="rm" data-rm="' + i.key + '">Remove</button>' : '',
      '</div></div>'].join('');
  }

  function renderDrawer() {
    const box = $('#drawer-items'); if (!box) return;
    const gs = groups();
    box.innerHTML = gs.length ? gs.map(g => [
      '<div class="retailer-group"><div class="rg-head"><strong>', g.option.type === 'onDemand' ? 'Delivered by ' : 'Ships from ', esc(g.option.name), '</strong>',
      '<span class="exp">', esc(g.option.city), ', ', g.option.st, '<br>', g.option.expectation, '</span></div>',
      g.items.map(i => lineHtml(i, g.option, true)).join(''), '</div>'].join('')).join('')
      : '<div class="empty">Your cart is empty.</div>';
    const t = cartTotals(), foot = $('#drawer-foot');
    if (foot) {
      foot.innerHTML = ['<div class="totals">',
        '<div class="r"><span>Subtotal</span><span class="v">', money(t.subtotal), '</span></div>',
        '<div class="r"><span>Shipping / delivery</span><span class="v">', money(t.delivery), '</span></div>',
        '<div class="r"><span>Estimated tax</span><span class="v">', money(t.tax), '</span></div>',
        '<div class="r big"><span>Total</span><span class="v">', money(t.total), '</span></div></div>',
        '<a class="btn block" id="co-btn" href="checkout.html"', state.items.length ? '' : ' style="opacity:.4;pointer-events:none" aria-disabled="true"', '>Checkout · ', money(t.total), '</a>',
        '<div class="rb-note"><span class="rb-mark">ReserveBar</span><span>Also on <a href="https://www.reservebar.com/products/le-portier-shay-vsop-cognac/GROUPING-1771428" target="_blank" rel="noopener">ReserveBar.com</a></span></div>',
        '<div class="powered">Checkout by AccelPay · orders fulfilled by licensed retailers</div>'].join('');
    }
    $$('[data-q]', box).forEach(b => b.addEventListener('click', () => setQty(b.getAttribute('data-k'), parseInt(b.getAttribute('data-q'), 10))));
    $$('[data-rm]', box).forEach(b => b.addEventListener('click', () => removeItem(b.getAttribute('data-rm'))));
  }

  function renderHeader() {
    const t = cartTotals();
    $$('[data-lce-cart-items-count]').forEach(el => { el.textContent = t.itemCount; el.hidden = t.itemCount === 0; });
  }

  // ---------------------------------------------------------------- checkout page
  function renderCheckout() {
    const side = $('#co-summary'); if (!side) return;
    const t = cartTotals(), gs = groups();
    side.innerHTML = ['<h3>Order summary</h3>',
      gs.length ? gs.map(g => g.items.map(i => lineHtml(i, g.option, false)).join('')).join('') : '<div class="empty" style="padding:1.5rem 0">Your cart is empty. <a href="product.html" style="color:var(--gold-hi)">Shop Shay VSOP</a></div>',
      '<div class="totals" style="margin-top:1rem">',
        '<div class="r"><span>Subtotal</span><span class="v">', money(t.subtotal), '</span></div>',
        '<div class="r"><span>Shipping / delivery</span><span class="v">', money(t.delivery), '</span></div>',
        '<div class="r"><span>Tax</span><span class="v">', money(t.tax), '</span></div>',
        '<div class="r big"><span>Total</span><span class="v">', money(t.total), '</span></div></div>',
      '<div class="rb-note" style="margin-top:1rem"><span class="rb-mark">ReserveBar</span><span>Also on <a href="https://www.reservebar.com/products/le-portier-shay-vsop-cognac/GROUPING-1771428" target="_blank" rel="noopener">ReserveBar.com</a></span></div>'
    ].join('');

    // Ship-to fields from the address the shopper entered on the product page.
    if (state.address) {
      const z = $('#co-zip'), s = $('#co-state'), a = $('#ship-addr');
      if (z && !z.value) z.value = state.address.zip;
      if (s && !s.value) s.value = state.address.state;
      if (a && !a.value) a.value = state.address.address.one;
      const c = $('[name=city]'); if (c && !c.value) c.value = state.address.address.city || '';
    }

    // Fulfillment block: which licensed retailer, and the delivery option where it applies.
    const box = $('#co-fulfil');
    if (box) {
      if (!state.items.length || !state.address) { box.innerHTML = '<p class="legal">Add Shay VSOP to your cart with a delivery address to see who fulfills it.</p>'; }
      else {
        const upc = state.items[0].upc;
        const ship = variantsFor(upc, 'shipping')[0], od = variantsFor(upc, 'onDemand')[0];
        const cur = state.items[0].fulfillmentType;
        const g = gs[0];
        const stName = STATE_NAMES[state.address.state] || state.address.state;
        box.innerHTML = [
          '<div class="from-box">', g.option.type === 'onDemand'
            ? 'Delivered by <b>' + esc(g.option.name) + '</b> (' + esc(g.option.city) + ', ' + g.option.st + '), a licensed retailer, ' + g.option.expectation.toLowerCase() + '.'
            : 'Ships from <b>' + esc(g.option.name) + '</b> in ' + esc(g.option.city) + ', a licensed retailer in ' + esc(stName) + '. Adult signature required on delivery.',
          '</div><div class="co-opts">',
          ship ? '<label class="co-opt' + (cur === 'shipping' ? ' on' : '') + '"><input type="radio" name="ful" value="shipping"' + (cur === 'shipping' ? ' checked' : '') + '><span class="ico ship">✉</span><span class="t"><b>Standard shipping</b><span>' + esc(ship.name) + ', ' + esc(ship.city) + ' · ' + ship.expectation + '</span></span><span class="p">' + money(ship.fee) + '</span></label>' : '',
          od ? '<label class="co-opt' + (cur === 'onDemand' ? ' on' : '') + '"><input type="radio" name="ful" value="onDemand"' + (cur === 'onDemand' ? ' checked' : '') + '>' + (od.icon ? '<img class="ico" src="' + od.icon + '" alt="">' : '<span class="ico ship">⚡</span>') + '<span class="t"><b>' + (od.retailerId === 'r-gopuff' ? 'Deliver now via Gopuff' : 'Same-day local delivery') + '</b><span>' + esc(od.name) + ' · ' + od.expectation + '</span></span><span class="p">' + money(od.fee) + '</span></label>' : '',
          '</div>'].join('');
        $$('input[name=ful]', box).forEach(r => r.addEventListener('change', () => switchFulfillment(r.value)));
      }
    }
    const place = $('#place-order');
    if (place) { place.textContent = 'Place order · ' + money(t.total); place.disabled = !state.items.length; }
  }

  function wireCheckout() {
    const form = $('#co-form'); if (!form) return;
    publish('checkout_loaded', { token: 'demo_token', cartId: state.cartId, isGift: false, billingSameAsShipping: true, itemCount: cartTotals().itemCount }, 'checkout');
    const gift = $('#is-gift');
    if (gift) gift.addEventListener('change', () => { $('#gift-fields').hidden = !gift.checked; publish('checkout_is_gift_toggled', { cartId: state.cartId, isActive: gift.checked, previousIsActive: !gift.checked }, 'checkout'); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const t = cartTotals();
      publish('checkout_submit_started', { started: true }, 'checkout');
      const orderNumber = 'LP-DEMO-' + String(Math.floor(100000 + Math.random() * 899999));
      const g = groups()[0];
      setTimeout(() => {
        publish('checkout_submit_completed', { orderNumber: orderNumber, orderTotal: t.total }, 'checkout');
        try { sessionStorage.setItem('lp-order', JSON.stringify({ orderNumber: orderNumber, total: t.total, by: g ? g.option.name + ', ' + g.option.city + ', ' + g.option.st : '', type: g ? g.option.type : '' })); } catch (err) {}
        resetCart();
        location.href = 'checkout.html?confirmed=1';
      }, 700);
    });
  }

  function quickAdd(upc) {
    if (!state.address) { location.href = 'product.html'; return false; }
    const pick = variantsFor(upc, 'onDemand')[0] || variantsFor(upc, 'shipping')[0];
    if (!pick) { location.href = 'product.html'; return false; }
    return addProduct({ upc: upc, fulfillmentType: pick.type, retailerId: pick.retailerId, quantity: 1 }, true);
  }

  // ---------------------------------------------------------------- boot
  function renderAll() { renderHeader(); renderProduct(); renderDrawer(); renderCheckout(); }
  function boot() {
    $$('[data-lce-cart-toggle-button]').forEach(b => b.addEventListener('click', () => { const d = $('#drawer'); if (d && d.classList.contains('on')) closeDrawer(); else openDrawer(); }));
    const x = $('#drawer-close'); if (x) x.addEventListener('click', closeDrawer);
    const s = $('#scrim'); if (s) s.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    const burger = $('#burger'); if (burger) burger.addEventListener('click', () => $('nav.main').classList.toggle('open'));
    $$('[data-add-upc]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); quickAdd(b.getAttribute('data-add-upc')); }));
    wireCheckout();
    renderAll();
    publish('client_ready', { isReady: true, message: 'Static stand-in ready', timestamp: Date.now(), version: 'standin-1.0' }, 'other');
  }

  window.LPDemo = {
    actions: {
      cart: { openCart: openDrawer, closeCart: closeDrawer, addProduct: addProduct, resetCart: resetCart, getDetails: cartSnapshot },
      address: { getDetails: () => state.address, clear: clearAddress },
      product: { getDetails: upc => CATALOG[upc] }
    },
    catalog: CATALOG, order: ORDER, retailers: RETAILERS, gopuff: GOPUFF,
    networkFromPrice: networkFromPrice, quickAdd: quickAdd, money: money
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
