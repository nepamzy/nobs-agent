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

// Matches what's on the About page today, so nothing changes visually
// until a real row is saved via /admin/founder.
const fallbackFounder: Founder = {
  name: "Nobert Agu",
  role: "Founder & Full-stack Engineer / Systems Builder",
  bio: "I'm a full-stack engineer and systems builder focused on creating reliable digital infrastructure for growing organizations. I combine thoughtful design, solid engineering, and practical business needs to build systems that are built to work, scale, and last. My approach is simple: understand the problem first, then build the right solution.",
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
