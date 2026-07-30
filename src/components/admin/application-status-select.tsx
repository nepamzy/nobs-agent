"use client";

import { useRef } from "react";
import { updateApplicationStatus } from "@/app/admin/careers/applications/[id]/actions";

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateApplicationStatus}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <select
        name="status"
        defaultValue={currentStatus}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]"
      >
        <option value="RECEIVED" className="bg-[var(--color-ink)]">Received</option>
        <option value="IN_REVIEW" className="bg-[var(--color-ink)]">In review</option>
        <option value="INTERVIEWING" className="bg-[var(--color-ink)]">Interviewing</option>
        <option value="REJECTED" className="bg-[var(--color-ink)]">Rejected</option>
        <option value="HIRED" className="bg-[var(--color-ink)]">Hired</option>
      </select>
    </form>
  );
}
