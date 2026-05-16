import { getTotpPayload } from "../lib/runtime.js";

async function refreshOtp() {
  const result = await getTotpPayload();
  const otpNode = document.getElementById("otp");
  const ttlNode = document.getElementById("ttl");

  if (!result?.ok) {
    otpNode.textContent = "------";
    ttlNode.textContent = result?.error || "Not configured. Open setup.";
    return;
  }

  otpNode.textContent = result.code;
  ttlNode.textContent = `Valid for ${result.remainingSeconds}s`;
}

document.getElementById("openOptions").addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

document.getElementById("copyOtp").addEventListener("click", async () => {
  const otpNode = document.getElementById("otp");
  const otp = otpNode?.textContent?.trim();
  if (!otp || otp === "------") return;

  try {
    await navigator.clipboard.writeText(otp);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(otpNode);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("copy");
    selection?.removeAllRanges();
  }
});

refreshOtp();
setInterval(refreshOtp, 1000);
