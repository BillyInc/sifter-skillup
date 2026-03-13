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

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload    # dev server on :8000
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
- Auth state managed via `src/hooks/useAuth` (React Context), token stored in AsyncStorage
- API client in `src/lib/api.ts` — all requests go through FastAPI backend, uses `EXPO_PUBLIC_API_URL` env var
- Supabase JS client in `src/lib/supabase.ts` (direct reads only; writes go through backend)
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
- `sifter-final/` and `sifter-v4/` are older copies of the project; the active code is at the repo root
- Frontend env: create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8000`
- Backend env: copy `backend/.env.example` to `backend/.env` and fill in Supabase credentials, JWT secret, etc.
