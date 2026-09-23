/**
 * EMOTI — accessible FAQ accordion.
 * Buttons with aria-expanded/aria-controls; height animates via a CSS
 * grid-rows trick (0fr -> 1fr) so no JS height measurement is needed.
 * Multiple items can be open at once — that's a deliberate, low-friction
 * choice for a short list of 6 questions.
 */
(function () {
  'use strict';

  function toggle(button) {
    var expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.classList.toggle('is-open', !expanded);
  }

  function init() {
    document.querySelectorAll('[data-faq-trigger]').forEach(function (button) {
      button.addEventListener('click', function () { toggle(button); });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
