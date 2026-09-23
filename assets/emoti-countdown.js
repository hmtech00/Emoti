/**
 * EMOTI — live countdown to earlyAccessDate, then publicDropDate, then a
 * "live" state. Dates and pre-translated strings come from window.EMOTI,
 * set in layout/theme.liquid from Theme settings (dates) and the active
 * locale file (strings) — see locales/en.default.json / it.json.
 */
(function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  function diffParts(targetDate) {
    var ms = targetDate.getTime() - Date.now();
    if (ms <= 0) return null;
    var totalMinutes = Math.floor(ms / 60000);
    var days = Math.floor(totalMinutes / (60 * 24));
    var hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
    var minutes = totalMinutes - days * 60 * 24 - hours * 60;
    return { days: days, hours: hours, minutes: minutes };
  }

  function render(root) {
    var cfg = window.EMOTI || {};
    var strings = cfg.strings || {};
    var early = new Date(cfg.earlyAccessDate);
    var pub = new Date(cfg.publicDropDate);

    var daysEl = root.querySelector('[data-cd="days"]');
    var hoursEl = root.querySelector('[data-cd="hours"]');
    var minEl = root.querySelector('[data-cd="minutes"]');
    var captionEl = root.querySelector('[data-cd="caption"]');
    var numbersEl = root.querySelector('[data-cd="numbers"]');

    var parts = diffParts(early);
    var caption = strings.captionBeforeEarly;

    if (!parts) {
      parts = diffParts(pub);
      caption = strings.captionBeforePublic;
      if (!parts) {
        if (numbersEl) numbersEl.setAttribute('hidden', '');
        if (captionEl) captionEl.textContent = strings.livePublic || '';
        return;
      }
    }

    if (numbersEl) numbersEl.removeAttribute('hidden');
    if (daysEl) daysEl.textContent = pad(parts.days);
    if (hoursEl) hoursEl.textContent = pad(parts.hours);
    if (minEl) minEl.textContent = pad(parts.minutes);
    if (captionEl) captionEl.textContent = caption || '';
  }

  function start() {
    var root = document.querySelector('[data-component="countdown"]');
    if (!root || !window.EMOTI) return;
    var tick = function () { render(root); };
    tick();
    window.setInterval(tick, 1000);
  }

  document.addEventListener('DOMContentLoaded', start);
})();
