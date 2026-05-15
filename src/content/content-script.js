import { hostnameMatches, firstMatchingElement, detectOtpInput, detectOtpInputs } from "../lib/rules.js";

function goToNextPage(otpInput, submitSelectors) {
  const submit = firstMatchingElement(submitSelectors);
  if (submit) {
    submit.click();
    return;
  }

  if (otpInput?.form) {
    otpInput.form.requestSubmit?.();
    if (typeof otpInput.form.submit === "function") otpInput.form.submit();
    return;
  }

  otpInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  otpInput.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
}

async function fillOtpIfApplicable() {
  const response = await browser.runtime.sendMessage({ type: "GET_TOTP" });
  if (!response?.ok) return;

  const { config, code } = response;
  if (!config.automation.autoFill) return;
  if (!hostnameMatches(window.location.hostname, config.domains)) return;

  const otpInput = detectOtpInput(config.automation.selectors.otpInput);
  if (!otpInput) return false;

  const otpInputs = detectOtpInputs(config.automation.selectors.otpInput).filter((el) => !el.disabled && !el.readOnly);
  const digitOnlyInputs = otpInputs.filter((input) => input.maxLength === 1);

  if (digitOnlyInputs.length >= 6 && /^\d{6,8}$/.test(code)) {
    digitOnlyInputs.slice(0, code.length).forEach((input, index) => {
      input.focus();
      input.value = code[index];
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  } else {
    otpInput.focus();
    otpInput.value = code;
    otpInput.dispatchEvent(new Event("input", { bubbles: true }));
    otpInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  if (config.automation.autoSubmit || config.automation.autoAdvanceToNextPage) {
    goToNextPage(otpInput, config.automation.selectors.submitButton);
  }

  return true;
}

let attempts = 0;
const maxAttempts = 10;
const attemptFill = async () => {
  const done = await fillOtpIfApplicable();
  if (done || attempts >= maxAttempts) return;
  attempts += 1;
  setTimeout(() => void attemptFill(), 700);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void attemptFill());
} else {
  void attemptFill();
}
