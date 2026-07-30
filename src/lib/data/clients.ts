// Reads from the database (`Client` and `Testimonial` models) with a
// graceful fallback to sample data, see the note in projects.ts for why.

import { prisma } from "@/lib/prisma";

export type ClientRecord = {
  id: string;
  name: string;
  organization: string;
  sector: string;
};

export type TestimonialRecord = {
  id: string;
  clientId: string;
  quote: string;
  authorName: string;
  authorRole: string;
  rating: number;
  featured: boolean;
};

// No sample clients or testimonials, same reasoning as projects.ts:
// showing fake client names on a real business site would be misleading.
// Real ones get added via /admin/clients.
const fallbackClients: ClientRecord[] = [];

const fallbackTestimonials: TestimonialRecord[] = [];

async function fetchClientsFromDb(): Promise<ClientRecord[] | null> {
  try {
    const rows = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    if (rows.length === 0) return null;
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      organization: c.organization ?? c.name,
      sector: c.sector ?? "Client",
    }));
  } catch {
    return null;
  }
}

async function fetchTestimonialsFromDb(): Promise<TestimonialRecord[] | null> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    if (rows.length === 0) return null;
    return rows.map((t) => ({
      id: t.id,
      clientId: t.clientId,
      quote: t.quote,
      authorName: t.client?.name ?? "Client",
      authorRole: t.client?.organization ?? "",
      rating: t.rating,
      featured: t.featured,
    }));
  } catch {
    return null;
  }
}

export async function getClients() {
  return (await fetchClientsFromDb()) ?? fallbackClients;
}

export async function getTestimonials() {
  return (await fetchTestimonialsFromDb()) ?? fallbackTestimonials;
}

export async function getFeaturedTestimonials() {
  const testimonials = await getTestimonials();
  return testimonials.filter((t) => t.featured);
}
