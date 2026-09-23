/**
 * EMOTI — thank-you page: referral card + WhatsApp/Instagram steps.
 *
 * This is a MOCK referral layer — see the comment at the top of
 * sections/emoti-referral.liquid for how to replace it with a real tool
 * (Viral Loops, KickoffLabs, ...).
 *
 * It reads the record emoti-form.js saved to localStorage right before
 * the REAL Shopify sign-up was submitted. If that record is fresh
 * (saved in the last 10 minutes), this is genuinely "you, right after
 * signing up" and the Meta Pixel Lead event fires here (gated by cookie
 * consent — see emoti-consent.js). Otherwise — e.g. this page opened
 * directly — a clearly labelled demo record is shown instead and no
 * Lead event fires.
 */
(function () {
  'use strict';

  var FRESH_WINDOW_MS = 10 * 60 * 1000;

  function getSignupRecord() {
    try {
      var raw = localStorage.getItem('emoti_waitlist_mock');
      if (raw) {
        var record = JSON.parse(raw);
        record.isFresh = !!record.savedAt && (Date.now() - record.savedAt) < FRESH_WINDOW_MS;
        return record;
      }
    } catch (e) { /* ignore */ }
    return { email: null, country: null, referralCode: 'demo-friend42', friendsCount: 0, isFresh: false, isDemo: true };
  }

  function referralUrl(code) {
    return window.location.origin + '/r/' + code;
  }

  function waMessageForShare(lang, url) {
    var line = lang === 'it'
      ? 'Sto entrando nella lista EMOTI per il Drop 01 — accesso anticipato sabato 10.10. Entra anche tu: '
      : "I'm on the EMOTI Drop 01 waitlist — early access Saturday 10.10. Join too: ";
    return line + url;
  }

  function renderFriendsCount(count) {
    var el = document.querySelector('[data-referral="count"]');
    var barEl = document.querySelector('[data-referral="bar"]');
    if (el) el.textContent = count + ' / 3';
    if (barEl) barEl.style.setProperty('--progress', Math.min(count / 3, 1));
  }

  function initCopy(linkValue) {
    var btn = document.querySelector('[data-referral="copy"]');
    var input = document.querySelector('[data-referral="link-input"]');
    if (input) input.value = linkValue;
    if (!btn) return;
    var strings = (window.EMOTI && window.EMOTI.strings) || {};
    var defaultLabel = btn.textContent;

    btn.addEventListener('click', function () {
      var done = function () {
        btn.textContent = strings.copied || defaultLabel;
        btn.classList.add('is-copied');
        window.setTimeout(function () {
          btn.textContent = defaultLabel;
          btn.classList.remove('is-copied');
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkValue).then(done).catch(function () {
          if (input) { input.select(); document.execCommand('copy'); }
          done();
        });
      } else if (input) {
        input.select();
        document.execCommand('copy');
        done();
      }
    });
  }

  function initWhatsappShare(linkValue) {
    var el = document.querySelector('[data-referral="whatsapp"]');
    if (!el) return;
    var lang = (window.EMOTI && window.EMOTI.locale) || 'en';
    el.href = 'https://wa.me/?text=' + encodeURIComponent(waMessageForShare(lang, linkValue));
  }

  function initNativeShare(linkValue) {
    var btn = document.querySelector('[data-referral="share"]');
    if (!btn) return;
    if (!navigator.share) { btn.hidden = true; return; }
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var lang = (window.EMOTI && window.EMOTI.locale) || 'en';
      navigator.share({
        title: 'EMOTI — No Limitations',
        text: waMessageForShare(lang, linkValue).replace(linkValue, '').trim(),
        url: linkValue,
      }).catch(function () { /* user cancelled */ });
    });
  }

  function initSaveWhatsappContact() {
    var btn = document.querySelector('[data-action="save-whatsapp"]');
    if (!btn) return;
    var number = window.EMOTI && window.EMOTI.whatsappNumber;
    if (!number) {
      btn.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }
    btn.removeAttribute('aria-disabled');
    btn.href = 'https://wa.me/' + number.replace(/[^\d+]/g, '');
    btn.target = '_blank';
    btn.rel = 'noopener';
  }

  function init() {
    var record = getSignupRecord();
    var url = referralUrl(record.referralCode);

    renderFriendsCount(record.friendsCount || 0);
    initCopy(url);
    initWhatsappShare(url);
    initNativeShare(url);
    initSaveWhatsappContact();

    if (record.isDemo || !record.isFresh) {
      var banner = document.querySelector('[data-referral="demo-notice"]');
      if (banner) banner.hidden = false;
    } else if (typeof window.EMOTI_trackLead === 'function') {
      window.EMOTI_trackLead({ email: record.email, country: record.country });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
