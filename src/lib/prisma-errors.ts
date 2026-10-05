// True when a Prisma write failed on a unique constraint (P2002). Checked
// by error code rather than `instanceof`, the same way
// src/app/admin/portfolio/actions.ts does, so it doesn't depend on which
// copy of the Prisma error classes threw it.
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
