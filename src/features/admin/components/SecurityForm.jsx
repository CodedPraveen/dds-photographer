"use client";

import { useActionState } from "react";

import { changePassword } from "@/features/admin/server/actions";

export function SecurityForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  return (
    <form action={action}>
      <label>
        Current password
        <input name="currentPassword" type="password" required />
      </label>
      <label>
        New password
        <input name="newPassword" type="password" minLength={12} required />
      </label>
      <label>
        Confirm new password
        <input name="confirmPassword" type="password" minLength={12} required />
      </label>
      {state?.error && <p role="alert">{state.error}</p>}
      {state?.success && <p role="status">{state.success}</p>}
      <button disabled={pending}>
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
