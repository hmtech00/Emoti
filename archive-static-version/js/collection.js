/**
 * EMOTI — collection reveal.
 * Renders the 4 product cards from EMOTI_CONFIG.PRODUCTS. Each card is
 * blurred/silhouetted until its revealDate passes, then shows the (real,
 * once supplied) photo and price. Silhouettes are simple inline SVG line
 * art per garment — no network request, no stock photography standing in
 * for the real product.
 */
(function () {
  'use strict';

  function silhouette(id) {
    var paths = {
      tshirt:
        '<path d="M35 20 L70 20 L85 35 L75 45 L65 40 L65 105 L40 105 L40 40 L30 45 L20 35 Z" />',
      tank:
        '<path d="M40 22 C40 15 45 12 52.5 12 C60 12 65 15 65 22 L65 32 L58 32 L58 24 C58 21 56 20 52.5 20 C49 20 47 21 47 24 L47 32 L40 32 Z M38 32 L67 32 L67 105 L38 105 Z" />',
      trousers:
        '<path d="M32 15 L73 15 L76 105 L60 105 L52.5 45 L45 105 L29 105 Z" />',
      socks:
        '<path d="M42 10 L63 10 L63 60 L78 78 C82 83 80 92 72 93 L46 95 C40 95.5 35 91 35 84 L35 10 Z" />',
    };
    return (
      '<svg viewBox="0 0 105 115" aria-hidden="true" class="silhouette-svg">' +
      '<rect width="105" height="115" fill="none"/>' +
      '<g fill="currentColor" opacity="0.16">' + (paths[id] || '') + '</g>' +
      '</svg>'
    );
  }

  function formatPrice(n) {
    var cfg = window.EMOTI_CONFIG;
    var hasDecimals = n % 1 !== 0;
    return cfg.CURRENCY + (hasDecimals ? n.toFixed(2) : n);
  }

  function formatRevealDate(date, lang) {
    return date.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    });
  }

  function renderCard(product, t, lang) {
    var revealDate = new Date(product.revealDate);
    var revealed = Date.now() >= revealDate.getTime();
    var name = t[product.nameKey];
    var dateLabel = formatRevealDate(revealDate, lang);

    var card = document.createElement('article');
    card.className = 'product-card' + (revealed ? ' is-revealed' : ' is-hidden');

    var mediaHtml = product.image
      ? '<img src="' + product.image + '" alt="' + name + '" loading="lazy" width="400" height="440">'
      : silhouette(product.id) +
        (!revealed
          ? '<span class="product-card__placeholder-label">' + t.product_placeholder_label + '</span>'
          : '');

    card.innerHTML =
      '<div class="product-card__media' + (revealed ? '' : ' product-card__media--blurred') + '">' +
      mediaHtml +
      '</div>' +
      '<div class="product-card__meta">' +
      '<p class="product-card__name">' + name + '</p>' +
      (revealed
        ? '<p class="product-card__price">' + formatPrice(product.price) + '</p>'
        : '<p class="product-card__reveal"><span class="eyebrow">' + t.reveals_prefix + '</span> ' + dateLabel + '</p>') +
      '</div>';

    return card;
  }

  function render() {
    var root = document.querySelector('[data-component="collection-grid"]');
    if (!root) return;
    var lang = window.EMOTI_LANG || 'en';
    var t = window.EMOTI_I18N[lang];
    root.innerHTML = '';
    window.EMOTI_CONFIG.PRODUCTS.forEach(function (p) {
      root.appendChild(renderCard(p, t, lang));
    });
  }

  document.addEventListener('DOMContentLoaded', render);
  window.EMOTI_renderCollection = render; // re-render on language switch

  // Re-check reveal state once a minute — cheap, and means a card flips
  // from blurred to revealed live if someone leaves the tab open.
  window.setInterval(render, 60000);
})();
