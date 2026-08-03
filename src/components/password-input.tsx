"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

// Shared password field with a show/hide toggle, used on sign-in, signup,
// and change-password forms so the eye icon behaves identically everywhere.
export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={visible ? "text" : "password"}
          className={
            className ??
            "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm outline-none transition focus:border-[var(--color-brass)]"
          }
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)] transition hover:text-[var(--color-paper)]"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  }
);
