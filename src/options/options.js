import { getConfig, setConfig } from "../lib/storage.js";

function listToText(list) {
  return (list || []).join("\n");
}

function textToList(value) {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function loadForm() {
  const config = await getConfig();

  document.getElementById("issuer").value = config.totp.issuer || "";
  document.getElementById("accountName").value = config.totp.accountName || "";
  document.getElementById("secretBase32").value = config.totp.secretBase32 || "";

  document.getElementById("domains").value = listToText(config.domains);
  document.getElementById("autoFill").checked = !!config.automation.autoFill;
  document.getElementById("autoSubmit").checked = !!config.automation.autoSubmit;
  document.getElementById("autoAdvanceToNextPage").checked = config.automation.autoAdvanceToNextPage !== false;

  document.getElementById("otpSelectors").value = listToText(config.automation.selectors.otpInput);
  document.getElementById("submitSelectors").value = listToText(config.automation.selectors.submitButton);
}

document.getElementById("configForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const config = {
    domains: textToList(document.getElementById("domains").value),
    totp: {
      issuer: document.getElementById("issuer").value.trim(),
      accountName: document.getElementById("accountName").value.trim(),
      secretBase32: document.getElementById("secretBase32").value.replace(/\s+/g, "").toUpperCase()
    },
    automation: {
      autoFill: document.getElementById("autoFill").checked,
      autoSubmit: document.getElementById("autoSubmit").checked,
      autoAdvanceToNextPage: document.getElementById("autoAdvanceToNextPage").checked,
      selectors: {
        otpInput: textToList(document.getElementById("otpSelectors").value),
        submitButton: textToList(document.getElementById("submitSelectors").value)
      }
    }
  };

  await setConfig(config);
  document.getElementById("status").textContent = "Saved.";
});

void loadForm();
