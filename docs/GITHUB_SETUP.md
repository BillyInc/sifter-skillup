# GitHub Integration Setup

## What this does for users

When a user connects GitHub inside Sifter Skill_Up they get:

1. **One-tap portfolio push** — their completed quant implementations (Sharpe, Kelly, Black-Scholes, Markowitz, Fama-French, Monte Carlo, backtester, momentum, pairs trading) are pushed as clean Python files to a public repo.
2. **Auto-generated README** — professional documentation explaining what each file does.
3. **Repo list** — they can see all their GitHub repos from inside the app.
4. **+500 XP achievement** — first portfolio push awards points.
5. **Learn module** — 6 plain-English lessons on what Git, repos, commits, pushes, and READMEs are (no assumed knowledge).

---

## Developer setup (one-time, 10 minutes)

### Step 1 — Create the GitHub OAuth App

1. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `Sifter Skill_Up`
   - **Homepage URL:** `https://yourdomain.com`
   - **Authorization callback URL:** `https://your-api-domain.com/api/github/callback`
3. Click **Register application**
4. On the next page, copy the **Client ID**
5. Click **Generate a new client secret** and copy the **Client Secret**

### Step 2 — Add to your backend .env

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=https://your-api-domain.com/api/github/callback
```

### Step 3 — Deep link (mobile only)

For the OAuth flow to return users back into the app after GitHub authorises, configure a deep link scheme in `app.json`:

```json
{
  "expo": {
    "scheme": "sifterskillup",
    "...": "..."
  }
}
```

Then update `GITHUB_REDIRECT_URI` to use the deep link:
```
sifterskillup://github/callback
```

And add a route handler in `App.tsx`:
```typescript
import { Linking } from 'react-native';

useEffect(() => {
  const sub = Linking.addEventListener('url', ({ url }) => {
    if (url.includes('github/callback')) {
      // Refresh GitHub status
      API.githubStatus().then(/* update state */);
    }
  });
  return () => sub.remove();
}, []);
```

For web/Telegram Mini App deployments, the standard HTTP redirect URI works directly.

### Step 4 — Database migration

Run this against your Supabase database (already included in `supabase-schema.sql`):

```sql
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_token    TEXT;
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE sifter_dev.users ADD COLUMN IF NOT EXISTS github_avatar   TEXT;
```

---

## API routes added

| Method | Route | What it does |
|--------|-------|--------------|
| `GET` | `/api/github/auth-url` | Returns the GitHub OAuth URL for the user to visit |
| `GET` | `/api/github/callback` | GitHub redirects here after user authorises; exchanges code for token |
| `GET` | `/api/github/status` | Returns `{ connected, username, avatar }` |
| `POST` | `/api/github/disconnect` | Removes GitHub token from user record |
| `POST` | `/api/github/push-portfolio` | Creates/updates repo and pushes portfolio files |
| `POST` | `/api/github/create-repo` | Creates a blank repo (used in learn module) |
| `GET` | `/api/github/repos` | Lists user's repos (sorted by last updated) |

---

## User flow

```
GitHub tab
    │
    ├── NOT CONNECTED
    │       │
    │       ├── "What is GitHub?" card — plain explanation
    │       ├── [Connect GitHub Account] → opens browser → GitHub OAuth
    │       │       └── GitHub authorises → redirects to callback → token saved
    │       │               └── App polls status → screen updates to CONNECTED
    │       │
    │       ├── [Learn Git & GitHub] → 6-lesson module
    │       │       Lesson 1: What is GitHub?
    │       │       Lesson 2: What is a Repository?
    │       │       Lesson 3: What is a Commit?
    │       │       Lesson 4: What is a Push?
    │       │       Lesson 5: What is a README?
    │       │       Lesson 6: Building a quant portfolio
    │       │       (each lesson ends with a quiz question)
    │       │
    │       └── [Create free GitHub account →] → opens github.com/signup
    │
    └── CONNECTED
            │
            ├── Connected badge (username + link to profile)
            ├── [Push to GitHub] → creates repo → pushes 7 Python files → shows live URL
            ├── "What gets pushed" — list of files with descriptions
            ├── Repo list — all user repos with star counts
            └── [Learn Git & GitHub] — available even when connected

Profile tab
    └── GitHub card (compact)
            ├── Connected: shows username + "View →" link
            └── Not connected: hint pointing to GitHub tab
```

---

## Files pushed to GitHub

Every portfolio push creates or updates these files:

| File | Contents |
|------|----------|
| `README.md` | Project overview, skills table, requirements |
| `sharpe_and_risk.py` | `sharpe_ratio`, `max_drawdown`, `calmar_ratio`, `historical_var`, `cvar` |
| `kelly_and_sizing.py` | `kelly_continuous`, `kelly_discrete` |
| `markowitz.py` | `minimum_variance_portfolio` via cvxpy |
| `black_scholes.py` | `black_scholes` pricer with all five Greeks |
| `monte_carlo.py` | `simulate_gbm`, `simulation_var` |
| `fama_french.py` | `fama_french_attribution` with Newey-West HAC |

Each file has a docstring, correct implementation, and a runnable `if __name__ == "__main__"` block.

---

## Security notes

- GitHub tokens are stored encrypted at rest in Supabase (Supabase encrypts all column data).
- Tokens are never returned to the frontend — only username and avatar.
- The OAuth state parameter prevents CSRF attacks.
- In production, replace the in-memory `GITHUB_STATES` dict with Redis (TTL 10 minutes).
- Scope requested: `repo,read:user` — minimum needed to create repos and push files.
