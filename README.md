# YouTube Limiter

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org/)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285f4)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![WXT](https://img.shields.io/badge/Built%20with-WXT-111827)](https://wxt.dev/)
[![React](https://img.shields.io/badge/UI-React%20%2B%20Radix-149eca)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-Vitest-6e9f18)](https://vitest.dev/)

Take back your time from YouTube without cutting yourself off completely.

YouTube Limiter is a lightweight browser extension that gives you separate time budgets
for YouTube Shorts and YouTube overall. Shorts can cool down independently, and the
general YouTube budget can block all supported YouTube pages when the daily scroll turns
into a long session.

## Why Use It

YouTube is useful, but it is easy to lose time there. This extension adds two simple
boundaries:

- Watch Shorts for a configurable number of minutes.
- Hit the limit and Shorts are blocked for a cooldown period.
- Watch regular YouTube with its own configurable limit and cooldown.
- Shorts time also counts toward the general YouTube budget.
- Change all limits and cooldowns directly from the extension popup.
- Keep the cooldown active across Manifest V3 service worker restarts.

Default policy:

- Allowed Shorts time: 10 minutes
- Shorts cooldown after reaching the limit: 60 minutes
- Allowed YouTube time: 60 minutes
- YouTube cooldown after reaching the limit: 60 minutes

## What Gets Blocked

Blocked by the Shorts limit:

- `https://youtube.com/shorts/*`
- `https://www.youtube.com/shorts/*`
- `https://m.youtube.com/shorts/*`

Blocked by the general YouTube limit:

- `https://www.youtube.com/watch?v=...`
- `https://www.youtube.com/feed/subscriptions`
- `https://www.youtube.com/results?search_query=...`

Not supported or blocked in the MVP:

- `https://music.youtube.com/...`

## Features

- Separate configurable Shorts and YouTube budgets.
- Separate cooldown duration for each budget.
- Shorts time counts against both budgets.
- Active YouTube tabs and audible background YouTube playback count toward the budget.
- Polished React popup dashboard with progress bars, status chip, and clear settings.
- Headless Radix primitives where accessibility behavior is useful.
- Custom CSS tokens instead of a heavy styled UI kit.
- Chrome Manifest V3 service worker architecture.
- Local persistence through `chrome.storage.local`.
- Minimal browser permissions.
- Strict TypeScript, ESLint, Prettier, and Vitest coverage.
- Clean layered architecture for maintainability.

## Install For Local Use

The extension is not packaged for a browser store yet. You can load it as an unpacked
extension.

### Requirements

- Node.js `22.12+`
- pnpm `10+`

### Build

```bash
pnpm install
pnpm build
```

### Load In Chrome Or Chromium

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `.output/chrome-mv3`.

### Load In Yandex Browser

1. Open `browser://extensions` or `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked extension".
4. Select `.output/chrome-mv3`.

After changing code, run `pnpm build` again and click "Reload" for the extension.

## Using The Extension

1. Open the extension popup.
2. Set Shorts limit and cooldown.
3. Set YouTube limit and cooldown.
4. Save.

The background worker reads settings from storage on every tick, so popup changes apply
without restarting the browser or extension.

## Development

```bash
pnpm dev
```

WXT starts a development build for Chrome/Chromium and writes generated files under
`.output/`.

## Build A Zip

```bash
pnpm zip
```

The zip file is written under `.output/`.

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm quality
pnpm format:check
```

`pnpm quality` runs typecheck, lint, tests, and build.

## Architecture

The codebase is intentionally boring and layered:

- `domain/`: entities and value objects. No app, infrastructure, config, env, WXT, or Chrome API imports.
- `app/interfaces/`: contracts for use-cases, services, browser adapters, storage, clock, and logger.
- `app/services/`: reusable application logic, mostly pure and Chrome-free.
- `app/use-cases/`: orchestration only. Use-cases depend on interfaces and app services.
- `infrastructure/`: Chrome API implementations and storage repositories.
- `composition/`: dependency wiring.
- `presentation/`: React UI components, view-model mappers, formatting helpers, and CSS tokens.
- `entrypoints/`: WXT background wiring and React mount shells for popup/blocked pages.
- `envs/`: the only place that reads `import.meta.env`.
- `config/`: typed configuration exported only through `@/config`.

Business logic is not placed in entrypoints or React components, and Chrome APIs are not
used in `app/`, `domain/`, or `presentation/`.

## Frontend UI

The extension UI is intentionally small but structured:

- WXT HTML entrypoints only mount React apps.
- React components live under `src/presentation`.
- Components receive callbacks and view-models; they do not call Chrome APIs directly.
- Radix is used selectively for headless accessible primitives, currently progress bars.
- Styling lives in CSS files with shared tokens in `src/presentation/shared/styles.css`.
- DTOs at app boundaries use explicit suffixes such as `InputDto` and `OutputDto`.

## Configuration

Initial policy and validation limits live in:

```text
src/config/application.config.ts
```

User-editable settings are stored through `SettingsRepository` in `chrome.storage.local`.
They are not env variables because they must change at runtime from the popup.

Settings and usage state are scope-based:

- `shorts`
- `youtube`

Older flat v0.1 storage data is migrated safely: old values become the Shorts budget,
and the new YouTube budget starts from initial config.

All duration conversion goes through `DurationMs`. Avoid scattering unit-sensitive
arithmetic like milliseconds-per-minute conversions across the project.

## Env Variables

Env variables are used only for build/runtime feature flags:

- `WXT_ENABLE_DEBUG_LOGS`
- `WXT_ENABLE_STRICT_BLOCKING`

Do not put secrets in env values. Browser extension bundles are inspectable by users.

## Privacy

The extension stores usage state and settings locally through `chrome.storage.local`.
It does not need an external backend to enforce the limit.

## Known Limitations

- A user can disable or uninstall the extension.
- Other browsers, devices, and browser profiles are not controlled by this extension.
- The MVP does not use `declarativeNetRequest` strict blocking mode.
- `music.youtube.com` is not controlled by this MVP.
- Muted background playback may require a future content-script based detector.
- Alarm timing can be delayed by Chrome, especially after device sleep.

## Contributing

Before submitting changes:

```bash
pnpm quality
pnpm format:check
```

Keep the project strict, small, and explicit:

- Prefer smaller browser permissions.
- Keep business logic out of entrypoints.
- Keep Chrome APIs out of `app/` and `domain/`.
- Name business values instead of adding hidden magic numbers.
- Add tests for new use-cases, services, and storage mappers.
