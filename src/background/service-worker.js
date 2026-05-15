import { getConfig } from "../lib/storage.js";
import { generateTotp } from "../lib/totp.js";

export async function handleRuntimeMessage(message, deps = { getConfig, generateTotp }) {
  if (message?.type === "GET_TOTP") {
    const config = await deps.getConfig();
    if (!config?.totp?.secretBase32) {
      return { ok: false, error: "TOTP secret not configured." };
    }

    try {
      const result = await deps.generateTotp(config.totp.secretBase32);
      return { ok: true, ...result, config };
    } catch (error) {
      return { ok: false, error: error.message || "Failed to generate TOTP." };
    }
  }

  if (message?.type === "GET_CONFIG") {
    const config = await deps.getConfig();
    return { ok: true, config };
  }

  return undefined;
}

browser.runtime.onMessage.addListener((message) => handleRuntimeMessage(message));
