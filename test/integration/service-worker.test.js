import test from 'node:test';
import assert from 'node:assert/strict';

global.browser = { runtime: { onMessage: { addListener: () => {} } } };
const { handleRuntimeMessage } = await import('../../src/background/service-worker.js');

test('GET_TOTP returns generated code when configured', async () => {
  const resp = await handleRuntimeMessage(
    { type: 'GET_TOTP' },
    {
      getConfig: async () => ({ totp: { secretBase32: 'ABC' }, automation: {}, domains: [] }),
      generateTotp: async () => ({ code: '123456', remainingSeconds: 10 })
    }
  );

  assert.equal(resp.ok, true);
  assert.equal(resp.code, '123456');
});

test('GET_TOTP returns error when secret missing', async () => {
  const resp = await handleRuntimeMessage(
    { type: 'GET_TOTP' },
    { getConfig: async () => ({ totp: { secretBase32: '' } }), generateTotp: async () => ({}) }
  );

  assert.equal(resp.ok, false);
  assert.match(resp.error, /not configured/i);
});

test('GET_CONFIG returns config', async () => {
  const cfg = { domains: ['cas.cuni.cz'] };
  const resp = await handleRuntimeMessage(
    { type: 'GET_CONFIG' },
    { getConfig: async () => cfg, generateTotp: async () => ({}) }
  );
  assert.deepEqual(resp, { ok: true, config: cfg });
});
