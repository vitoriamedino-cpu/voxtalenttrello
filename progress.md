Plan: /mnt/data/docs/plans/2026-10-29-voxtalent-firebase-access-sheets-plan.md

Task 1: partial — existing work includes pure account authorization policy, Firestore registry adapter, rules/setup documentation, and policy tests. The access-account adapter had a missing local import for `normalizeAccountEmail`; this was corrected.
Task 2: partial — WorkspaceContext authorization state and App.tsx gate exist in this project copy. Not browser-smoke-tested.
Task 3: partial — account UI and Firestore registry wiring exist. Not verified with a real Firebase project; initial Admin record and Firestore rules still require operator provisioning/review.
Task 4: partial — audited the supplied workbook updated 2026-10-28 and added exact header mappings; loader validates official workbook ID, required tabs and headers, and maps records by header names. A malformed legacy sync stub that prevented TypeScript parsing was corrected. Legacy full sync, legacy entity syncs, range clearing and spreadsheet creation remain blocked to avoid accidental destructive writes. Safe entity-specific write operations remain to be implemented before CRUD can sync to Sheets.

Verification performed:
- 11 automated policy/mapping tests passed using `node --experimental-strip-types --test tests/*.test.ts` (native TypeScript stripping; Node emitted an experimental-feature warning).
- TypeScript transpile/syntax scan passed for all 49 `.ts`/`.tsx` files in `src` with 0 syntax errors.
- Full TypeScript typecheck and Vite production build could not complete because npm dependency installation timed out. npm logs show DNS/network failures (`EAI_AGAIN`) fetching packages from registry.npmjs.org; the partial `node_modules` tree is incomplete. The typecheck output after bypassing incomplete ambient types contains missing dependency/type declarations, so it is not a successful full check.
- No real Firebase login, Firestore rules, Google Sheets API read/write, or browser smoke test was run.

Do not deploy or claim production readiness yet. In particular, entity-specific writes are intentionally disabled pending implementation and verification.
Deployment: not published. No changes pushed or merged to GitHub.
