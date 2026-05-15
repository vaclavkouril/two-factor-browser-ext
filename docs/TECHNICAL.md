# Technical Documentation

## Core flow

1. Content script loads on matching hosts.
2. It asks background worker for TOTP (`GET_TOTP`).
3. Background reads config from storage and generates current code.
4. Content script locates OTP input via configurable selectors.
5. It auto-fills and can auto-advance to next page.

## 2FA field auto-detection and next-page behavior

- First tries user-provided OTP selectors.
- If not found, uses heuristic selectors (`name/id/placeholder/aria-label`, `one-time-code`, numeric input mode).
- After filling, attempts progression by:
  1. configured submit selectors,
  2. form `requestSubmit()` / `submit()`,
  3. Enter key dispatch fallback.

## Firefox mobile compatibility notes

- Removed non-essential permissions to maximize compatibility with Firefox Android add-on runtime.
- Content automation supports:
  - single OTP input fields,
  - split-digit OTP fields (`maxlength=1` patterns),
  - delayed rendering via retry loop (up to 10 attempts).
- Configuration remains in `browser.storage.local`, synced to the browser profile on-device.

## Extensibility strategy

### 1) Config-driven automation
- Domain list is user editable.
- Selector lists are user editable.
- This avoids hardcoding fragile page structure assumptions.

### 2) Modular code boundaries
- `lib/totp.js`: future place for HOTP, custom period/digits/algorithms.
- `lib/rules.js`: future for route-specific rules, condition predicates.
- `content-script.js`: orchestration only.
- `service-worker.js`: central message API; can grow with new commands.

### 3) Planned automation plugins
Add a rule type model:
- `match`: domain/path/form stage
- `actions`: fill field, click, wait, assert
- `data source`: static config, generated OTP, future secure vault alias

Potential storage shape:

```json
{
  "automations": [
    {
      "id": "cuni-cas-otp",
      "match": { "hostname": "cas.cuni.cz", "pathContains": "/login" },
      "actions": [
        { "type": "fillOtp", "selector": "input[name='otp']" },
        { "type": "submit", "selector": "button[type='submit']", "enabled": false }
      ]
    }
  ]
}
```

## Setup screen requirements implemented

- TOTP secret input (Base32)
- Domain allowlist
- Auto-fill/autosubmit toggles
- Selector editing for OTP and submit controls

## Firefox profile storage details

Uses `browser.storage.local`. Data persists in the current Firefox profile and is scoped to the extension ID/runtime.

## Recommended next improvements

1. Add passphrase-protected secret encryption using WebCrypto AES-GCM.
2. Add per-site automation profiles with import/export.
3. Add safe preview mode (highlight fields before filling).
4. Add optional manual trigger shortcut for pages where autofill should be suppressed.
