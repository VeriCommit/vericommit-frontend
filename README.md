# vericommit-frontend

The VeriCommit web frontend (Next.js App Router + TypeScript + Tailwind CSS).

## What VeriCommit is

VeriCommit helps a **human reviewer** judge whether a milestone's acceptance
criteria are supported by evidence. This frontend lets the reviewer describe a
milestone, sends it for evaluation, and shows an evidence-based report. The AI
evaluation is **advisory only** — it never makes the decision. A human reviewer
records their own decision separately (see [Human decision step](#human-decision-step)).

There is no funding, payment, approval or release functionality anywhere in
this app.

## Prerequisites

- Node.js LTS (the project is built and tested on a current LTS release).

## Install, run, test

```sh
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev                  # http://localhost:3000
npm test                     # Vitest unit tests
npm run lint                 # ESLint
npm run build                # production build
```

## Demo flow

1. On the home page, fill in the form: project name, GitHub repository URL,
   milestone title, milestone description, and one or more acceptance criteria.
   The repository URL is required in both evidence modes. The form defaults to
   `evidence_source: "sample"` and pre-fills a demo repository URL.
2. Submit the form. A loading state appears while the evaluation runs.
3. The app shows either an evaluation report or an error.
4. The report shows the sample/mock labels, the human-review notice, criteria
   grouped by status (**Supported**, **Insufficient evidence**, **Uncertain**)
   with their evidence, suggested next steps, limitations, and the human
   reviewer decision step.

## Single endpoint

The app calls exactly one backend endpoint:

```
POST /api/v1/evaluations
```

The base URL comes from `NEXT_PUBLIC_API_BASE_URL`. This endpoint is only
called when mock mode is **off**. In mock mode the app makes no network request
at all — it returns a fixture after a short simulated delay.

The request and response shapes are defined by the backend API contract
(`docs/API_CONTRACT.md` in the backend repository).

## Environment variables

Copy `.env.example` to `.env.local` and adjust as needed. Only these
`NEXT_PUBLIC_` variables are used:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_USE_MOCK` | `true` | Mock mode toggle. |
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000` | Backend base URL (real mode only). Trailing slashes are stripped. |
| `NEXT_PUBLIC_MOCK_SCENARIO` | `mixed` | Which mock fixture/error to return. |

### Mock mode is on by default

Mock mode is **on unless `NEXT_PUBLIC_USE_MOCK` is exactly `false`** (the value
is trimmed and lowercased, so `FALSE`/`false` disables it; anything else,
including an unset value, keeps mock mode on).

### `NEXT_PUBLIC_MOCK_SCENARIO`

> This variable is a **frontend addition** and is **not** part of the team's
> decisions document.

Valid values (matching is case-insensitive; an unknown or unset value falls
back to `mixed`):

- `mixed` (default) — a report with a mix of statuses.
- `all-supported` — every criterion supported.
- `all-insufficient` — every criterion has insufficient evidence.
- `sample-null-urls` — evidence references without URLs.
- `INVALID_REQUEST`, `INVALID_REPOSITORY_URL`, `REPOSITORY_ACCESS_DENIED`,
  `EVIDENCE_RETRIEVAL_FAILED`, `EVALUATION_FAILED` — return the matching error.
- `timeout` — returns an HTTP 504-style timeout error.

### Restart after changing `.env` files

`NEXT_PUBLIC_*` variables are inlined by Next.js when the dev server starts (or
when you build). **Restart `npm run dev`** (and rebuild for production) after
editing `.env` files, or the change will not be picked up.

### Switching to the real backend

Set the following and restart the dev server:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://your-backend-host:port
```

In real mode, a backend failure is shown as an error and is **never** replaced
by mock data.

## Mock-mode banner

When mock mode is on, a banner is shown at the top of every page:
**"Mock mode: responses are simulated"**.

## Error messages

The message is chosen from the backend `error.code` (never by matching message
text). HTTP 504 and network failures take precedence.

| Trigger | Message shown |
| --- | --- |
| `INVALID_REQUEST` | Please check the submitted information and try again. |
| `INVALID_REPOSITORY_URL` | Enter a valid GitHub repository URL. |
| `REPOSITORY_ACCESS_DENIED` | This repository cannot be accessed. Check its visibility and permissions. |
| `EVIDENCE_RETRIEVAL_FAILED` | We couldn't retrieve the repository evidence. Please try again. |
| `EVALUATION_FAILED` | The evaluation could not be completed. Please try again later. |
| HTTP `504` (timeout) | The evaluation took too long to respond. Please try again. |
| Network failure | We couldn't reach the evaluation service. Check your connection and try again. |
| Any other/unrecognised code | Something went wrong. Please try again. |

The timeout, network and unrecognised-code messages are frontend additions, not
from the team's decisions document. Safe backend details (status, code,
message) are available in an expandable "Technical details" section.

## Sample and mock labels

Two distinct labels are shown on the report:

- **Sample evidence — demonstration data, not verified GitHub evidence.**
- **Mock evaluation — demo only.** (only when mock mode is on)

## Empty evidence

When a criterion has no supporting evidence, the report shows:

> No supporting evidence was identified for this criterion.

and:

> This does not necessarily mean the work was not completed. The available evidence may be insufficient to establish whether the criterion has been satisfied.

The criterion is still displayed with its backend status; it is not hidden and
not marked as failed.

## Human decision step

The report includes a human reviewer decision with the options **Milestone
accepted**, **Needs more evidence** and **Hold**. This decision is:

- Stored in **this browser's `localStorage` only** (key
  `vericommit:decision:<evaluation_id>`), so it is restored on reload, editable
  and clearable.
- **Demo only**: not sent to a server, not shared across devices, and not a
  formal audit record.
- A **recorded reviewer decision**, not a funding action. It does not approve
  payments, verify milestone completion, or change funding agreements.

The decision is made by the human reviewer, not by the AI.

## CORS (real mode only)

When mock mode is off, the browser calls the backend directly. The backend
should allow the origin `http://localhost:3000` for `POST` and `OPTIONS`
requests and permit the `Content-Type` and `Accept` headers. This is owned by
the **backend team** and has **not been verified** by this project; it only
matters when mock mode is off.

## Status of the backend

The backend's live AI evaluation may not be fully implemented yet. Check this
README against the backend repository (and its API contract) before relying on
real-mode behavior; the mock layer is what the demo uses by default.
