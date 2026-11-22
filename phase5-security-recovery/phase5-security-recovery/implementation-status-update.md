After applying and verifying this patch, update the Phase 5 status line:

- Add **manual server-side administrator security reset CLI** to the implemented
  admin foundation list.
- Remove **security-reset recovery flow** from the not-implemented list.
- Record verification only after running `npm run lint`, `npm test`, and a controlled
  recovery test against a non-production database. Do not mark production recovery
  as operationally verified until tested in the deployed environment.
