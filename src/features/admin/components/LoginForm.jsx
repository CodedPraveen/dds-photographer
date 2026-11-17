
"use client";

import { useActionState } from "react";
import { Camera, ShieldCheck, ArrowRight } from "lucide-react";

import { login } from "@/features/admin/server/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="login-page">
      <section className="login-layout">
        <div className="login-showcase">
          <div className="login-brand">
            <span className="login-brand-icon">
              <Camera size={24} />
            </span>
            <span>
              <strong>DDS Photographer</strong>
              <small>STUDIO MANAGEMENT</small>
            </span>
          </div>

          <div className="login-showcase-content">
            <span className="login-eyebrow">PRIVATE STUDIO WORKSPACE</span>
            <h1>
              Every moment
              <br />
              deserves to be
              <br />
              <span>remembered.</span>
            </h1>
            <p>
              Your creative workspace to manage galleries, photos,
              clients and everything behind the lens.
            </p>
          </div>

          <div className="login-showcase-footer">
            <ShieldCheck size={17} />
            <span>Secure access · Authorized personnel only</span>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-card">
            <div className="login-mobile-brand">
              <Camera size={22} />
              <span>DDS Photographer</span>
            </div>

            <div className="login-heading">
              <span className="login-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your workspace</h2>
              <p>Enter your credentials to continue.</p>
            </div>

            <form action={action} className="login-form">
              <label className="login-field">
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
              </label>

              <label className="login-field">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <label className="login-field">
                <span>Authenticator code</span>
                <input
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  required
                />
                <small>Enter the 6-digit code from your authenticator app.</small>
              </label>

              {state?.error && (
                <p className="login-error" role="alert">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={pending}
              >
                <span>{pending ? "Signing in..." : "Sign in securely"}</span>
                {!pending && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-security-note">
              <ShieldCheck size={16} />
              <span>Your connection is protected and private.</span>
            </div>
          </div>

          <p className="login-copyright">
            © {new Date().getFullYear()} DDS Photographer. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
