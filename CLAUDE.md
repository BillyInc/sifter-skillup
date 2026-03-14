# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sifter Skill_Up is a Duolingo-style learning app for crypto literacy and quant finance. It has two main parts: a React Native/Expo mobile frontend and a FastAPI Python backend, backed by Supabase (Postgres) with Celery/Redis for background jobs.

## Commands

### Frontend (React Native / Expo)
```bash
npm install              # install dependencies
npx expo start           # dev server (Expo Go or dev client)
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
eas build --platform android  # EAS cloud build
eas build --platform ios      # EAS cloud build
```

### Lint / Format / Type-Check
```bash
npx tsc --noEmit                # TypeScript type check (no output)
npx expo lint                   # ESLint via Expo
npx prettier --check "src/**/*.{ts,tsx}"  # Check formatting
npx prettier --write "src/**/*.{ts,tsx}"  # Auto-format
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload    # dev server on :8000
```

### Backend Lint / Format
```bash
cd backend
ruff check .                 # Python linting
ruff format .                # Python formatting
```

### Build
```bash
npx expo export              # Production JS bundle
eas build --platform android # EAS cloud build (Android)
eas build --platform ios     # EAS cloud build (iOS)
docker-compose build         # Build backend Docker image
```

### Docker (full stack)
```bash
docker-compose up -d   # starts api, celery worker, celery beat, redis
```

## Architecture

### Frontend (`App.tsx`, `src/`)
- **Expo SDK 51**, React Native 0.74, TypeScript strict mode
- Path alias: `@/*` maps to `src/*`
- Navigation: `@react-navigation/bottom-tabs` with 5 tabs — Map (home), Skills, Portfolio, Profile, GitHub
- Auth state managed via `src/hooks/useAuth` (React Context), token stored in SecureStore (migrated from AsyncStorage)
- API client in `src/lib/api.ts` — all requests go through FastAPI backend, uses `EXPO_PUBLIC_API_URL` env var
- Reanimated plugin must be last in `babel.config.js` plugins array
- Learning content defined as data files: `src/data/levels.ts`, `quantLevels.ts`, `pythonLevels.ts`, `islands.ts`

### Backend (`backend/`)
- **FastAPI** with Pydantic v2 models (`models.py`)
- Auth (`auth.py`): Telegram initData HMAC, Base wallet EIP-191 signatures, guest auto-create — all issue JWTs
- Database (`database.py`): Supabase client, schema `sifter_dev`
- Config (`config.py`): pydantic-settings, reads from `.env`
- Background jobs: Celery + Redis (`celery_worker.py`)
- Portfolio routes split into `portfolio_routes.py`

### Database (Supabase)
- Schema lives in `supabase-schema.sql` (+ `portfolio-schema.sql` for portfolio tables)
- All tables under the `sifter_dev` schema
- Key tables: `users`, `game_states`, `level_scores`, `transactions`
- User progress tracked via `completed_levels`, `perfect_levels`, `python_chapters_completed` arrays on the users table

### Learning Tracks
Three quant tracks with prerequisite chains:
- **Quant Trader**: Lab 0-7 (math) → Python ch. 1-5 → Lab 8 (applied)
- **Quant Researcher**: Lab 0 (math foundation), no prereqs
- **Quant Developer**: requires Python ch. 1-5 first

## Notable Patterns
- Frontend env: create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8000`
- Backend env: copy `backend/.env.example` to `backend/.env` and fill in Supabase credentials, JWT secret, etc.

## Skills to Load

Load these skills at the start of relevant work sessions:

### Frontend (React Native / Expo)
- `/react-native-expo` — Breaking changes, New Architecture, SDK 52+ migration
- `/react-native-expert` — Navigation, platform-specific code, FlatList optimization
- `/react-native-architecture` — Project structure, auth flows, offline-first patterns
- `/react-native-best-practices` — FPS, re-renders, bundle size, TTI optimization
- `/vercel-react-native-skills` — List performance, animations, UI patterns, state management

### Data Fetching
- `/tanstack-query-setup` — Query/mutation setup, optimistic updates, infinite queries
- `/tanstack-query-best-practices` — Query keys, caching, prefetching, SSR integration

### Backend (Python / FastAPI)
- `/python-patterns` — Framework selection, async vs sync, project structure, Pydantic
- `/python-performance-optimization` — Profiling, memory optimization, async I/O, caching

### Security
- `/senior-security` — Application security, penetration testing, secure coding practices

### QA & Testing
- `/senior-qa` — Quality assurance, test automation, testing strategy

### Git & Workflow
- `/git-workflow` — Conventional commits, branch naming, PR guidelines
