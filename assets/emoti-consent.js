/**
 * EMOTI — cookie consent + Meta Pixel gate.
 *
 * No tracking script loads and no pixel event fires before the visitor
 * has explicitly accepted marketing cookies. window.EMOTI.metaPixelId
 * comes from Theme settings → Tracking & consent (config/settings_schema.json)
 * and is blank until a real Pixel ID is entered there — this file never
 * inserts a placeholder ID.
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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  window.EMOTI_CONSENT = getStoredConsent() || { marketing: false, decided: false };

  function loadMetaPixel() {
    var id = window.EMOTI && window.EMOTI.metaPixelId;
    if (!id || window.fbq) return;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function applyConsent(marketing) {
    window.EMOTI_CONSENT = { marketing: marketing, decided: true };
    storeConsent(window.EMOTI_CONSENT);
    if (marketing) loadMetaPixel();
    hideBanner();
  }

  /**
   * Called after a successful sign-up (see emoti-form.js). Fires the Lead
   * event the campaign optimizes against — only if consent was given and
   * a real Pixel ID is configured.
   */
  window.EMOTI_trackLead = function (data) {
    var hasConsent = window.EMOTI_CONSENT && window.EMOTI_CONSENT.marketing;
    var id = window.EMOTI && window.EMOTI.metaPixelId;

    if (!hasConsent) {
      console.info('[EMOTI] Lead event not fired — no marketing consent yet.');
      return;
    }
    if (!id || typeof window.fbq !== 'function') {
      console.info('[EMOTI] Lead event would fire here once a Meta Pixel ID is set under Theme settings → Tracking & consent.', data);
      return;
    }
    window.fbq('track', 'Lead', { content_name: 'EMOTI Drop 01 waitlist', country: data && data.country });
  };

  function hideBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.setAttribute('hidden', '');
  }

  function initBanner() {
    var el = document.getElementById('cookie-banner');
    if (!el) return;

    if (window.EMOTI_CONSENT.decided) {
      if (window.EMOTI_CONSENT.marketing) loadMetaPixel();
      return;
    }

    el.removeAttribute('hidden');
    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { applyConsent(true); });
    if (rejectBtn) rejectBtn.addEventListener('click', function () { applyConsent(false); });
  }

  document.addEventListener('DOMContentLoaded', initBanner);
})();
