# Phase 5 — Manual administrator security recovery

This adds a server-side CLI reset for the one provisioned admin account. It does not add a public recovery endpoint, recovery email, recovery codes, account registration, or a new database model.

## Install in the repository

1. Copy `security-reset-admin.mjs` to `scripts/security-reset-admin.mjs`.
2. Add this script to `package.json`:

```json
"admin:security-reset": "node scripts/security-reset-admin.mjs"
```

3. Run from an authorized server terminal after configuring `DIRECT_URL` (preferred) or `DATABASE_URL` and `ADMIN_TOTP_ENCRYPTION_KEY`:

```bash
npm run admin:security-reset
```

The command prompts for the existing admin email, new password (hidden), password confirmation (hidden), and a new Base32 authenticator secret (hidden). It requires the exact confirmation `RESET` before changing anything.

## Behavior

- Updates an existing admin only; never creates an account.
- Hashes the new password with Argon2id.
- Encrypts and replaces the TOTP secret using the existing AES-256-GCM helper.
- Clears the legacy plaintext TOTP column.
- Revokes every active admin session in the same database transaction.
- Writes `admin.security_reset` to the existing audit log, including the CLI source and revoked-session count.
- Clears the login-failure record for the admin email.
- Does not print credentials or the authenticator secret.

Run only on a trusted server terminal. Keep the new authenticator secret out of shell history, logs, tickets, and source control. If the process is interrupted before the transaction commits, the credentials remain unchanged. If the transaction commits, all previous sessions are revoked.

## Verification boundary

This package is a source patch prepared against the `admin-work` branch snapshot. It has not been applied to the repository or executed against the user's database. Run the project's lint and test commands after applying it, then perform a controlled recovery test with a non-production admin environment.
