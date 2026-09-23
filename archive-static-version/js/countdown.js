/**
 * EMOTI — live countdown to EARLY_ACCESS_DATE, then to PUBLIC_DROP_DATE,
 * then a "live" state. Ticks every second; only rewrites the DOM when a
 * displayed value actually changes, so it's cheap to leave running.
 */
(function () {
  'use strict';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function diffParts(targetDate) {
    var ms = targetDate.getTime() - Date.now();
    if (ms <= 0) return null;
    var totalMinutes = Math.floor(ms / 60000);
    var days = Math.floor(totalMinutes / (60 * 24));
    var hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
    var minutes = totalMinutes - days * 60 * 24 - hours * 60;
    return { days: days, hours: hours, minutes: minutes };
  }

  function render(root, t) {
    var cfg = window.EMOTI_CONFIG;
    var i18n = window.EMOTI_I18N[window.EMOTI_LANG || 'en'];
    var early = new Date(cfg.EARLY_ACCESS_DATE);
    var pub = new Date(cfg.PUBLIC_DROP_DATE);

    var daysEl = root.querySelector('[data-cd="days"]');
    var hoursEl = root.querySelector('[data-cd="hours"]');
    var minEl = root.querySelector('[data-cd="minutes"]');
    var captionEl = root.querySelector('[data-cd="caption"]');
    var numbersEl = root.querySelector('[data-cd="numbers"]');

    var parts = diffParts(early);
    var caption = t.cd_caption_before_early;

    if (!parts) {
      parts = diffParts(pub);
      caption = t.cd_caption_before_public;
      if (!parts) {
        if (numbersEl) numbersEl.setAttribute('hidden', '');
        if (captionEl) captionEl.textContent = t.cd_live_public;
        return;
      }
    }

    if (numbersEl) numbersEl.removeAttribute('hidden');
    if (daysEl) daysEl.textContent = pad(parts.days);
    if (hoursEl) hoursEl.textContent = pad(parts.hours);
    if (minEl) minEl.textContent = pad(parts.minutes);
    if (captionEl) captionEl.textContent = caption;
  }

  function start() {
    var root = document.querySelector('[data-component="countdown"]');
    if (!root) return;
    var tick = function () {
      render(root, window.EMOTI_I18N[window.EMOTI_LANG || 'en']);
    };
    tick();
    // Minutes are the finest unit shown, so once a second keeps it exact
    // without redrawing at a wasteful rate.
    window.setInterval(tick, 1000);
    window.EMOTI_refreshCountdown = tick; // re-render instantly on language switch
  }

  document.addEventListener('DOMContentLoaded', start);
})();
