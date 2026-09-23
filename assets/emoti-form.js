/**
 * EMOTI — sign-up form: client-side validation + a light touch before the
 * REAL Shopify submission happens.
 *
 * The form itself (sections/emoti-hero.liquid) is a native
 * `{% form 'customer' %}` — submitting it is a genuine Shopify customer
 * sign-up (no mock, no fake success state). This file only:
 *   1. Pre-validates email/country so a visitor doesn't round-trip to
 *      Shopify for a mistake this can catch locally.
 *   2. Composes contact[tags] / contact[note] from the extra fields
 *      Shopify's native form doesn't have built-in inputs for (country,
 *      size, WhatsApp, the two separate consents) right before submit.
 *   3. Seeds a local referral record (email hash → code) that the
 *      thank-you page's mock referral card reads — see emoti-referral.js
 *      for why this is a mock and how to replace it with a real tool.
 * It never intercepts or blocks the actual submission once validation
 * passes — the browser's normal form POST to Shopify still happens.
 */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(field, message) {
    var group = field.closest('.field');
    if (!group) return;
    var errorEl = group.querySelector('.field__error');
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      group.classList.add('has-error');
      if (errorEl) errorEl.textContent = message;
    } else {
      field.removeAttribute('aria-invalid');
      group.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validate(form, strings) {
    var email = form.querySelector('#Email');
    var country = form.querySelector('#Country');
    var firstInvalid = null;
    var ok = true;

    if (!email.value.trim()) {
      setFieldError(email, strings.errorEmailRequired);
      ok = false; firstInvalid = firstInvalid || email;
    } else if (!EMAIL_RE.test(email.value.trim())) {
      setFieldError(email, strings.errorEmailInvalid);
      ok = false; firstInvalid = firstInvalid || email;
    } else {
      setFieldError(email, null);
    }

    if (!country.value) {
      setFieldError(country, strings.errorCountryRequired);
      ok = false; firstInvalid = firstInvalid || country;
    } else {
      setFieldError(country, null);
    }

    return { ok: ok, firstInvalid: firstInvalid };
  }

  function buildReferralCode(email) {
    var base = (email.split('@')[0] || 'friend').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    return base + Math.floor(Math.random() * 90 + 10);
  }

  function composeTagsAndNote(form) {
    var email = form.querySelector('#Email').value.trim();
    var country = form.querySelector('#Country').value;
    var sizeInput = form.querySelector('input[name="size"]:checked');
    var size = sizeInput ? sizeInput.value : '';
    var whatsapp = form.querySelector('#Whatsapp').value.trim();
    var consentEmail = form.querySelector('#consent-email').checked;
    var consentWhatsapp = form.querySelector('#consent-whatsapp').checked;

    var tags = ['drop01-waitlist'];
    if (consentEmail) tags.push('newsletter');
    if (consentWhatsapp) tags.push('whatsapp-optin');
    if (country) tags.push('country-' + country.toLowerCase().replace(/\s+/g, '-'));

    var noteLines = [
      'Drop 01 waitlist sign-up',
      'Country: ' + (country || '—'),
      'Preferred size: ' + (size || '—'),
      'WhatsApp: ' + (whatsapp || '—'),
      'Email consent: ' + (consentEmail ? 'yes' : 'no'),
      'WhatsApp consent: ' + (consentWhatsapp ? 'yes' : 'no'),
    ];

    var tagsField = form.querySelector('#ContactTags');
    var noteField = form.querySelector('#ContactNote');
    if (tagsField) tagsField.value = tags.join(',');
    if (noteField) noteField.value = noteLines.join('\n');

    return { email: email, country: country, size: size, whatsapp: whatsapp, consentEmail: consentEmail, consentWhatsapp: consentWhatsapp };
  }

  function seedReferralRecord(data) {
    try {
      localStorage.setItem('emoti_waitlist_mock', JSON.stringify({
        email: data.email,
        country: data.country,
        referralCode: buildReferralCode(data.email),
        friendsCount: 0,
        savedAt: Date.now(),
      }));
    } catch (e) { /* storage unavailable — thank-you page falls back to a demo state */ }
  }

  function initForm(form) {
    var strings = (window.EMOTI && window.EMOTI.strings) || {};
    var submitBtn = form.querySelector('[type="submit"]');
    var summaryEl = form.querySelector('[data-form-summary]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';

    ['Email', 'Country'].forEach(function (id) {
      var field = form.querySelector('#' + id);
      if (!field) return;
      field.addEventListener('input', function () { setFieldError(field, null); });
      field.addEventListener('change', function () { setFieldError(field, null); });
    });

    form.addEventListener('submit', function (e) {
      var result = validate(form, strings);
      if (!result.ok) {
        e.preventDefault();
        if (summaryEl) { summaryEl.hidden = false; summaryEl.textContent = strings.errorSummary || ''; }
        if (result.firstInvalid) result.firstInvalid.focus();
        return;
      }
      if (summaryEl) summaryEl.hidden = true;

      var data = composeTagsAndNote(form);
      seedReferralRecord(data);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = strings.submitting || submitLabel;
      }
      // No preventDefault from here on — the native Shopify customer
      // form submission proceeds normally.
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('EmotiWaitlistForm');
    if (form) initForm(form);
  });
})();
