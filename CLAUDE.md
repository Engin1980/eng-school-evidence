# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Source of truth

`req.txt` (Czech) holds the requirements plus a "POZNÁMKY / ROZHODNUTÍ" section with the decisions made while clarifying them. `plan.md` is the step-by-step implementation plan. Keep all three in sync when decisions change. The UI language is Czech.

## Architecture (decided)

- Frontend-only SPA: React + Vite. No custom backend.
- Data in Firestore. Hosting and deployment via Firebase Hosting (`firebase deploy`).
- Auth: Firebase Authentication, passwordless email-link sign-in (any email address, not only Google). Persistence is the Firebase default (`localStorage`), so users stay signed in on a device.
- Security is intentionally trivial (data is not sensitive). Firestore rules only require that the signed-in email is on the allow-list and, for student data, a member of the student.

## Domain model

- **Allowed user** (`allowedUsers/{lowercased email}`): the allow-list. An existing user adds a new user by email. The first user is created manually in the Firebase console. The document id is the lowercased email so the Firestore rules can look it up directly.
- **Student** (`students/{id}`): `memberEmails` lists the users attached to the student. Users can only be added, not removed (removal is out of scope).
- **Subject** (`students/{id}/subjects/{id}`): per student only.
- **Task** (`students/{id}/tasks/{id}`): title, description, required `subjectId`, user-entered due date, status (`created` → `active` → `done`) and an automatic `createdBy` and `createdAt`. The status is changed on a kanban board by drag and drop.
- **Comment** (`students/{id}/tasks/{id}/comments/{id}`): text, author and time, shown in chronological order under the task.
- Users can edit and delete students and subjects, and delete tasks and comments.

## Commands

Filled in as the implementation progresses; see `package.json` for the authoritative list.
