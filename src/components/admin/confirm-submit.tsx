"use client";

import type { ReactNode, MouseEvent } from "react";

export function ConfirmSubmit({
  children,
  message,
  className,
  title,
}: {
  children: ReactNode;
  message: string;
  className?: string;
  title?: string;
}) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (!confirm(message)) {
      e.preventDefault();
    }
  }

  return (
    <button type="submit" onClick={handleClick} className={className} title={title}>
      {children}
    </button>
  );
}
