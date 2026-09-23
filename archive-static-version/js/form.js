/**
 * EMOTI — sign-up form: validation, submit states, mock persistence.
 *
 * There is no backend yet. `mockSubmitToWaitlist()` below is the single,
 * clearly isolated place that pretends one exists — it never claims a
 * real integration. Swap its body for a real fetch() to Shopify /
 * Klaviyo / your ESM's list-signup endpoint when one exists; nothing
 * else in this file needs to change.
 */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * TODO(integration): replace this body with a real request, e.g.
   *   return fetch('/apps/waitlist/signup', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify(data),
   *   }).then(r => { if (!r.ok) throw new Error('signup failed'); return r.json(); });
   * Until then this simulates network latency and always succeeds, and
   * generates a mock referral code so the thank-you page has something
   * real to display end-to-end.
   */
  function mockSubmitToWaitlist(data) {
    return new Promise(function (resolve) {
      window.setTimeout(function () {
        var code = (data.email.split('@')[0] || 'friend')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 10) + Math.floor(Math.random() * 90 + 10);
        resolve({ referralCode: code, friendsCount: 0 });
      }, 700);
    });
  }

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

  function validate(form, t) {
    var email = form.querySelector('#email');
    var country = form.querySelector('#country');
    var firstInvalid = null;
    var ok = true;

    if (!email.value.trim()) {
      setFieldError(email, t.error_email_required);
      ok = false;
      firstInvalid = firstInvalid || email;
    } else if (!EMAIL_RE.test(email.value.trim())) {
      setFieldError(email, t.error_email_invalid);
      ok = false;
      firstInvalid = firstInvalid || email;
    } else {
      setFieldError(email, null);
    }

    if (!country.value) {
      setFieldError(country, t.error_country_required);
      ok = false;
      firstInvalid = firstInvalid || country;
    } else {
      setFieldError(country, null);
    }

    return { ok: ok, firstInvalid: firstInvalid };
  }

  function collectData(form) {
    var sizeInput = form.querySelector('input[name="size"]:checked');
    return {
      email: form.querySelector('#email').value.trim(),
      country: form.querySelector('#country').value,
      size: sizeInput ? sizeInput.value : null,
      whatsapp: form.querySelector('#whatsapp').value.trim() || null,
      consentEmail: form.querySelector('#consent-email').checked,
      consentWhatsapp: form.querySelector('#consent-whatsapp').checked,
      submittedAt: new Date().toISOString(),
    };
  }

  function initForm(form) {
    var lang = window.EMOTI_LANG || 'en';
    var t = window.EMOTI_I18N[lang];
    var submitBtn = form.querySelector('[type="submit"]');
    var summaryEl = form.querySelector('[data-form-summary]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';

    // Clear a field's error as soon as the visitor fixes it.
    ['email', 'country'].forEach(function (id) {
      var field = form.querySelector('#' + id);
      if (!field) return;
      field.addEventListener('input', function () { setFieldError(field, null); });
      field.addEventListener('change', function () { setFieldError(field, null); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = window.EMOTI_I18N[window.EMOTI_LANG || 'en'];
      var result = validate(form, t);

      if (!result.ok) {
        if (summaryEl) {
          summaryEl.hidden = false;
          summaryEl.textContent = t.error_summary;
        }
        if (result.firstInvalid) result.firstInvalid.focus();
        return;
      }
      if (summaryEl) summaryEl.hidden = true;

      var data = collectData(form);
      form.classList.add('is-submitting');
      submitBtn.disabled = true;
      submitBtn.textContent = t.submit_sending;

      mockSubmitToWaitlist(data)
        .then(function (result) {
          try {
            localStorage.setItem(
              'emoti_waitlist_mock',
              JSON.stringify({
                email: data.email,
                country: data.country,
                referralCode: result.referralCode,
                friendsCount: result.friendsCount,
              })
            );
          } catch (err) { /* storage unavailable — thank-you page falls back to a demo state */ }

          if (typeof window.EMOTI_trackLead === 'function') {
            window.EMOTI_trackLead(data);
          }
          window.location.href = 'thank-you.html';
        })
        .catch(function () {
          form.classList.remove('is-submitting');
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
          if (summaryEl) {
            summaryEl.hidden = false;
            summaryEl.textContent = t.error_generic;
          }
        });
    });
  }

  function init() {
    document.querySelectorAll('[data-component="signup-form"]').forEach(initForm);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
