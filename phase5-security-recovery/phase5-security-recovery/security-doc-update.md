## Administrator recovery — IMPLEMENTED after patch is applied and verified

Manual server-side recovery uses `npm run admin:security-reset`. The operator must
have trusted server-terminal access and a direct database connection. The command
updates an existing admin only, replaces the Argon2id password and encrypted TOTP
secret, revokes all active sessions, clears the email's login-failure record, and
writes an `admin.security_reset` audit event. There is no public recovery endpoint,
email recovery, recovery-code mechanism, or account creation path. The operator
must configure the replacement authenticator before signing in again.
