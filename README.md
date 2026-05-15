# CUNI CAS 2FA Firefox Extension

Firefox extension for `cas.cuni.cz` and compatible CUNI login pages that can:

- Generate TOTP codes from a shared secret (like Google Authenticator)
- Auto-fill OTP fields on matching login pages
- Optionally auto-detect likely 2FA field and continue to next page
- Stay extensible through configurable domain and selector rules

## Firefox Mobile support (Android)

- Uses only core APIs supported by Firefox mobile add-ons (`storage`, content scripts, background messaging).
- Supports both single OTP input and multi-input digit UIs common on mobile pages.
- Retries detection for dynamically rendered forms (SPA/mobile login flows).
- If popup UI is unavailable in your mobile add-ons UI, open the extension options page to configure secret and behavior.

## Why this architecture

The project is split into modules so future automation (username/password fill, captcha helpers, multi-step workflows) can be added without rewriting core logic.

## Project structure

- `manifest.json` – extension definition and permissions
- `src/lib/` – reusable core modules
  - `storage.js` – configuration persistence
  - `totp.js` – RFC6238-like TOTP generation
  - `rules.js` – host and selector matching helpers
- `src/background/service-worker.js` – secure(ish) runtime boundary for code generation/config reads
- `src/content/content-script.js` – login-page automation runner
- `src/options/` – setup UI for storing secret & rules
- `src/popup/` – quick-view OTP and setup launcher
- `docs/` – technical design and extension roadmap

## Setup (Developer)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `manifest.json`
4. Open extension options and configure your TOTP secret + domains.

## Testing

- Run unit and integration tests:

```bash
npm test
```

- Test coverage includes:
  - TOTP generation correctness (including RFC6238 vector)
  - Hostname and OTP selector heuristics
  - Background message handling (`GET_TOTP`, `GET_CONFIG`)

### Continuous Integration (GitHub)

- Automated tests run on every pull request via GitHub Actions.
- Workflow file: `.github/workflows/ci.yml`.
- The CI pipeline checks out the repository, installs dependencies, and runs `npm test`.

## User setup

1. Open extension options (`Setup` from popup).
2. Paste your CAS TOTP Base32 secret (same secret used by authenticator app).
3. Keep domain list containing `cas.cuni.cz` and `new.cas.cuni.cz`.
4. Enable "Auto-detect 2FA field and continue to next page" if you want automatic step-forward.
5. Save.

### Where is secret stored?

The secret is saved in `browser.storage.local` under your Firefox profile for this extension. This is local to your browser profile and not sent anywhere by this extension.

## Security notes

- This project does **not** currently encrypt the secret with a user passphrase.
- Anyone with local profile access and sufficient privileges may extract extension storage.
- For stronger security, add optional passphrase-based encryption in `src/lib/storage.js` and request user passphrase per session.
