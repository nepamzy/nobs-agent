// Reads the single Founder row from the database (see the `Founder` model
// in schema.prisma) with a graceful fallback, same reasoning as projects.ts:
// the site stays fully functional before DATABASE_URL points at a live,
// migrated database, and switches over automatically once real data exists.
// Edited via /admin/founder.

import { prisma } from "@/lib/prisma";

export type Founder = {
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
};

// Used until a real row is saved via /admin/founder. Only the name, photo
// and links are shown on the About page.
const fallbackFounder: Founder = {
  name: "Nobert Agu",
  role: "Founder",
  bio: "NOBS AGENT's founder, who sets the company's direction and standards.",
  photoUrl: null,
  githubUrl: "https://github.com/nepamzy",
  linkedinUrl: null,
};

export async function getFounder(): Promise<Founder> {
  try {
    const row = await prisma.founder.findFirst();
    if (!row) return fallbackFounder;
    return {
      name: row.name,
      role: row.role,
      bio: row.bio,
      photoUrl: row.photoUrl,
      githubUrl: row.githubUrl,
      linkedinUrl: row.linkedinUrl,
    };
  } catch {
    return fallbackFounder;
  }
}
