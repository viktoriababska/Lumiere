/* Lumiere · Laboratory 9. Client-only demo validation; no data is sent. */
(() => {
  'use strict';

  // Strict format: +380 followed by exactly nine digits, no spaces or punctuation.
  const PHONE_RE = /^\+380\d{9}$/;
  // Educational email rule: one @, no spaces, with a dotted domain.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const dialog = document.getElementById('feedbackSuccessDialog');
  const fields = [
    { input: document.getElementById('feedbackName'), error: document.getElementById('feedbackNameError'), validate(value) {
      if (!value) return 'Введіть ваше ім’я.';
      if ([...value].length < 2) return 'Ім’я має містити щонайменше 2 символи.';
      return '';
    } },
    { input: document.getElementById('feedbackEmail'), error: document.getElementById('feedbackEmailError'), validate(value) {
      if (!value) return 'Введіть електронну пошту.';
      if (!EMAIL_RE.test(value)) return 'Введіть коректну електронну адресу, наприклад name@example.com.';
      return '';
    } },
    { input: document.getElementById('feedbackPhone'), error: document.getElementById('feedbackPhoneError'), validate(value) {
      if (!value) return 'Введіть номер телефону.';
      if (!PHONE_RE.test(value)) return 'Використовуйте формат +380XXXXXXXXX (9 цифр після +380, без пробілів).';
      return '';
    } },
    { input: document.getElementById('feedbackMessage'), error: document.getElementById('feedbackMessageError'), validate(value) {
      if (!value) return 'Напишіть повідомлення.';
      if ([...value].length < 10) return 'Повідомлення має містити щонайменше 10 символів.';
      return '';
    } },
    { input: document.getElementById('feedbackAgreement'), error: document.getElementById('feedbackAgreementError'), validate() {
      return this.input.checked ? '' : 'Підтвердьте згоду з умовами захисту персональних даних.';
    } }
  ];

  // Only textContent is used for messages, never unsafe HTML injection.
  function showError(field, message) {
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', 'true');
    field.input.classList.add('is-invalid');
    field.input.classList.remove('is-valid');
  }
  function showSuccess(field) {
    field.error.textContent = '';
    field.input.setAttribute('aria-invalid', 'false');
    field.input.classList.remove('is-invalid');
    field.input.classList.add('is-valid');
  }
  function clearError(field) {
    field.error.textContent = '';
    field.input.setAttribute('aria-invalid', 'false');
    field.input.classList.remove('is-invalid', 'is-valid');
  }
  function validateField(field) {
    const value = field.input.type === 'checkbox' ? '' : field.input.value.trim();
    const error = field.validate(value);
    if (error) showError(field, error);
    else showSuccess(field);
    return !error;
  }

  // Do not show error messages before the user interacts with a field.
  for (const field of fields) {
    field.touched = false;
    field.input.addEventListener('blur', () => {
      field.touched = true;
      validateField(field);
    });
    field.input.addEventListener(field.input.type === 'checkbox' ? 'change' : 'input', () => {
      field.touched = true;
      validateField(field);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let firstInvalid = null;
    for (const field of fields) {
      field.touched = true;
      if (!validateField(field) && !firstInvalid) firstInvalid = field.input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Lab demonstration only: there is no fetch(), backend or data transfer.
    form.reset();
    for (const field of fields) {
      field.touched = false;
      clearError(field);
    }
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
      dialog.querySelector('.feedback-dialog-close')?.focus();
    }
  });

  // The native dialog traps focus, supports Esc, and restores focus when closed.
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
