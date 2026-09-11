# AI Voice Teacher for Kids

**Little Wonder** is a child-friendly Next.js learning classroom with an animated teacher named Mia. Children can learn through speech or use an always-available typed fallback.

## Implemented features

- Complete A–Z lesson with tolerant answer checking, spoken encouragement, a star animation, database persistence, and automatic next-letter progression.
- Numbers 1–100, beginning with 1–10 counting visuals; colors, SVG shapes, animals, fruits and vegetables, and age-adjusted counting/addition/subtraction/comparison.
- ABC, number, color, shape, animal, math, and mixed quizzes with server-side scoring. Quiz stars are saved using a retry-safe attempt ID.
- Original rhymes with play/pause/restart, line mode and repetition practice; original stories with spoken narration and question checkpoints.
- Voice state machine: IDLE, LISTENING, THINKING, SPEAKING, ERROR. Browser STT/TTS adapters; typed fallback; permission, silence, timeout, connection, and speech errors.
- Talk to Teacher with a limited offline demo or a server-side OpenAI adapter. No API keys are sent to the browser.
- SQLite progress, stars, achievements, activity, quizzes, and learning sessions.
- Local human-teacher simulation across same-origin browser tabs with lesson commands, questions, answers, encouragement, and stars.
- Nickname/age profile, speech speed, voice toggle, auto-next, celebration sounds, and large text. English is complete; Hindi is a clearly marked future option.

## Installation

Requires Node.js 22 LTS and npm. This workspace includes an ignored portable runtime in `.tools`. On this Windows machine, replace `npm` below with `.\scripts\npm.ps1` if Node is not on PATH.

```sh
npm install
cp .env.example .env
npm run db:push
npm run dev
```

PowerShell environment-copy equivalent: `Copy-Item .env.example .env`.

Open **http://127.0.0.1:3000**. The server binds to loopback for this local prototype.

If Prisma on Windows reports an empty “Schema engine error” for a new SQLite database, create the file with `New-Item prisma/dev.db -ItemType File`, then rerun `npm run db:push`. Do not overwrite an existing database.

## First milestone

1. Open the child classroom and select **Learn ABC**.
2. Tap **Start lesson** to unlock browser audio. Mia says “A is for Apple.”
3. Tap the microphone, allow access, and say “Apple.” Or type Apple and press Send.
4. Mia says “Excellent! Apple starts with A.” A star appears, progress saves, and the lesson advances to B after speech ends.
5. Open **Talk to Teacher**, ask a question, and hear the answer.

A user gesture is required to start audio in many browsers. Navigation does not automatically play unsolicited audio. Repeat replays the current lesson.

## Environment and OpenAI

```dotenv
DATABASE_URL="file:./dev.db"
AI_PROVIDER="demo"
OPENAI_API_KEY=
OPENAI_MODEL="gpt-4.1-mini"
```

The default `demo` provider is a small fixed offline lesson book, **not a live AI model**. It answers sample questions about the sky, elephants, and plants.

For live conversation, set `AI_PROVIDER="openai"`, add your own `OPENAI_API_KEY` to local `.env`, and restart the server. Choose a model available to your account with `OPENAI_MODEL`. A missing key returns a clear configuration error; provider failures are not silently disguised as live answers. Live credential-backed calls need a configured account and are separate from the mocked automated tests.

The adapter uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text) with `store: false`, short output, limited history, and [input/output moderation](https://developers.openai.com/api/reference/resources/moderations). The application does not store free-talk transcripts in SQLite. `store: false` does not itself guarantee zero provider retention; review provider settings before using real child data.

## Architecture

```text
src/
  app/
    (classroom)/child, learn, quiz, talk, progress, settings, teacher
    api/profile, progress, quiz, session, talk, teacher/star
  components/
    child/       Home, animated avatar, free talk
    common/      Shell and shared profile/settings provider
    lessons/     Structured, rhyme, story, and shape players
    quiz/        Quiz UI
    teacher/     Local command bridge and dashboard
    voice/       Microphone, transcript, typed fallback
  hooks/         Voice orchestration, STT/TTS, session and teacher hooks
  data/lessons/  Typed educational facts and original reading content
  services/
    ai/          Provider interface, demo, OpenAI, safety
    speech/      Replaceable STT/TTS interfaces and browser adapters
    lessons/     Answer matching and quiz scoring
    progress/    Server-only database repository
    teacher/     Transport interface and BroadcastChannel adapter
  lib/           Prisma singleton and HTTP validation
  types/         Lesson, Step, Answer, Question, Quiz, Progress, commands
prisma/schema.prisma
tests/           Unit and browser interaction tests
```

API routes validate requests and delegate to services. A later Express backend can reuse the lesson and AI logic; replace the Next.js request/cookie boundary and the Prisma repository connection setup.

Educational facts live in TypeScript. Prisma Lesson rows only identify persisted progress. PostgreSQL migration requires changing the datasource provider/URL and generating a PostgreSQL migration; do not reuse SQLite migrations. For deployment, replace prototype `db:push` with reviewed Prisma migrations and persistent database storage.

## Voice compatibility and privacy

- Speech recognition availability varies by browser, OS, language, and service. Try a recent Chrome or Edge on localhost or HTTPS. Firefox generally requires the text fallback.
- Browser recognition may send microphone audio to the browser vendor’s speech service. No audio is stored by this app.
- Browser SpeechSynthesis uses installed voices; quality and availability vary. English is the current spoken language.
- Microphone access requires permission and a secure context. Denial and unsupported recognition always leave typing available.
- Recognition stops before teacher speech. Speech stops on route unmount and teacher interruptions. Children explicitly tap before the next listening turn.
- Transcript matching is forgiving practice feedback, **not a clinical or phonetic pronunciation assessment**.
- Reduced-motion preferences are respected.

## Human teacher simulation

Open `/child` and `/teacher` in separate tabs **using the same hostname and browser profile**. The dashboard shows the profile from that browser’s learner cookie. Commands use BroadcastChannel and cannot connect separate devices.

Roles are local demo views, not authenticated access controls. Before public deployment, add adult authentication, teacher/student authorization, pairing, consent/privacy controls, durable rate limits, and appropriate operational safety review. The server binds to loopback by default. No remote classroom or video call is implemented.

The `TeacherTransport` interface is the replacement point for a WebSocket/Socket.IO adapter. Future WebRTC video is explicitly disabled in the UI.

## Progress behavior

- Correct structured lesson answers earn one star per step, even if repeated.
- Skipping with Next does not mark a step complete.
- Quiz results are scored on the server; repeated saves with the same attempt ID cannot duplicate rewards.
- The HTTP-only learner cookie identifies the local profile. Clearing it creates a fresh local profile.
- Rhymes and stories record learning time; their open-ended practice does not award correctness stars.
- Visible lesson, quiz, and talk sessions send 15-second heartbeats. Time is approximate and excludes most background-tab time.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run dev
# In another terminal:
npm run test:e2e
```

The browser test config currently uses installed Microsoft Edge on Windows. Set `PLAYWRIGHT_CHANNEL=chromium` to use Playwright Chromium and run `npx playwright install chromium` first. Browser tests stub speech APIs to verify orchestration deterministically; actual microphone accuracy and speaker output require a physical-device check.

`npm run format` formats source and tests. Production: `npm run build`, then `npm start`.

## Roadmap

1. Authenticated multi-child accounts, adult consent and teacher pairing.
2. WebSocket classroom transport with authenticated acknowledgements and reconnect.
3. Optional professional speech providers and richer pronunciation feedback.
4. Hindi curriculum, language-specific answer normalization and voices.
5. Expanded age-adaptive activities, accessible avatar alternatives, and durable analytics.
6. WebRTC video sessions after the classroom transport is established.
