# Evidence domácích úkolů

Jednoduchá webová aplikace (React + Vite) pro evidenci domácích úkolů. Bez vlastního backendu: data jsou ve Firestore, přihlášení přes Firebase Authentication (e-mailový odkaz), hosting na Firebase Hosting. Požadavky jsou v `req.txt`, plán v `plan.md`.

## Nastavení Firebase

1. V [Firebase konzoli](https://console.firebase.google.com) vytvořte projekt a přidejte Web app. Hodnoty konfigurace zkopírujte do `.env` (vzor v `.env.example`).
2. **Authentication → Sign-in method**: zapněte *Email/Password* a v něm volbu *Email link (passwordless sign-in)*.
   Pro přihlášení přes Google zapněte v téže sekci poskytovatele *Google* (zvolte support e-mail projektu a uložte). Použije se stejný seznam `allowedUsers`, takže Google účet musí mít e-mail, který je na seznamu.
3. **Authentication → Settings → Authorized domains**: přidejte doménu, na které aplikace poběží (`localhost` je tam ve výchozím stavu).
4. **Firestore Database** (Cloud Firestore, ne Realtime Database ani SQL / Data Connect): vytvořte databázi v režimu *Native* (výchozí `(default)` databáze). Režim zabezpečení zvolte *production*; pravidla se nasadí z `firestore.rules`.
5. **První uživatel** (ručně v konzoli): v kolekci `allowedUsers` vytvořte dokument s ID rovným vašemu e-mailu **malými písmeny** a poli `email` (string, stejná hodnota) a `name` (string). Další uživatele pak přidává přímo aplikace na stránce *Uživatelé*.
6. Zkopírujte `.firebaserc.example` na `.firebaserc` a doplňte ID projektu.

## Příkazy

```
npm install
npm run dev        # vývojový server
npm test           # testy (vitest)
npm run build      # produkční build do dist/
npm run deploy     # build + firebase deploy (hosting i Firestore pravidla)
```

Nasazení vyžaduje `firebase-tools` (`npm i -g firebase-tools`, `firebase login`).

## Poznámky

- Přihlašovací odkaz otevřete ve stejném prohlížeči, ve kterém jste o něj žádali; jinak aplikace požádá o potvrzení e-mailu. Přihlášení se na zařízení drží dlouhodobě.
- E-maily od Firebase mohou končit ve spamu; bezplatný tarif má limit odeslaných e-mailů.
- Pravidla (`firestore.rules`) jsou záměrně jednoduchá: pustí jen e-maily z `allowedUsers`, data studenta jen jeho členy.
- Odebrání uživatele od studenta zatím není implementováno.
