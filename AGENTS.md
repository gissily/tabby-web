# AGENTS.md

## Project

**tabby-web** — personal fork of upstream `Eugeny/tabby-web` (self-hosted Tabby terminal web app + config sync service).

- **Why this fork exists:** upstream dependencies became unusable here — backend auth with OAuth providers failing, frontend outdated. This fork upgraded the stack to **Node 24 + Angular 22** (Bootstrap 5.3).
- **Scope:** personal use only; the upgraded version may not cover all functionality present in the original upstream.

## Structure

- `frontend/` — Angular 22 standalone SPA (signals, `@if`/`@for`, `ChangeDetectionStrategy.Eager`):
  - entry: `frontend/src/main.ts`; theme: `frontend/theme/index.scss`
  - routes: `''` → `MainComponent`, `'login'` → `LoginComponent`
  - standalone pages: `terminal`, `demo` (pre-existing gap §2.3: not re-added to build)
  - API: `frontend/src/api.ts`; shared services: `frontend/src/common/`; components: `frontend/src/app/components/`; connector: `frontend/src/app/services/appConnector.service.ts`
- `backend/` — Django 4.2 + DRF + social-auth (OAuth) + websockets gateway; entry `backend/tabby/wsgi.py`.

## Commands

- Frontend (`frontend/`): `yarn install`, `yarn build`, `yarn lint` (`eslint src`), `yarn start` (`ng serve`). Requires **Node >= 24.15.0**.
- Backend (`backend/`): `poetry install`; `manage.py migrate`; `./manage.sh add_version <version>`; gunicorn via `backend/gunicorn.conf.py`.
- Full stack: `docker compose up -d` → backend `:9090`, frontend `tabby-current` (ghcr.io/gissily/tabby-web) `:8080`, db (mariadb). Prebuilt: `docker-compose -f docker-compose.prebuilt.yml up -d` → ghcr image `:9090`.
- Deploy build: `docker compose build tabby` (frontend stage `node:24-alpine`; backend layers cached). **Stop compose before build; restart after.**

## Gotchas

- Bootstrap **5.0 → 5.3** migrated `$text-muted` → `var(--bs-secondary-color)`: theme override added in `frontend/theme/index.scss` (`:root { --bs-secondary-color: #6c757d; }`).
- Login: `LoginComponent` uses `ready` signal + `@if`/`@for`/`@else`; muted-text override in `login.component.scss`.
- OAuth env vars (`SOCIAL_AUTH_*`) are required per provider; only configured providers appear on login.
- DB via `DATABASE_URL`; app distros via `APP_DIST_STORAGE`.

## Architecture

- **Serving model:** Django backend serves the built Angular SPA (whitenoise + `collectstatic`, `STATICFILES_DIRS` from frontend build) with SPA fallbacks via `IndexView` (`""`, `login`, `app`, `about`, `about/features`, `terminal`, `demo`); static under `/static/`; API under `/api/1/` (DRF router in `backend/tabby/app/api/urls.py`).
- **Frontend ↔ backend:** SPA calls same-origin API via `CommonService.backendURL` (meta tag `x-tabby-web-backend-url` / SSR inject) + `UniversalInterceptor` (prefix `/api/1/...`, `withCredentials: true`).
- **Auth:** `LoginService.user` + `ready$`; provider list `GET /api/1/auth/providers`; OAuth via social-auth (`/api/1/auth/social/...`).
- **App state flow:** `MainComponent.ngAfterViewInit` → waits login `ready$` → `combineLatest(activeConfig$, activeVersion$)` → `reloadApp` → `appConnector.setState(config, version)` → iframe `/terminal` → PATCH config `last_used_with_version`.
- **Connection:** `AppConnectorService.connect` → user custom gateway or `POST /api/1/gateways/choose` → WebSocket → protocol messages (`hello`, `ready`, `connected`, `error`, `connect`).

## Testing

- No automated test suite configured yet.
- QA so far: manual browser + HTTP/API checks against the running compose stack.
- Playwright E2E introduced (`@playwright/test`): `yarn test:e2e` runs smoke tests (login page render + muted color, via headless Chrome against the running compose stack at `:9090`). Not part of Docker build — run host-side against the compose stack.