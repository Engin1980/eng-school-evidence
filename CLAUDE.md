# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

`req.txt` (Czech) holds the requirements plus a "POZNÁMKY / ROZHODNUTÍ" section with the decisions made while clarifying them. `plan.md` is the step-by-step implementation plan. Keep all three in sync when decisions change. The UI language is Czech.

## Architecture (decided)

- Frontend-only SPA: React + Vite. No custom backend.
- Data in Firestore. Hosting and deployment via Firebase Hosting (`firebase deploy`).
- Auth: Firebase Authentication, passwordless email-link sign-in (any email address) plus Google sign-in (popup). Both go through the same allow-list. Persistence is the Firebase default (`localStorage`), so users stay signed in on a device.
- Security is intentionally trivial (data is not sensitive). Firestore rules only require that the signed-in email is on the allow-list and, for student data, a member of the student.

## Domain model

- **Allowed user** (`allowedUsers/{lowercased email}`): the allow-list. An existing user adds a new user by email. The first user is created manually in the Firebase console. The document id is the lowercased email so the Firestore rules can look it up directly.
- **Student** (`students/{id}`): `memberEmails` lists the users attached to the student. Users can only be added, not removed (removal is out of scope).
- **Subject** (`students/{id}/subjects/{id}`): per student only.
- **Task** (`students/{id}/tasks/{id}`): required description (no title), required `subjectId`, due date (defaults to today, user can change it), status (`created` → `active` → `done`) and an automatic `createdBy` and `createdAt`. The status is changed on a kanban board by drag and drop.
- **Comment** (`students/{id}/tasks/{id}/comments/{id}`): text, author and time, shown in chronological order under the task.
- Users can edit and delete students and subjects, and delete tasks and comments. Deleting a subject deletes all its tasks (and their comments).

## Commands

- `npm run dev`: dev server. `npm run build`: production build into `dist/`. `npm test`: vitest (pure helpers in `src/lib/*.test.js`). Single test: `npx vitest run src/lib/tasks.test.js -t "<name>"`.
- `npm run deploy`: build + `firebase deploy` (Hosting and Firestore rules). Setup steps (Firebase project, `.env`, first user) are in `README.md`.

## Code layout

- `src/firebase.js`: init from `VITE_FIREBASE_*` env vars (see `.env.example`). The app shows a setup message when they are missing.
- `src/lib/auth.jsx`: `AuthProvider`/`useAuth`. Status is `loading | signedOut | needsEmail | denied | ready`. `denied` means signed in but not on the allow-list.
- `src/lib/log.js`: universal logger, `createLogger('namespace')` with `debug/info/warn/error`. Level from `localStorage.logLevel` or `VITE_LOG_LEVEL` (default `debug`). Use it instead of bare `console.*`.
- `src/lib/data.js`: `useQuery`/`useDocument` live-subscription hooks. `src/lib/students.js`: manual deep deletes, since Firestore does not delete subcollections. `src/lib/tasks.js`: statuses and pure helpers.
- `src/lib/route.js`: tiny hash router (`#/`, `#/users`, `#/student/<id>`). There is no router dependency.
- `src/components/`: one component per screen or panel. `Student.jsx` composes `Board` (kanban, native drag and drop), `Members` and `Subjects`. `TaskModal` embeds `Comments`.
- Email addresses are always stored lowercased, because the Firestore rules look them up as document ids and in `memberEmails`.
- Not tested against a live Firebase project (none is available here): changes to auth, rules or queries need manual verification.
