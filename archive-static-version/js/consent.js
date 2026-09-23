/**
 * EMOTI — cookie consent + Meta Pixel gate.
 *
 * Rules this file follows:
 *  1. No tracking script loads and no pixel event fires before the visitor
 *     has explicitly accepted marketing cookies.
 *  2. There is no real Pixel ID here (see js/config.js META_PIXEL_ID) —
 *     the loader below is inert until one is supplied. It never inserts a
 *     placeholder/fake ID.
 *  3. The banner's own preference is stored locally so it doesn't reappear
 *     on every visit once decided.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'emoti_consent_v1';

  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) {
      /* private browsing / storage blocked — consent still applies for this
         page view via window.EMOTI_CONSENT, it just won't persist. */
    }
  }

  window.EMOTI_CONSENT = getStoredConsent() || { marketing: false, decided: false };

  function applyConsent(marketing) {
    window.EMOTI_CONSENT = { marketing: marketing, decided: true };
    storeConsent(window.EMOTI_CONSENT);
    if (marketing) loadMetaPixel();
    hideBanner();
  }

  /**
   * Loads the Meta Pixel base code — ONLY after consent, and ONLY if a
   * real Pixel ID has been configured.
   *
   * TODO(real-assets): once you have a Pixel ID, set
   * window.EMOTI_CONFIG.META_PIXEL_ID in js/config.js. This function then
   * loads the standard Meta base script and calls fbq('init', ID) +
   * fbq('track', 'PageView') automatically. Nothing else needs to change.
   */
  function loadMetaPixel() {
    var id = window.EMOTI_CONFIG && window.EMOTI_CONFIG.META_PIXEL_ID;
    if (!id || window.fbq) return;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  /**
   * Called by js/form.js after a successful sign-up.
   * Fires the Lead event the sign-up campaign optimizes against — but only
   * if marketing consent was given and a real Pixel ID exists.
   */
  window.EMOTI_trackLead = function (data) {
    var hasConsent = window.EMOTI_CONSENT && window.EMOTI_CONSENT.marketing;
    var id = window.EMOTI_CONFIG && window.EMOTI_CONFIG.META_PIXEL_ID;

    if (!hasConsent) {
      console.info('[EMOTI] Lead event not fired — no marketing consent yet.');
      return;
    }
    if (!id || typeof window.fbq !== 'function') {
      console.info('[EMOTI] Lead event would fire here once META_PIXEL_ID is set in js/config.js.', data);
      return;
    }
    window.fbq('track', 'Lead', {
      content_name: 'EMOTI Drop 01 waitlist',
      country: data && data.country,
    });
  };

  // ---- Banner wiring ----------------------------------------------------
  function hideBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.setAttribute('hidden', '');
  }

  function initBanner() {
    var el = document.getElementById('cookie-banner');
    if (!el) return;

    if (window.EMOTI_CONSENT.decided) {
      if (window.EMOTI_CONSENT.marketing) loadMetaPixel();
      return; // already decided, keep banner hidden
    }

    el.removeAttribute('hidden');
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { applyConsent(true); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { applyConsent(false); });
  }

  document.addEventListener('DOMContentLoaded', initBanner);
})();
