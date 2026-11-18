# LifePilot AI

> Your Coding Journey, Guided by AI.

LifePilot AI is a full-stack MERN application that acts as a personal coding mentor for beginners. It creates a personalized learning roadmap, explains concepts in beginner-friendly English or Hinglish, debugs submitted code, provides practice challenges, tracks real progress and recommends projects worth building.

The app uses **real Gemini API responses** and **real MongoDB data** for roadmaps, chats, scores and progress. There are no hard-coded dashboard statistics or fake AI answers.

---

## Features

- **Authentication** — registration, login, JWT sessions, hashed passwords and protected routes.
- **Onboarding** — collects coding level, preferred language, daily study time and learning goal.
- **AI roadmap generator** — Gemini creates phases, topics, explanations, time estimates, exercises and mini-projects. Progress is saved per topic.
- **AI coding mentor** — multi-turn chat with saved history, beginner-friendly explanations, line-by-line help, hints before solutions and Hinglish support.
- **AI code debugger** — explains what is wrong, why it happened, how to fix it, shows corrected code and teaches prevention.
- **Practice zone** — 17 curated beginner/intermediate/advanced challenges with filters, hints, optional local attempts and explanations. Solutions stay hidden until a challenge is marked solved.
- **Progress dashboard** — real roadmap completion, pending topics, scores, streaks, daily goal, weekly activity chart and recent activity.
- **Project recommendations** — AI project ideas matched to language, level and completed roadmap topics, with features and a step-by-step plan.
- **Semi-autonomous agent** — tool calling for progress checks, next-task suggestions, project ideas, roadmap proposals and topic updates. Write actions require explicit approval.
- **Premium responsive UI** — React, Tailwind CSS, Lucide icons, purple/blue gradients, responsive sidebar and mobile layout.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Lucide React |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| AI | Google Gemini via `@google/genai` |
| Auth | JWT, bcryptjs |
| Validation | Zod |
| Tests | Node test runner, Supertest, mongodb-memory-server |

---

## Project structure

```text
LifePilot-AI/
├── client/                   # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI, layout and guards
│   │   ├── context/          # Auth and toast providers
│   │   ├── lib/              # API client, navigation and helpers
│   │   ├── pages/            # Landing, auth, dashboard and feature pages
│   │   ├── App.jsx
│   │   ├── index.css         # Design system and Tailwind layers
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                   # Express REST API
│   ├── config/               # Environment, database and Gemini setup
│   ├── controllers/          # Request handlers
│   ├── data/                 # Curated practice challenge content
│   ├── middleware/           # Auth, validation, errors, rate limits
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic, prompts and agent tools
│   ├── tests/                # API and utility tests
│   ├── utils/                # Shared helpers and Zod schemas
│   ├── .env.example
│   ├── app.js                # Express app factory
│   └── server.js             # Database connection and server entry
├── PLAN.md
├── package.json              # Root scripts for the whole workspace
└── README.md
```

---

## Getting started

### Prerequisites

- **Node.js 20 or newer**
- **MongoDB 7+** running locally, or a free MongoDB Atlas cluster
- **Google Gemini API key** — optional for browsing, required for all AI features. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 1. Install dependencies

From the project root:

```bash
npm run setup
```

This installs the root, server and client dependencies.

### 2. Configure the server

Copy the example environment file:

```bash
# macOS / Linux
cp server/.env.example server/.env

# Windows PowerShell
Copy-Item server/.env.example server/.env
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste it into `server/.env` as `JWT_SECRET`, then fill in your MongoDB URI and Gemini key:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lifepilot
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
AI_RATE_LIMIT=30
```

> Never commit `server/.env`. It is excluded by `.gitignore`; only `.env.example` belongs in Git.

### 3. Start the app

Make sure MongoDB is running, then from the project root:

```bash
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

Register an account, complete onboarding and generate your first roadmap.

### 4. Running without a Gemini key

Set `GEMINI_API_KEY=` (blank) and restart the server. Authentication, onboarding, practice challenges and progress tracking still work. AI pages show a clear setup notice instead of failing silently or returning fake content.

---

## Available scripts

Run these from the project root unless noted otherwise.

| Command | Description |
| --- | --- |
| `npm run setup` | Install root, server and client dependencies |
| `npm run dev` | Run the API and Vite dev server together |
| `npm run dev:server` | Run only the Express API with nodemon |
| `npm run dev:client` | Run only the Vite frontend |
| `npm run build` | Create a production build in `client/dist` |
| `npm start` | Start the Express server |
| `npm test` | Run the server test suite |

---

## Environment variables

All variables live in `server/.env` (server-side only).

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Express server port |
| `NODE_ENV` | No | `development` | `development`, `test` or `production` |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/lifepilot` | MongoDB connection string |
| `JWT_SECRET` | Yes in production | Development fallback | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime |
| `GEMINI_API_KEY` | For AI | empty | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model name |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed CORS origin (comma-separated values supported) |
| `AI_RATE_LIMIT` | No | `30` | AI requests per user per 15 minutes |

The frontend uses `/api` by default through the Vite proxy. For a separately hosted frontend, set `VITE_API_URL` to the API base URL at build time.

---

## API overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | API, database and AI configuration status |
| `POST` | `/auth/register` | Public | Create an account and receive a JWT |
| `POST` | `/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/auth/me` | Yes | Current user |
| `GET` | `/users/me` | Yes | Profile |
| `PATCH` | `/users/me` | Yes | Update profile and onboarding preferences |
| `PATCH` | `/users/me/password` | Yes | Change password with current-password check |
| `GET` | `/roadmap` | Yes | Active roadmap with computed statistics |
| `POST` | `/roadmap/generate` | Yes + AI | Generate and save a new roadmap |
| `PATCH` | `/roadmap/topics/:topicId` | Yes | Mark a topic complete or reopen it |
| `GET` | `/mentor/chats` | Yes | Chat history list |
| `GET` | `/mentor/chats/:chatId` | Yes | One conversation |
| `POST` | `/mentor/chat` | Yes + AI | Send a message and get a reply |
| `DELETE` | `/mentor/chats/:chatId` | Yes | Delete a conversation |
| `POST` | `/debugger/analyze` | Yes + AI | Analyse code and an error message |
| `GET` | `/practice` | Yes | List challenges with filters and user meta |
| `GET` | `/practice/:challengeId` | Yes | Challenge detail; solutions hidden until solved |
| `POST` | `/practice/:challengeId/complete` | Yes | Mark solved and award points once |
| `GET` | `/progress/summary` | Yes | Dashboard statistics |
| `GET` | `/projects/latest` | Yes | Latest saved project recommendations |
| `POST` | `/projects/recommend` | Yes + AI | Generate new project ideas |
| `POST` | `/agent/run` | Yes + AI | Run the planning agent with tool calling |
| `GET` | `/agent/runs/:runId` | Yes | Load an agent run |
| `POST` | `/agent/runs/:runId/confirm` | Yes | Approve a pending agent action |
| `POST` | `/agent/runs/:runId/dismiss` | Yes | Reject a pending agent action |

AI endpoints are rate-limited per authenticated user. Errors use stable codes such as `AI_NOT_CONFIGURED`, `AI_AUTH_FAILED`, `AI_BUSY`, `AI_INVALID_RESPONSE` and `AI_RATE_LIMITED`, which the frontend turns into helpful messages.

---

## AI agent safety

LifePilot's agent uses controlled Gemini function calling with five tools:

- `getUserProgress`
- `getNextLearningTask`
- `recommendProjects`
- `updateTopicStatus`
- `saveRoadmap`

Read tools run immediately. Write tools (`updateTopicStatus` and `saveRoadmap`) only create a **pending action**; nothing changes until the user presses **Approve** in the dashboard. Tool arguments are validated with Zod, roadmap topics are scoped to the signed-in user, and the agent is limited to four tool rounds and six tool calls per run.

The debugger treats submitted code as **text only**. LifePilot never executes user-submitted code on the server.

---

## Testing

Run the backend suite:

```bash
npm test
```

The tests use `mongodb-memory-server`, so they do not touch your development database. They cover:

- Registration, login, duplicate emails, validation, profile isolation and password changes.
- Roadmap statistics and topic completion, including reopening topics and cross-user access checks.
- Practice solution hiding, one-time scoring and progress integration.
- Agent confirmation, dismissal, ownership checks and roadmap replacement.
- Missing Gemini key handling and AI validation-before-provider behavior.
- JSON parsing, date helpers, roadmap calculations and Zod schemas.

Verify the production frontend build:

```bash
npm run build
```

> The first `npm test` run downloads a temporary MongoDB binary. On Windows, `mongodb-memory-server` may also require the [Microsoft Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist). Tests require internet access for that first download.

---

## Production build

```bash
npm run build
npm start
```

When `client/dist` exists, Express serves the built React app and its client-side routes. Set `NODE_ENV=production`, a strong `JWT_SECRET`, a production MongoDB URI and the Gemini key in the server environment before starting.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot reach the server` | Confirm the API is running on port 5000 and MongoDB is reachable. |
| API exits with a MongoDB error | Start MongoDB locally or use an Atlas connection string. |
| AI pages show a setup notice | Add `GEMINI_API_KEY` to `server/.env` and restart the server. |
| `AI_AUTH_FAILED` | The Gemini key is invalid or lacks access to the configured model. |
| `AI_MODEL_ERROR` | Check `GEMINI_MODEL`; the default is `gemini-2.5-flash`. |
| Rate-limit errors | Wait for the 15-minute window to reset or raise `AI_RATE_LIMIT`. |
| Tests cannot start MongoDB on Windows | Install the Microsoft Visual C++ Redistributable, then rerun `npm test`. |

---

## Notes

- Practice challenges are curated static learning content. Scores and completions are stored in MongoDB, while solutions are revealed only after a user marks a challenge as solved.
- Old roadmaps are archived with `isActive: false` instead of being deleted.
- One user can never read or modify another user's roadmap, chats, progress or agent runs.
- API keys stay on the server. Nothing sensitive is exposed through Vite environment variables.
