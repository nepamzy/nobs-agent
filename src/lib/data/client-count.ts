import { prisma } from "@/lib/prisma";
import { companyFacts } from "@/lib/company-facts";

// Clients served shown on the homepage: the owner-confirmed baseline plus
// every client who has joined since then. A new client record (sign-up, the
// admin client form, or a portfolio project that names a new client) counts
// once; a portfolio project with no client at all counts as one new client.
// A project for an existing client adds nothing, so the same client is never
// counted twice.
export async function getClientCount(): Promise<number> {
  const { baseline, countsFrom } = companyFacts.clientsServed;
  const since = new Date(countsFrom);
  try {
    const [newClients, newProjectsWithoutClient] = await Promise.all([
      prisma.client.count({ where: { createdAt: { gt: since } } }),
      prisma.project.count({ where: { createdAt: { gt: since }, clientId: null } }),
    ]);
    return baseline + newClients + newProjectsWithoutClient;
  } catch {
    return baseline;
  }
}
