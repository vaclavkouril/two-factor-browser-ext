import { getConfig } from "../lib/storage.js";
import { generateTotp } from "../lib/totp.js";

browser.runtime.onMessage.addListener(async (message) => {
  if (message?.type === "GET_TOTP") {
    const config = await getConfig();
    if (!config?.totp?.secretBase32) {
      return { ok: false, error: "TOTP secret not configured." };
    }

    try {
      const result = await generateTotp(config.totp.secretBase32);
      return { ok: true, ...result, config };
    } catch (error) {
      return { ok: false, error: error.message || "Failed to generate TOTP." };
    }
  }

  if (message?.type === "GET_CONFIG") {
    const config = await getConfig();
    return { ok: true, config };
  }

  return undefined;
});
