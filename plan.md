# Implementační plán

Stack: React + Vite, Firebase Auth (e-mailový odkaz), Firestore, Firebase Hosting. UI česky. Bez routeru a UI knihoven; kanban přes nativní HTML5 drag and drop.

## Datový model (Firestore)

- `allowedUsers/{email malými písmeny}`: `email`, `name`, `createdBy`, `createdAt`
- `students/{id}`: `name`, `memberEmails[]`, `createdBy`, `createdAt`
- `students/{id}/subjects/{id}`: `name`
- `students/{id}/tasks/{id}`: `title`, `description`, `subjectId`, `dueDate` (YYYY-MM-DD), `status` (`created` | `active` | `done`), `createdBy`, `createdAt`
- `students/{id}/tasks/{id}/comments/{id}`: `text`, `author`, `createdAt`

## Kroky

1. **Scaffold**: Vite + React, závislosti (`firebase`, `vitest`), `.gitignore`, `.env.example` s Firebase konfigurací. Commit.
2. **Firebase konfigurace**: `src/firebase.js` (init z `VITE_FIREBASE_*`), `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc.example`. Pravidla: přístup jen pro e-maily z `allowedUsers`, data studenta jen pro členy. Commit.
3. **Přihlášení**: stránka pro zadání e-mailu a odeslání odkazu, dokončení přihlášení z odkazu (dotaz na e-mail, pokud chybí v `localStorage`), kontrola allow-listu, odhlášení, stavy načítání a chyb. Commit.
4. **Uživatelé** (scénář 1): seznam povolených uživatelů a formulář pro přidání (e-mail + jméno). Commit.
5. **Studenti** (scénáře 2, 3): seznam studentů uživatele, vytvoření, přejmenování, smazání (včetně podkolekcí), přidání existujícího uživatele ke studentovi. Commit.
6. **Předměty** (scénář 7): správa předmětů ve studentovi (přidat, přejmenovat, smazat). Commit.
7. **Úkoly a kanban** (scénáře 4, 5): formulář úkolu (předmět a neprázdný popis povinné, bez názvu, termín výchozí dnes; autor a datum automaticky), tři sloupce, přesun karet tažením i tlačítky, úprava a smazání. Čisté pomocné funkce s testy (vitest). Commit.
8. **Komentáře** (scénář 6): detail úkolu s vlákny komentářů, přidání a smazání. Commit.
9. **Nasazení a dokumentace**: `README.md` s postupem (vytvoření projektu, zapnutí e-mail link přihlášení, povolení domény, první uživatel, `firebase deploy`), aktualizace `CLAUDE.md` o příkazy. Ověření `npm run build` a `npm test`. Commit.

## Mimo rozsah

Odebrání uživatele od studenta, hesla, role, notifikace.
