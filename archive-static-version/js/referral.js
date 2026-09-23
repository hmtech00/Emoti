/**
 * EMOTI — thank-you page: referral card + WhatsApp/Instagram steps.
 *
 * This is a MOCK referral layer, not a real integration. It reads the
 * record js/form.js saved to localStorage after sign-up and renders it.
 *
 * TODO(integration): replace with a real waitlist/referral tool (e.g.
 * Viral Loops or KickoffLabs). Those services normally hand you a widget
 * or an API that returns { referralCode, referralUrl, friendsCount } for
 * the signed-up visitor — swap `getMockSignup()` for that call and the
 * rest of this file (copy/share/WhatsApp buttons) keeps working as-is.
 */
(function () {
  'use strict';

  function getMockSignup() {
    try {
      var raw = localStorage.getItem('emoti_waitlist_mock');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    // No sign-up on file (e.g. page opened directly) — fall back to a
    // clearly-labelled demo record so the page still renders end to end.
    return { email: null, referralCode: 'demo-friend42', friendsCount: 0, isDemo: true };
  }

  function referralUrl(code) {
    return window.location.origin + window.location.pathname.replace(/thank-you\.html$/, '') + 'r/' + code;
  }

  function waMessageForShare(lang, url) {
    var line =
      lang === 'it'
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
    var lang = window.EMOTI_LANG || 'en';
    var t = window.EMOTI_I18N[lang];
    var defaultLabel = t.ty_copy;

    btn.addEventListener('click', function () {
      var done = function () {
        btn.textContent = window.EMOTI_I18N[window.EMOTI_LANG || 'en'].ty_copied;
        btn.classList.add('is-copied');
        window.setTimeout(function () {
          btn.textContent = window.EMOTI_I18N[window.EMOTI_LANG || 'en'].ty_copy;
          btn.classList.remove('is-copied');
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkValue).then(done).catch(function () {
          if (input) { input.select(); document.execCommand('copy'); done(); }
        });
      } else if (input) {
        input.select();
        document.execCommand('copy');
        done();
      }
    });
  }

  function initWhatsapp(linkValue) {
    var el = document.querySelector('[data-referral="whatsapp"]');
    if (!el) return;
    var lang = window.EMOTI_LANG || 'en';
    var msg = encodeURIComponent(waMessageForShare(lang, linkValue));
    el.href = 'https://wa.me/?text=' + msg;
  }

  function initShare(linkValue) {
    var btn = document.querySelector('[data-referral="share"]');
    if (!btn) return;
    if (!navigator.share) {
      btn.hidden = true; // Share API unsupported (most desktop browsers) — Copy/WhatsApp cover it
      return;
    }
    btn.addEventListener('click', function () {
      var lang = window.EMOTI_LANG || 'en';
      navigator.share({
        title: 'EMOTI — No Limitations',
        text: waMessageForShare(lang, linkValue).replace(linkValue, '').trim(),
        url: linkValue,
      }).catch(function () { /* user cancelled — no-op */ });
    });
  }

  function initSaveContact() {
    var cfg = window.EMOTI_CONFIG;
    var btn = document.querySelector('[data-action="save-whatsapp"]');
    if (!btn) return;
    if (cfg.WHATSAPP_NUMBER === 'WHATSAPP_NUMBER') {
      // No real number configured yet — keep the button visible but inert,
      // clearly marked so it isn't mistaken for a working link.
      btn.setAttribute('aria-disabled', 'true');
      btn.title = 'WHATSAPP_NUMBER not configured yet — see js/config.js';
      btn.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }
    btn.href = 'https://wa.me/' + cfg.WHATSAPP_NUMBER.replace(/[^\d+]/g, '');
  }

  function initInstagram() {
    var cfg = window.EMOTI_CONFIG;
    var btn = document.querySelector('[data-action="open-instagram"]');
    if (btn) btn.href = cfg.INSTAGRAM_URL;
  }

  function init() {
    var record = getMockSignup();
    var url = referralUrl(record.referralCode);
    renderFriendsCount(record.friendsCount || 0);
    initCopy(url);
    initWhatsapp(url);
    initShare(url);
    initSaveContact();
    initInstagram();

    if (record.isDemo) {
      var banner = document.querySelector('[data-referral="demo-notice"]');
      if (banner) banner.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
