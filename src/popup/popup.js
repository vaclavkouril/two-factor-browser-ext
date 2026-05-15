async function refreshOtp() {
  const result = await browser.runtime.sendMessage({ type: "GET_TOTP" });
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

refreshOtp();
setInterval(refreshOtp, 1000);
