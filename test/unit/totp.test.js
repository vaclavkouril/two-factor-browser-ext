import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTotp } from '../../src/lib/totp.js';

test('generateTotp matches RFC6238 SHA1 test vector (T=59)', async () => {
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  const now = 59 * 1000;
  const { code, remainingSeconds } = await generateTotp(secret, 30, 8, now);
  assert.equal(code, '94287082');
  assert.equal(remainingSeconds, 1);
});

test('generateTotp returns 6-digit code by default', async () => {
  const secret = 'JBSWY3DPEHPK3PXP';
  const { code } = await generateTotp(secret, 30, 6, 1700000000000);
  assert.match(code, /^\d{6}$/);
});

test('generateTotp throws on invalid base32', async () => {
  await assert.rejects(() => generateTotp('INVALID*!'), /Invalid Base32 character/);
});
