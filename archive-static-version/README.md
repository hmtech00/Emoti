# EMOTI — Drop 01 · No Limitations · Waitlist landing page

A static, dependency-free (HTML/CSS/vanilla JS) implementation of the
waitlist landing page described in `EMOTI Landing Page.pdf` /
`EMOTI_Landing_Page_Drop01_EN.pdf`. No framework was introduced because the
project had none — this is the lightest, fastest option for a mobile-first,
Instagram-ad-driven page, and it will run unmodified on almost any static
host or be dropped into a Shopify page template later.

## Run it locally

Any static file server works. From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`. (A `.claude/launch.json` is already set
up so Claude Code's preview browser can launch this with `emoti-static`.)

There is no build step — editing any `.html`/`.css`/`.js` file and
reloading is enough.

## Files

```
index.html          Main landing page (waitlist sign-up)
thank-you.html       Post-signup page (referral + WhatsApp + Instagram)
css/styles.css       All styles — design tokens at the top of the file
js/config.js         Central config: dates, links, product list, hero asset
js/i18n.js           EN + IT copy, country list
js/main.js           Language switch, bootstrapping, smooth-scroll CTAs
js/countdown.js      Live countdown (early access → public drop → live)
js/collection.js     Renders the 4 product cards, reveals by date
js/faq.js            Accessible accordion
js/form.js           Sign-up form validation + submit states
js/consent.js        Cookie banner + Meta Pixel gate (no fake ID)
js/referral.js        Thank-you page: referral link, copy/share, WhatsApp
.claude/launch.json  Lets the Claude Code browser preview run this locally
```

Everything date-, link- and price-related lives in `js/config.js` and
`js/i18n.js` — nothing is hardcoded inside a component.

## What's implemented and working end-to-end

- **Countdown** — real, ticking, targets `EARLY_ACCESS_DATE` then
  `PUBLIC_DROP_DATE`, then shows a live state. Dates are in `js/config.js`.
- **Sign-up form** — real validation (required email format, required
  country), per-field error states, submitting state, and a mock
  submission (`js/form.js`) that redirects to `thank-you.html` on success.
- **Collection reveal** — each of the 4 products blurs/unblurs based on
  its `revealDate` in `js/config.js`; re-checks every minute.
- **FAQ accordion** — accessible (button + `aria-expanded` +
  `aria-controls`), animated open/close, all 6 questions from the brief.
- **Language switch (EN/IT)** — every string on both pages is driven by
  `js/i18n.js`; the IT copy is the real Italian text from your reference
  material, not a placeholder.
- **Cookie banner + Meta Pixel gate** — the Pixel is never loaded and no
  event ever fires before the visitor accepts marketing cookies, and
  there's no fake Pixel ID anywhere (see `js/consent.js`).
- **Referral (thank-you page)** — personal link, 0/3 counter, working
  Copy button (with a manual-select fallback), working WhatsApp share
  link, native Share button where supported. This is a **mock** — see
  below.
- **Responsive** — mobile-first; ≥960px the hero image + headline +
  countdown + form become a two-column composition (image left, ~60%;
  content right, ~40%), matching the desktop mock. Verified with the
  browser preview at 375px and 1440px, no horizontal overflow.
- **Accessibility** — semantic headings, real `<label>`s, keyboard-
  operable accordion and language switch, visible focus states, skip
  link to the form, `aria-live` on the countdown and collection grid.

## What's mocked and needs a real integration

These are isolated on purpose — nothing pretends to be real:

1. **Waitlist backend** — `mockSubmitToWaitlist()` in `js/form.js` fakes
   a network call. Swap it for a real request (Shopify app, Klaviyo,
   whatever the final ESP is) — the comment right above it shows the
   shape expected.
2. **Referral system** — `js/referral.js` reads a record from
   `localStorage` that `js/form.js` wrote after the mock submit. Replace
   with Viral Loops / KickoffLabs (or similar) per the brief; the
   copy/WhatsApp/share UI stays as-is.
3. **Meta Pixel** — no ID is set. Once you have one, put it in
   `META_PIXEL_ID` in `js/config.js`; `js/consent.js` then loads the
   Pixel and fires `Lead` on sign-up automatically, still gated by
   cookie consent.
4. **Country → language auto-detect** — currently uses the browser's own
   `navigator.language` as a stand-in (commented in `js/main.js`), since
   true country detection needs a platform (Shopify Markets) or a geo-IP
   service this static page doesn't have.

## Assets you still need to provide

All of these are placeholders on purpose, each clearly marked
`TODO(real-assets)` at its source:

- **Hero image/video** — must be the *same* asset as the Instagram ad
  (`HERO.heroImage` / `HERO.heroVideo` / `HERO.posterImage` in
  `js/config.js`). Until set, an elegant dashed placeholder shows instead.
- **4 product photos** — `PRODUCTS[i].image` in `js/config.js`. Until
  set, each card shows a simple line-art silhouette (T-shirt, tank,
  trousers, socks) instead of a stock photo.
- **WhatsApp Business number** — `WHATSAPP_NUMBER` in `js/config.js`.
  The thank-you page's "Save EMOTI contact" button stays visibly inert
  until this is a real number.
- **Instagram / Facebook URLs** — sanity-check `INSTAGRAM_URL` /
  `FACEBOOK_URL` in `js/config.js`.
- **Privacy / cookies / returns pages** — `PRIVACY_URL` / `COOKIES_URL` /
  `RETURNS_URL` in `js/config.js`, currently `#`.
- **OG share image** — `og:image` in the `<head>` of `index.html`.

## Notable design decisions

- **No framework.** The project folder was empty, so introducing React/
  Vue/etc. would have been unjustified architecture for an 8-section,
  2-page site. Vanilla JS keeps it fast on mobile data, as the brief
  explicitly asks for.
- **The whole page is dark**, not just the hero. Re-reading your own
  reference mock (desktop page), only the sign-up form is a light
  ("off-white") card floating on the dark page; benefits, collection,
  FAQ and footer are all dark. That's what's built — a page that's dark
  except for one light card reads as more premium/editorial than
  alternating light/dark bands.
- **Desktop composition** is a single CSS grid over the hero, headline+
  countdown and sign-up form (`.hero-composition` in `styles.css`), so
  the DOM order stays identical to mobile (good for accessibility and
  SEO) while the visual order changes via `grid-template-areas` — no
  content duplication.
- **FAQ answers for "right of withdrawal" and "measurements in cm"**
  are two extra questions your EN brief asked for that weren't in the
  literal Italian source text; their IT translations are plain,
  literal translations (flagged `TODO(review-it)` in `js/i18n.js`) —
  worth a native-speaker pass before launch, everything else is your
  original copy verbatim.
- **Silhouette placeholders instead of gray boxes** for the 4 unrevealed
  products — simple inline SVG line art per garment, so the "blurred
  reveal" concept reads clearly even with zero real photography yet.

## Before ads go live — quick checklist

- [ ] Set real dates in `js/config.js` if they change.
- [ ] Add hero video/image + 4 product photos.
- [ ] Add the real WhatsApp number, Instagram/Facebook URLs, policy pages.
- [ ] Wire `mockSubmitToWaitlist()` to a real backend.
- [ ] Wire `js/referral.js` to a real referral tool.
- [ ] Add `META_PIXEL_ID` once issued, then confirm the `Lead` event shows
      up in Meta Events Manager *after* accepting the cookie banner.
- [ ] Re-test sign-up → thank-you → copy link → WhatsApp share on a real
      phone (clipboard permissions behave differently in sandboxed
      preview browsers than in production Safari/Chrome).
