/**
 * EMOTI — Drop 01 · No Limitations
 * Central configuration. Every date, link and placeholder the page needs
 * lives here so nothing important is buried inside a component.
 *
 * Dates are ISO strings with an explicit +02:00 (Rome, CEST) offset so the
 * countdown computes the correct absolute instant no matter the visitor's
 * own timezone.
 */
window.EMOTI_CONFIG = {
  // ---- Drop dates -----------------------------------------------------
  EARLY_ACCESS_DATE: '2026-10-10T20:00:00+02:00', // list gets the private link
  PUBLIC_DROP_DATE: '2026-10-11T20:00:00+02:00',  // shop opens to everyone
  REVEAL_START_DATE: '2026-10-05T00:00:00+02:00', // first piece revealed
  PAGE_LIVE_DATE: '2026-09-29T00:00:00+02:00',

  // ---- Contact / social -------------------------------------------------
  // TODO(real-assets): replace with the real WhatsApp Business number,
  // in international format, no spaces, e.g. "+39XXXXXXXXXX".
  WHATSAPP_NUMBER: 'WHATSAPP_NUMBER',
  INSTAGRAM_HANDLE: '@Emotitii',
  INSTAGRAM_URL: 'https://instagram.com/emotitii',
  FACEBOOK_URL: 'https://facebook.com/emoti', // TODO(real-assets): confirm real page URL

  // ---- Legal --------------------------------------------------------
  // TODO(real-assets): point these at the real policy pages.
  PRIVACY_URL: '#',
  COOKIES_URL: '#',
  RETURNS_URL: '#',

  // ---- Meta Pixel -----------------------------------------------------
  // TODO(real-assets): paste the real Pixel ID here once it exists. Until
  // then the page never loads fbq or fires any event — see js/consent.js.
  META_PIXEL_ID: null,

  // ---- Products ---------------------------------------------------------
  // `image` is left null on purpose: js/collection.js draws an elegant
  // placeholder silhouette until a real product photo is supplied.
  PRODUCTS: [
    {
      id: 'tshirt',
      revealDate: '2026-10-05T00:00:00+02:00',
      price: 49.99,
      image: null, // TODO(real-assets): product photo, transparent or on-model
      nameKey: 'product_tshirt',
    },
    {
      id: 'tank',
      revealDate: '2026-10-06T00:00:00+02:00',
      price: 29.99,
      image: null,
      nameKey: 'product_tank',
    },
    {
      id: 'trousers',
      revealDate: '2026-10-07T00:00:00+02:00',
      price: 80,
      image: null,
      nameKey: 'product_trousers',
    },
    {
      id: 'socks',
      revealDate: '2026-10-08T00:00:00+02:00',
      price: 9.99,
      image: null,
      nameKey: 'product_socks',
    },
  ],

  // ---- Hero campaign asset ----------------------------------------------
  // TODO(real-assets): the brief is explicit — this must be the *same*
  // image or video used in the Instagram ad, so a visitor who clicks the
  // ad feels they landed in the right place. Fill in heroVideo (mp4, no
  // audio, muted+looped) and/or heroImage (jpg/webp) + posterImage
  // (shown while the video loads / as the <video poster>).
  HERO: {
    heroVideo: null,
    heroImage: null,
    posterImage: null,
    alt: 'EMOTI — No Limitations campaign, Drop 01',
  },

  CURRENCY: '€',
};
