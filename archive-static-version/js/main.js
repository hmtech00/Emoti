/**
 * EMOTI — language switch + bootstrapping.
 *
 * True "detect the visitor's country" (as the brief describes, matching
 * Shopify Markets in production) needs either a storefront platform or a
 * geo-IP service — neither exists on a static page. As a reasonable
 * stand-in this uses the browser's own language setting, then remembers
 * whatever the visitor picks by hand. Swap `detectLang()` for Shopify
 * Markets' own locale once the page lives on that platform.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'emoti_lang';
  var SUPPORTED = ['en', 'it'];

  function detectLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) { /* ignore */ }
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : 'en';
  }

  function applyTranslations(lang) {
    var t = window.EMOTI_I18N[lang];
    if (!t) return;

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria-label');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    document.querySelectorAll('[data-lang-toggle]').forEach(function (el) {
      var isActive = el.getAttribute('data-lang-toggle') === lang;
      el.setAttribute('aria-pressed', String(isActive));
      el.classList.toggle('is-active', isActive);
    });

    if (typeof window.EMOTI_refreshCountdown === 'function') window.EMOTI_refreshCountdown();
    if (typeof window.EMOTI_renderCollection === 'function') window.EMOTI_renderCollection();
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    window.EMOTI_LANG = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    applyTranslations(lang);
  }

  function populateCountries() {
    var select = document.getElementById('country');
    if (!select || select.options.length > 1) return;
    window.EMOTI_COUNTRIES.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });
  }

  function wireLangToggle() {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang-toggle'));
      });
    });
  }

  function wireSmoothScrollCtas() {
    document.querySelectorAll('a[href="#signup"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.getElementById('signup');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var firstField = target.querySelector('#email');
        if (firstField) window.setTimeout(function () { firstField.focus({ preventScroll: true }); }, 500);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    window.EMOTI_LANG = detectLang();
    populateCountries();
    applyTranslations(window.EMOTI_LANG);
    wireLangToggle();
    wireSmoothScrollCtas();
  });
})();
