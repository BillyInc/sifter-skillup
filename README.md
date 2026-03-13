# Sifter Skill_Up

Duolingo-style learning app for crypto literacy and quant finance.
Deploys as: React Native mobile app + Telegram Mini App + Base App + Web Dashboard.

## Structure

```
sifter-final/
├── src/                        # React Native / Expo frontend
│   ├── components/simulators/  # SimulatorCard, QuantSimulatorCard, SimulatorFactory
│   ├── data/                   # levels.ts, quantLevels.ts, pythonLevels.ts, islands.ts
│   ├── hooks/                  # useAuth, useProgress, useLessonEngine
│   ├── lib/                    # api.ts (API client)
│   ├── screens/                # All screens including QuantMapScreen
│   ├── theme/                  # Colors, spacing, typography
│   └── vr/                     # VRBridge (future VR layer)
├── backend/                    # FastAPI Python backend
│   ├── main.py                 # All API routes
│   ├── auth.py                 # Telegram, Base wallet, JWT auth
│   ├── models.py               # Pydantic models
│   ├── database.py             # Supabase client
│   ├── config.py               # Settings from env
│   ├── celery_worker.py        # Background jobs
│   ├── requirements.txt
│   └── .env.example            # Copy to .env and fill in
├── supabase-schema.sql         # Run in Supabase SQL editor
├── Dockerfile
└── docker-compose.yml

## Setup

### 1. Supabase
- Create project at supabase.com
- Run supabase-schema.sql in the SQL editor
- Copy project URL, anon key, service role key

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend
```bash
npm install
# Create .env file:
echo "EXPO_PUBLIC_API_URL=http://localhost:8000" > .env
npx expo start
```

### 4. Docker (production)
```bash
cp backend/.env.example backend/.env
# Fill in .env
docker-compose up -d
```

## Auth Methods
- **Telegram**: initData HMAC verification → JWT
- **Base wallet**: EIP-191 signature → JWT  
- **Guest**: auto-created account → JWT

## Track Prerequisites

| Track | Prerequisite | Starts From |
|---|---|---|
| Quant Trader | None | Lab 0 (Numbers Room — stats foundation) |
| Quant Researcher | None | Lab 0 (same math foundation) |
| Quant Developer | Python chapters 1–5 (levels 2001–2050) | Python foundations first |

Quant Trader sequence: Lab 0–7 (math) → Python ch. 1–5 (foundations) → Lab 8 (applied quant Python)
Quant Developer sequence: Python ch. 1–5 → quant math → advanced systems

Python chapter completion tracked in `users.python_chapters_completed`.
