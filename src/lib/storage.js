export const DEFAULT_CONFIG = {
  domains: ["cas.cuni.cz", "new.cas.cuni.cz"],
  totp: {
    issuer: "Charles University CAS",
    accountName: "",
    secretBase32: ""
  },
  automation: {
    autoFill: true,
    autoSubmit: false,
    autoAdvanceToNextPage: true,
    selectors: {
      otpInput: [
        "input[name='otp']",
        "input[name='token']",
        "input[id*='otp']",
        "input[id*='token']",
        "input[autocomplete='one-time-code']"
      ],
      submitButton: ["button[type='submit']", "input[type='submit']"]
    }
  }
};

const STORAGE_KEY = "cuniCas2FAConfig";

export async function getConfig() {
  const data = await browser.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_CONFIG, ...(data[STORAGE_KEY] || {}) };
}

export async function setConfig(config) {
  await browser.storage.local.set({ [STORAGE_KEY]: config });
}
