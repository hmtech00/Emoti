/**
 * EMOTI — small page-wide behaviors that don't belong in a more specific
 * file. Language switching is NOT handled here — snippets/emoti-language-
 * switcher.liquid submits Shopify's native `localization` form, which
 * reloads the page server-rendered in the chosen language.
 */
(function () {
  'use strict';

  function wireSmoothScrollCtas() {
    document.querySelectorAll('a[href="#signup"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.getElementById('signup');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var firstField = target.querySelector('#Email');
        if (firstField) window.setTimeout(function () { firstField.focus({ preventScroll: true }); }, 500);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', wireSmoothScrollCtas);
})();
