# AGENTS.md

## Project Purpose

- This browser extension limits YouTube Shorts watch time.
- Ordinary YouTube must not be blocked.
- Allowed duration and cooldown duration are changed through the popup.
- Usage state and settings are stored in `chrome.storage.local`.
- Manifest V3 background service workers are not persistent processes.

## Tech Stack

- TypeScript
- WXT
- Chrome Manifest V3
- Vitest
- ESLint flat config
- Prettier
- zod for env validation
- pnpm

## Architecture

`domain/`

- Contains entities and value objects.
- Never imports app, infrastructure, composition, entrypoints, config, or envs.

`app/interfaces/`

- Contains use-case, service, browser, storage, clock, and logger contracts.
- Keep `dto.ts` and `error.ts` beside the contract that owns them.

`app/use-cases/`

- Implements use-case interfaces.
- Orchestrates only.
- Does not use Chrome API.

`app/services/`

- Implements service interfaces.
- Contains reusable application logic.
- Does not use Chrome API.

`infrastructure/`

- Implements app interfaces through `chrome.*` and external APIs.
- Direct `chrome.storage`, `chrome.tabs`, and related APIs are allowed here.

`composition/`

- Wires dependencies in `createAppContainer.ts`.

`entrypoints/`

- WXT entrypoints.
- Only event wiring and use-case calls.
- No business logic.

`envs/`

- The only place that reads `import.meta.env`.

`config/`

- Typed project configuration.
- App and infrastructure import config only with `import { config } from "@/config"`.

## Folder Naming Rules

Inside contextual folders, files use short names:

- `interface.ts`
- `dto.ts`
- `error.ts`
- `service.ts`
- `usecase.ts`
- `repository.ts`
- `mapper.ts`

Shared, domain, and top-level files use full names:

- `AppError.ts`
- `UsageState.ts`
- `WatchPolicy.ts`
- `DurationMs.ts`
- `TimestampMs.ts`
- `ShortsUrl.ts`
- `createAppContainer.ts`
- `handleError.ts`

## Dependency Rules

- `domain` never imports `app`, `infrastructure`, `composition`, `entrypoints`, `config`, or `envs`.
- `app` never imports `infrastructure`.
- `infrastructure` implements `app/interfaces`.
- Entrypoints do not contain business logic.
- `import.meta.env` is allowed only in `src/envs`.
- `chrome.*` is allowed only in `infrastructure` and `entrypoints`.
- App and infrastructure import config only from `@/config`.
- User-editable settings are not env values.

## No Magic Values Policy

This project does not ban all numeric literals.

The rule is:

- Business values must be named.
- Repeated values must be named.
- Unit-sensitive values must go through value objects/helpers.
- Infrastructure identifiers must be constants or config.
- Obvious local literals may remain inline.

Do not create meaningless constants like:

```ts
const ONE = 1;
const TWO = 2;
```

Do create meaningful constants/config values like:

- `initialAllowedDuration`
- `initialCooldownDuration`
- `allowedDuration.min`
- `allowedDuration.max`
- `alarmPeriod`
- `blockedPagePath`
- usage-state storage key
- settings storage key
- block reasons
- event source names

## Config And Env Rules

- `envs/` reads `import.meta.env`.
- `config/` composes typed application config.
- User settings are persisted through `SettingsRepository`.
- Do not put secrets into env because extension bundles are inspectable.
- Do not create `defaults.ts`.
- Do not create `config/env.ts`.
- Use `config/index.ts` as the single public config import.

## Use-case Style

- A use-case has one responsibility.
- A use-case depends on interfaces, not concrete infrastructure.
- A use-case can use app services.
- A use-case catches errors only to wrap them into its own `AppError` when appropriate.
- A use-case must be testable without Chrome API.

## Service Style

- A service implements `app/interfaces/services/.../interface.ts`.
- A service contains reusable pure logic where possible.
- No direct Chrome API.
- No storage access unless it is explicitly an infrastructure service or repository.

## Repository / Infrastructure Style

- Repositories wrap `chrome.storage.local`.
- Persisted data is unknown and must be mapped/validated.
- Corrupted storage data falls back safely.
- Storage keys come from `config.storage`.
- Low-level errors are wrapped into app-level custom errors.

## Error Handling

- All custom errors extend `AppError`.
- Error codes are typed constants.
- Catch variables are `unknown`.
- Infrastructure wraps low-level errors.
- Entrypoints use `handleError`.
- Do not swallow errors silently.

## Popup / UI Style

- Popup is a presentation boundary.
- Popup calls use-cases.
- Popup contains no business rules.
- DOM selectors should be named constants/objects if repeated or non-obvious.
- Settings are changed through `UpdateSettingsUseCase`.
- Status is read through `GetStatusUseCase`.

## Testing Rules

- Business logic must have unit tests.
- Tests should avoid Chrome API unless mocking infrastructure.
- App services and app use-cases are primary test targets.
- Mappers must test corrupted persisted data.
- Every new use-case needs tests.
- Test literals are allowed when they are meaningful test data.

## Required Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm quality
```

## Before Submitting Changes

- Typecheck passes.
- Lint passes.
- Tests pass.
- Build passes.
- No business magic values added.
- No layer dependency violations.
- No raw `chrome.*` in `app` or `domain`.
- No raw `import.meta.env` outside `envs`.
- README updated if behavior changed.
- AGENTS.md updated if project style changed.

## Adding New Code

### Add a new use-case

1. Create `app/interfaces/use-cases/<name>/interface.ts`.
2. Add `dto.ts` and `error.ts` only if needed.
3. Implement `app/use-cases/<name>/usecase.ts`.
4. Wire in `composition/createAppContainer.ts`.
5. Add tests.

### Add a new app service

1. Create `app/interfaces/services/<name>/interface.ts`.
2. Implement `app/services/<name>/service.ts`.
3. Add tests.

### Add a new infrastructure adapter

1. Create interface under `app/interfaces/<boundary>/<name>/`.
2. Implement under `infrastructure/<boundary>/<name>/`.
3. Map unknown external data through `mapper.ts` if needed.
4. Wrap low-level errors.

### Add a new config value

1. Add it to the correct `config/*.config.ts` file.
2. Export through `config/index.ts`.
3. Never import config internals directly unless there is a strong reason.

## Strictness

When in doubt, prefer:

1. stronger typing;
2. smaller permissions;
3. named constants for business values;
4. tested business logic;
5. explicit boundaries;
6. boring readable code over clever code.
