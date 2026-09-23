/**
 * EMOTI — accessible FAQ accordion. Buttons with aria-expanded/
 * aria-controls; height animates via a CSS grid-rows trick (0fr -> 1fr),
 * no JS height measurement needed. Multiple items can be open at once.
 */
(function () {
  'use strict';

  function toggle(button) {
    var expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('is-open', !expanded);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-faq-trigger]').forEach(function (button) {
      button.addEventListener('click', function () { toggle(button); });
    });
  });
})();
