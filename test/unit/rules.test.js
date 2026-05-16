import test from 'node:test';
import assert from 'node:assert/strict';
import { hostnameMatches, detectOtpInput, detectOtpInputs } from '../../src/lib/rules.js';

test('hostnameMatches supports exact and subdomain matching', () => {
  assert.equal(hostnameMatches('cas.cuni.cz', ['cas.cuni.cz']), true);
  assert.equal(hostnameMatches('new.cas.cuni.cz', ['cas.cuni.cz']), true);
  assert.equal(hostnameMatches('example.com', ['cas.cuni.cz']), false);
});

test('detectOtpInput uses configured selector first', () => {
  global.document = {
    querySelector: (s) => (s === '#custom-otp' ? { id: 'custom-otp' } : null),
    querySelectorAll: () => []
  };

  const el = detectOtpInput(['#custom-otp']);
  assert.deepEqual(el, { id: 'custom-otp' });
});

test('detectOtpInputs returns heuristic results when configured selectors miss', () => {
  const otpA = { id: 'otp-a', maxLength: 1 };
  const otpB = { id: 'otp-b', maxLength: 1 };

  global.document = {
    querySelector: () => null,
    querySelectorAll: (s) => {
      if (s.includes("one-time-code")) return [otpA, otpB];
      return [];
    }
  };

  const found = detectOtpInputs(['#missing']);
  assert.equal(found.length >= 2, true);
});

test('detectOtpInput can find token fields even when type=password', () => {
  const tokenInput = { id: 'token', type: 'password' };
  global.document = {
    querySelector: (s) => (s === "input[type='password'][name*='token' i]" ? tokenInput : null),
    querySelectorAll: () => []
  };

  const found = detectOtpInput(['#missing']);
  assert.equal(found, tokenInput);
});
