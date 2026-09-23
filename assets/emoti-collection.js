/**
 * EMOTI — collection reveal watcher.
 *
 * The actual blurred/revealed state (and the real product photo/price)
 * is rendered server-side by snippets/emoti-product-card.liquid, based
 * on each block's reveal_date compared to the server clock — so the
 * correct state is always what a fresh page load shows, in every
 * timezone, with no flash of the wrong state.
 *
 * This file only handles the edge case of a visitor leaving the tab open
 * across a reveal moment: once a minute it checks whether any still-
 * hidden card's reveal date has passed, and if so reloads the page once
 * so the server can render the real reveal (photo, price, unblurred).
 */
(function () {
  'use strict';

  function checkForDueReveals() {
    var now = Date.now();
    var hidden = document.querySelectorAll('.product-card.is-hidden[data-reveal-date]');
    for (var i = 0; i < hidden.length; i++) {
      var revealAt = Date.parse(hidden[i].getAttribute('data-reveal-date'));
      if (revealAt && now >= revealAt) {
        window.location.reload();
        return;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('[data-component="product-card"]')) return;
    window.setInterval(checkForDueReveals, 60000);
  });
})();
