"use client";

import { useActionState } from "react";

import { login } from "@/features/admin/server/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main style={{ maxWidth: 460, margin: "8rem auto", padding: "2rem" }}>
      <p>DDS Photographer · Private workspace</p>
      <h1>Sign in</h1>
      <form action={action}>
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <label>
          Authenticator code
          <input name="code" inputMode="numeric" pattern="[0-9]{6}" required />
        </label>
        {state?.error && <p role="alert">{state.error}</p>}
        <button disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
