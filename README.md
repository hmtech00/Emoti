# EMOTI — Drop 01 · No Limitations

A real **Shopify Online Store 2.0 theme** implementing the waitlist landing
page + thank-you page from your reference brief, built with Liquid,
JSON templates, sections and blocks, editable through the Shopify Theme
Editor — not a standalone frontend app.

> The previous static HTML/CSS/JS build (from before this Shopify pivot)
> is kept for reference in `archive-static-version/` and is **not** part
> of the theme; Shopify never reads that folder.

---

## 1 · Link this theme to a Shopify store

**The Shopify CLI is already installed** in this project (as a local dev
dependency — see `package.json`), so every command below runs via `npx`
or the npm scripts. No global install, no Homebrew needed.

### You need a store first

Any of these work:
- An existing store you have admin access to.
- A free **development store**: create one at
  [partners.shopify.com](https://partners.shopify.com) → Stores → Add
  store → Development store (no time limit, can't take real payments
  until you upgrade — the right choice for testing this theme).
- A **Shopify Trial** store from [shopify.com](https://www.shopify.com).

You'll need its `.myshopify.com` domain, e.g. `emoti-dev.myshopify.com`.

### Authenticate (once per machine)

This step opens your **own** browser for Shopify's login — it has to run
in an interactive terminal you control, not something that can be driven
on your behalf:

```bash
cd /Users/hendrik/emoti
npx shopify auth login
```

Log in with the account that has access to the store.

### Link + preview live (recommended first step)

```bash
npx shopify theme dev --store=emoti-dev.myshopify.com
```

Replace the store domain with yours. First run, it'll ask you to confirm
the store; after that it's remembered for this folder. This command:
- Uploads the theme as a temporary, disposable **development theme**
  (never affects your live storefront).
- Prints a live preview URL and a Theme Editor URL.
- Hot-reloads on every file save — the fastest way to see it for real.
- Stops/removes the dev theme when you `Ctrl+C`.

### Push it as a real, saved theme (once you're happy)

```bash
npx shopify theme push --unpublished --store=emoti-dev.myshopify.com
```

This uploads it as a new theme in **Online Store → Themes**, unpublished
(your current live theme keeps running) — safe to install alongside
whatever the store already has, and to review in the Theme Editor before
publishing. When you're ready to make it live: **Themes → find "EMOTI —
No Limitations" → Publish**, or `npx shopify theme publish`.

### Without the CLI at all

Admin → **Online Store → Themes → Add theme → Upload zip file**: zip this
folder's *contents* (not the folder itself — the zip's root must contain
`layout/`, `sections/`, etc. directly), upload, same unpublished-by-
default safety.

### npm shortcuts

`package.json` has these wired to the store you last used with `theme dev`:

```bash
npm run dev              # theme dev
npm run push:unpublished # theme push --unpublished
npm run check             # theme check (Shopify's own theme linter)
```

`npm run check` is worth running after any edit — it just caught and this
build has now fixed 5 real Liquid syntax/schema errors that manual review
alone would have missed. It currently reports 0 errors, 2 expected
warnings (Google Fonts isn't served from Shopify's CDN — unavoidable and
harmless).

## 2 · Set up the two pages

The theme ships two custom page templates. You need to create the actual
Shopify **Pages** that use them:

1. **Admin → Online Store → Pages → Add page**
   - Title: e.g. "Waitlist" — Theme template: **`page.emoti-waitlist`**
   - This is optional: the theme's `templates/index.json` already renders
     the same waitlist layout at your **homepage** (`/`), per your brief
     ("the same domain is the landing page before the drop, the shop
     after"). Create this page only if you also want the waitlist
     reachable at a stable `/pages/...` URL.
2. **Admin → Online Store → Pages → Add page**
   - Title: "Thank you" — Theme template: **`page.emoti-thank-you`**
   - Then go to **Theme Editor → Theme settings → Pages** and select this
     page under **"Thank-you page"**. This is what the sign-up form's
     `return_to` uses — without it, it falls back to `/pages/thank-you`,
     so naming the page's handle `thank-you` also works with zero config.

## 3 · Configure the landing page in the Theme Editor

**Online Store → Themes → Customize**, on the homepage (or your waitlist
page). Everything below is editable without touching code:

- **Header** (top of the section list): logo image or text, sticky toggle.
- **Hero + Sign-up** (one section — see "Design decisions" for why):
  hero video (Shopify-hosted) or image, its alt text, and optional
  headline/subtext/form-title overrides (leave blank to use the built-in
  EN/IT copy).
- **Benefits**: 3 blocks, each with a title + description — add/remove/
  reorder blocks freely.
- **Collection**: up to 8 "Product" blocks. For each: link a real Shopify
  product (title/price/image come from it automatically) or fill in the
  placeholder name/price/image, plus its **reveal date** (ISO 8601 text,
  e.g. `2026-10-05T00:00:00+02:00`).
- **Brand line**, **FAQ** (add/remove question blocks), **Final CTA**,
  **Footer**: all plain text fields.
- **Theme settings** (gear icon, top-left of the editor): the *global*
  config — drop dates, WhatsApp number, Instagram/Facebook, legal page
  links, Meta Pixel ID, colors, the thank-you page picker, and the OG
  share image. This is the theme's "central config" (per your brief's
  `dropConfig` / `socialConfig` / `legalConfig` / `contactConfig`) — see
  `config/settings_schema.json`.

## 4 · Configure the dates

**Theme settings → Drop 01 — Campaign.** Two fields, both full ISO 8601
with a timezone offset:

- **List early-access date & time** — default `2026-10-10T20:00:00+02:00`
- **Public drop date & time** — default `2026-10-11T20:00:00+02:00`

Everything else — the countdown, every date shown in copy, the collection
reveal logic — reads from these two fields plus each product block's own
reveal date. Nothing is hardcoded elsewhere.

## 5 · Register the products

Two ways to show a product in **The Collection** section, per block:

- **Linked to a real Shopify product** (recommended once your catalog
  exists): open the block in the Theme Editor, use the "Shopify product"
  picker. Title, price, image and the product URL then come straight
  from that product — nothing is duplicated by hand. Before its reveal
  date, the card still shows the blurred placeholder (not the real
  photo) even though a product is linked, so nobody can peek early by
  viewing page source.
- **Placeholder-only** (until the product exists in Shopify): fill in
  "Placeholder name" / "Placeholder price" / "Placeholder image" instead.
  An elegant inline silhouette (T-shirt / tank / trousers / socks —
  picked via the block's "Placeholder silhouette" setting) shows until
  either a real image is added or the reveal date passes.

## 6 · Connect email marketing

The sign-up form is a **real, native Shopify customer sign-up** — not a
mock. It uses `{% form 'customer' %}` (the same mechanism Shopify's own
Dawn theme uses for newsletter capture), submitting `contact[email]` —
this genuinely creates/updates a Customer record in **Shopify Admin →
Customers**.

Country, preferred size, WhatsApp number and the two consent checkboxes
aren't native Shopify customer fields, so `assets/emoti-form.js` folds
them into:
- `contact[tags]` — e.g. `drop01-waitlist,newsletter,whatsapp-optin,country-italy`
  (tags are genuinely queryable/segmentable in Admin and in Shopify Email).
- `contact[note]` — a readable summary (country, size, WhatsApp, both
  consent states) visible on the customer's profile in Admin.

**For structured, queryable fields instead of tags/note text:** define
Customer metafields under **Settings → Custom data → Customers** (e.g.
`custom.country`, `custom.preferred_size`, `custom.whatsapp`), then in
`sections/emoti-hero.liquid` change the relevant `<input>`/`<select>`
`name` attributes to `contact[metafields][custom][your_key]`. This is a
real, documented Shopify mechanism — it just needs the metafields to
exist first, so it isn't wired by default.

**Double opt-in:** whether Shopify sends an automatic marketing-consent
confirmation email depends on your store's own **Settings → Customer
privacy** configuration and region. The thank-you page's copy ("check
your email to confirm") is accurate regardless — nothing here claims a
confirmation that hasn't happened. For full control over double opt-in,
route marketing through **Shopify Email**'s confirmed-opt-in feature or
an ESP (Klaviyo, Omnisend, ...) connected via their own Shopify app.

**Before launch:** submit this form once for real in a Shopify dev/
development store and confirm the customer, tags and note all land as
expected — this environment can't execute Shopify's Liquid engine to
verify that for you.

## 7 · Connect the Meta Pixel

**Theme settings → Tracking & consent → Meta Pixel ID.** Leave it blank
until you have a real one — `assets/emoti-consent.js` never loads `fbq`
or fires an event with an empty/placeholder ID. Once set, the `Lead`
event fires automatically on the thank-you page, but **only** after the
visitor has accepted the cookie banner (required for EU compliance) —
this is enforced in code, not just documented.

## 8 · Connect cookie consent / a CMP

The current banner (`snippets/emoti-consent-banner.liquid` +
`assets/emoti-consent.js`) is a minimal, honest Accept/Reject
implementation — no dark patterns, decision stored in `localStorage`,
nothing loads before Accept. It is **not** a full legal CMP.

To connect a dedicated consent platform (a Shopify App Store CMP,
Cookiebot, etc.): replace that snippet's markup with the tool's embed,
and keep `window.EMOTI_CONSENT = { marketing: true/false }` as the
single source of truth `emoti-consent.js`'s Pixel loader reads — nothing
else needs to change.

## 9 · Connect the referral system

**Not connected — deliberately mocked, clearly labelled as such.**
`assets/emoti-referral.js` reads a record `assets/emoti-form.js` saves to
`localStorage` right before the real Shopify sign-up submits (referral
code generated from the email, friend count `0`). If that record is
missing or stale (e.g. the thank-you page was opened directly), a
"Demo data" notice shows — the mock never presents itself as real.

To connect **Viral Loops**, **KickoffLabs**, or similar: those tools
typically give you an embeddable widget or an API returning
`{ referralCode, referralUrl, friendsCount }` for the signed-up visitor.
Swap `getSignupRecord()` in `assets/emoti-referral.js` for that call —
the copy-link / WhatsApp-share / native-share buttons don't need to
change.

## 10 · Assets you still need to provide

All placeholders, all clearly marked in the Theme Editor with an `info`
note — nothing here pretends to be final:

- **Hero video or image** — Theme Editor → Hero + Sign-up. Must be the
  same asset used in the Instagram ad. An elegant dashed placeholder
  shows until one is set.
- **4 product photos** — per Collection block, or link real Shopify
  products once they exist. Silhouette line art stands in until then.
- **WhatsApp Business number** — Theme settings → Contact. The
  thank-you page's "Save contact" button stays visibly disabled until
  this is real.
- **Instagram / Facebook URLs** — Theme settings → Social.
- **Privacy / cookies / returns pages** — Theme settings → Legal (the
  `url` picker can point at your real Shopify policy pages under
  Settings → Policies, or any custom page).
- **Logo** — Theme Editor → Header (optional; falls back to a text
  wordmark).
- **OG share image** — Theme settings → SEO & sharing.

## 11 · What's prepared but not yet connected

| Piece | Status |
|---|---|
| Waitlist sign-up | **Real** — native Shopify customer creation, not mocked |
| Meta Pixel `Lead` event | Prepared, gated by consent, inert until you add a real Pixel ID |
| Cookie consent | Real minimal Accept/Reject banner; upgrade path to a full CMP documented above |
| Referral system | **Mocked**, clearly labelled; upgrade path to Viral Loops/KickoffLabs documented above |
| Double opt-in confirmation email | Depends on your store's own Customer privacy / Shopify Email / ESP setup |
| Shopify Markets language auto-switch | Real, native (`localization` form) — only shows a working switcher once a 2nd language is published under Settings → Languages |
| Country → language auto-detection | Handled by Shopify Markets once configured; until then every visitor sees the shop's default language |
| Product catalog (PDP/PLP/cart) | Minimal, functional baseline (`main-product`, `main-collection-product-grid`, `main-cart`) — real Shopify cart/checkout, but intentionally plain; see "Design decisions" |

## 12 · Testing checklist before the sign-up ads go live

- [ ] Submit the sign-up form for real in a dev store; confirm the
      Customer, its tags and its note appear correctly in Admin.
- [ ] Confirm the thank-you page's referral card shows real (not demo)
      data right after a genuine sign-up, and the demo notice shows when
      the page is opened directly.
- [ ] Set a real Meta Pixel ID, accept the cookie banner, and confirm the
      `Lead` event appears in Meta Events Manager.
- [ ] Check the countdown against both dates in Theme settings, in more
      than one timezone.
- [ ] Add a second language under Settings → Languages and confirm the
      IT/EN switcher appears and actually re-renders the page.
- [ ] Test at 375px, 390px, 430px (mobile), and 1280/1440/1920px
      (desktop) — no horizontal scroll, no clipped text, no tiny tap
      targets.
- [ ] Confirm the "Save WhatsApp contact" button is disabled until a
      real number is set, then works once it is.
- [ ] Run Lighthouse/PageSpeed on mobile — this is the priority traffic.

---

## Design decisions

- **Hero + Countdown + Sign-up form are ONE section**
  (`sections/emoti-hero.liquid`), not three separate files as the brief's
  suggested filenames list. Reason: the desktop layout needs the campaign
  image and the promise/countdown/form to sit in a true CSS Grid
  two-column composition (image ~60%, form ~40%, above the fold — brief
  §29). That only holds up reliably when they're real DOM siblings inside
  one grid container; three independently-reorderable sections could be
  split apart in the Theme Editor and silently break that layout. Blocks
  inside the one section still give merchants independent control over
  each piece's copy. This is the "better Shopify-native solution" your
  brief's §37 explicitly allows for.
- **Locale files, not a JS dictionary, drive translation** — every static
  string renders through Shopify's own `{{ 'key' | t }}` mechanism
  (`locales/en.default.json` / `it.json`), and the language switcher
  submits Shopify's native `localization` form. This is the real Markets/
  translation infrastructure your brief asks for (§34), not a client-side
  text-swap standing in for it.
- **Dates are text settings, not a native date picker** — Shopify's
  Online Store 2.0 settings schema has no "date" type. Every date field
  is a labelled ISO-8601 text field with an inline format example. This
  is the standard, documented workaround real Shopify themes use.
- **The page is white/light, matching the real @emotitii Instagram** —
  not the near-black "No Limitations" campaign mock. Checked the live
  profile: neutral off-white/cream/grey studio tones, soft natural light,
  no dark backgrounds anywhere on the actual account. The sign-up form
  stays a **dark** accent card (the inverse of the old light-card-on-dark
  page), so it's still the one unmissable block on the page — see
  `config/settings_schema.json` → Colors and the token comment at the top
  of `assets/emoti.css` for the full rationale. Update Theme settings →
  Colors if you want to go darker again later; nothing else needs to
  change.
- **The product/collection/cart pages are intentionally minimal** — the
  brief is explicit that this theme should use Shopify's own cart/
  checkout rather than a custom build, so `main-product` /
  `main-collection-product-grid` / `main-cart` exist only so the theme is
  genuinely installable and every product is genuinely buyable from day
  one. They are not a polished PDP/PLP build (no variant images, filters,
  upsells, cart drawer). Before the public drop, either build these out
  further or merge this theme's `sections/emoti-*` files into Dawn (or
  another full commerce theme) for the storefront pages, keeping this
  theme's waitlist/thank-you pages as-is.
