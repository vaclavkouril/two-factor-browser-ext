import test from "node:test";
import assert from "node:assert/strict";
import { getTotpPayload } from "../../src/lib/runtime.js";

test("getTotpPayload returns generated code when configured", async () => {
  const getConfig = async () => ({ totp: { secretBase32: "JBSWY3DPEHPK3PXP" } });
  const generateTotp = async () => ({ code: "123456", remainingSeconds: 25 });

  const response = await getTotpPayload({ getConfig, generateTotp });

  assert.equal(response.ok, true);
  assert.equal(response.code, "123456");
  assert.equal(response.remainingSeconds, 25);
});

test("getTotpPayload returns error when secret missing", async () => {
  const getConfig = async () => ({ totp: { secretBase32: "" } });
  const generateTotp = async () => {
    throw new Error("should not be called");
  };

  const response = await getTotpPayload({ getConfig, generateTotp });

  assert.equal(response.ok, false);
  assert.match(response.error, /not configured/i);
});
