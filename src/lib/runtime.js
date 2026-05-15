import { getConfig } from "./storage.js";
import { generateTotp } from "./totp.js";

export async function getTotpPayload(deps = { getConfig, generateTotp }) {
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
