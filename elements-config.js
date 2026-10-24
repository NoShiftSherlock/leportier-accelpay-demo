/* ============================================================================
 * THE SWITCH
 *
 * The only file to edit to turn on the real LiquidCommerce Elements SDK.
 * Everything else already speaks the SDK's lce:actions event vocabulary.
 *
 * WHY IT IS OFF
 * Le Portier has no LiquidCommerce partner account yet, so there is no Elements
 * data-token and no partner code. app.js is the static stand-in until then.
 * (Same pattern as kendall-jackson-lc-demo, see the liquidcommerce-elements-demo
 * skill.)
 *
 * TO TURN IT ON
 *   1. Create the partner account, then run the skill's lc-preflight.sh and only
 *      proceed when the Elements check returns 200.
 *   2. Set enabled = true, paste the pk_ data-token (Partner App > Quick Start),
 *      and set partnerCode (first path segment of the Partner App script src).
 *   3. Reload. The SDK renders into #lce-product (data-lce-product) and binds the
 *      cart button. Delete app.js once happy.
 * ========================================================================== */

window.ELEMENTS = {
  enabled: false,
  token: 'PASTE_ELEMENTS_DATA_TOKEN',
  partnerCode: '',
  env: 'production',
  mockMode: false,
  defaultUpc: '00736040005209',      // Le Portier Shay VSOP 750ml (real UPC in the retailer catalog)

  customTheme: {
    global: {
      theme: {
        primaryColor: '#a58a56', accentColor: '#a58a56', defaultTextColor: '#f3f3f3',
        selectedTextColor: '#ffffff', linkTextColor: '#c2a56c', errorColor: '#e07a7a',
        successColor: '#6fbf8e', drawerBackgroundColor: '#151515',
        inputBorderColor: '#6b6b6b', focusRingColor: '#a58a56',
        buttonCornerRadius: '0px', cardCornerRadius: '0px',
        headingFont: { name: 'Times New Roman', weights: [400] },
        paragraphFont: { name: 'Nunito Sans', weights: [300, 400, 600] }
      },
      layout: { enablePersonalization: false, allowPromoCodes: false, inputFieldStyle: 'outlined' }
    },
    product: {
      theme: { backgroundColor: '#0d0d0d' },
      layout: { showImages: true, showTitle: true, showDescription: true, showQuantityCounter: true,
        fulfillmentDisplay: 'carousel', enableShippingFulfillment: true, enableOnDemandFulfillment: true,
        primaryFulfillmentMethod: 'shipping', addToCartButtonText: 'Add to cart',
        addToCartButtonShowTotalPrice: true, noAvailabilityText: 'Not available at this address yet' }
    },
    cart: { theme: { backgroundColor: '#151515' }, layout: { drawerHeaderText: 'Your Cart', goToCheckoutButtonText: 'Checkout' } },
    checkout: {
      theme: { backgroundColor: '#0d0d0d' },
      layout: {
        emailOptIn: { show: true, checked: true, text: 'Email me about new releases from Le Portier.' },
        legalMessage: { show: true, text: 'By placing your order you confirm you are 21 or older. An adult signature is required on delivery.' },
        placeOrderButtonText: 'Place order', thankYouButtonText: 'Continue shopping'
      }
    }
  }
};

(function () {
  var E = window.ELEMENTS;
  if (!E.enabled) { console.info('[Le Portier demo] Elements SDK off, static stand-in active. See elements-config.js.'); return; }
  var base = 'https://elements.reservebar-worker.workers.dev';
  var path = (E.partnerCode ? '/' + E.partnerCode : '') + (/checkout\.html$/.test(location.pathname) ? '/checkout/checkout.js' : '/all/elements.js');
  function jsonTag(attr, obj) { var s = document.createElement('script'); s.setAttribute(attr, ''); s.type = 'application/json'; s.textContent = JSON.stringify(obj); document.head.appendChild(s); }
  jsonTag('data-liquid-commerce-elements-development', { mockMode: !!E.mockMode });
  jsonTag('data-liquid-commerce-elements-custom-theme', E.customTheme);
  var repoBase = location.origin + location.pathname.replace(/[^/]*$/, '');
  var s = document.createElement('script');
  s.defer = true; s.setAttribute('data-liquid-commerce-elements', ''); s.setAttribute('data-token', E.token);
  s.setAttribute('data-env', E.env); s.setAttribute('data-checkout-url', repoBase + 'checkout.html?lce_checkout={token}');
  s.setAttribute('data-checkout-param', 'lce_checkout'); s.src = base + path;
  document.head.appendChild(s);
})();
