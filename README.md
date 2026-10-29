# Due

A bright, minimal, local-first credit-card payment reminder. React, TypeScript, Vite, Tailwind, Lucide, Dexie and vite-plugin-pwa. No ChatGPT account or subscription is required to open the GitHub Pages app.

## Run

```sh
npm ci
npm run dev
npm test
npm run build
```

Node 24 is used in CI. Development and production use `/due/`; open the path printed by Vite followed by `due/` when needed. The production output is `dist/`.

## GitHub Pages deployment

The public repository contains application code and synthetic tests only. It contains no personal bill schedule, saved cards, credentials or Git history copied from another host. GitHub Pages serves the app at the repository path `/due/`.

Settings → Pages → Source must be **GitHub Actions**. The workflow tests, builds and deploys on pushes to main, with an ephemeral GitHub Actions token. No personal token is needed by deployment. Vite's base, manifest start URL/scope, service-worker scope and icons use `/due/`. Changing the repository name requires updating this path in `vite.config.ts`.

## Restore data when moving from another host

Browser storage and tokens do not transfer between different website addresses. The app deliberately starts empty on a new origin. No sample cards or handwritten schedules are seeded into the public app.

1. On the old site, save/sync the latest data and export a JSON backup from Settings & backup.
2. Open the new GitHub Pages site. Settings & backup → GitHub sync.
3. Enter the same private backup repository owner, name, branch (`main`), path (`data/bills.json`) and fine-grained token used on that device. Never enter these into GitHub Actions or commit them.
4. If the backup was encrypted, select encryption and enter the same passphrase. Leave encryption unchanged from the original setup.
5. Save & sync now. A new empty local database pulls and merges the remote records. Confirm the cards and dates before editing anything.
6. Repeat on every phone/laptop. Alternatively import the exported JSON backup. Keep the old site until data is verified on the new origin.
7. Add the new address to your phone's home screen. The old installed app continues to point at its old address.

A separate **private** repository holds synced JSON. Never make that backup repository public. The public app repository and private backup repository have different purposes. The GitHub token needs Contents read/write only for the private backup repository; prefer short-lived, fine-grained credentials. The token is origin-local in localStorage, accessible to scripts on that origin; XSS/device compromise can expose it. Encryption passphrases stay in session memory. Do not share tokens in chat.

## Reminder workflow

Enter bank, card name and the next payment due date. Extra details and payment amounts are optional. Check off the bill when fully paid. Bills shows each card's latest supplied date across months; older records remain in monthly History. Future reminders are estimates, not guaranteed 30-day intervals. Update the actual date whenever the bank changes it. Unknown amounts are null rather than zero. Partial payment notes never mark a bill paid by themselves.

Card and bill IDs, per-record timestamps/operation IDs, tombstones, local IndexedDB and GitHub SHA conflict handling are preserved. The database name/schema is compatible with JSON backups from the original app. Statements are not required in the interface; existing statement metadata remains in stored/exported records. No account data is uploaded to Pages.

## Sync and encryption

IndexedDB is primary. Optional GitHub Contents API sync is debounced and retries SHA conflicts with bounded retries. Record IDs merge deterministically; simultaneous edits of the same record require review. Export both devices before explicitly selecting Merge & sync, which uses latest record timestamps and operation-ID tie breaking. Keep device clocks correct. Manual Sync now is available. Offline changes persist locally and retry when online.

Optional cloud encryption uses AES-256-GCM with random salt/IV and PBKDF2-SHA256 (250,000 iterations). All devices must use the same encryption choice and passphrase. Decryption occurs before merge. IndexedDB and exported JSON are plaintext. Losing a passphrase makes that encrypted backup unrecoverable. Never toggle encryption mode while another device has unsynced changes.

## PWA and reminders

After the first successful online load, cached assets and IndexedDB support offline operation. Upgrades prompt to reload without deleting data. iPhone Safari: Share → Add to Home Screen. Android Chrome: menu → Install app/Add to Home Screen. Existing installed copies from another origin must be replaced manually after verifying the migration.

Calendar export provides due-date events with two-day display alarms; the calendar app controls delivery. This static PWA does not send reliable scheduled notifications while closed. Reliable push would require a separately opted-in scheduler/server. Automatic bank fetching remains disabled; no bank logins, OTPs, CVVs or full card numbers are requested.

## Validation

Tests cover billing cycles, date clamps/leap years, latest-date selection, paid-history preservation, record merges, IndexedDB persistence, import validation, encrypted round trips, and safe sync retries. Pages path verification checks the built HTML, manifest and service-worker asset URLs. Do not rely on the public site as an authentication gate: its app shell is public, while each visitor's local records and private backup remain separate.
