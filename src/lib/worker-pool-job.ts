import { prisma } from "@/lib/prisma";

// A real Job row so a general "no open role yet, but here's my info"
// submission from /careers/worker reuses the entire existing job-application
// pipeline (ApplyForm, submitJobApplication, the admin applications list and
// per-applicant messaging thread) with zero new infrastructure. Fixed id so
// this is idempotent — upserted on first use, never duplicated. `active:
// false` keeps it out of the public "open roles" list on /careers (which
// filters on `active: true`), since this isn't a real open posting.
const WORKER_POOL_JOB_ID = "worker-general-pool";

export async function getWorkerPoolJobId(): Promise<string> {
  const job = await prisma.job.upsert({
    where: { id: WORKER_POOL_JOB_ID },
    create: {
      id: WORKER_POOL_JOB_ID,
      title: "General Application (Worker)",
      location: "Remote",
      type: "Full-time",
      description: "A general talent-pool submission, not tied to a specific open role.",
      active: false,
    },
    update: {},
  });
  return job.id;
}
