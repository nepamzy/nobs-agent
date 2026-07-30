// Reads from the database (`BlogPost` model) with a graceful fallback to
// sample posts, see the note in projects.ts for why.

import { prisma } from "@/lib/prisma";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // paragraphs
  category: string;
  publishedAt: string; // ISO date
};

const fallbackPosts: BlogPost[] = [
  {
    slug: "why-school-portals-fail-in-year-two",
    title: "Why most school portals fail in year two",
    excerpt:
      "Launch day is the easy part. Here's what actually determines whether a portal is still in use twelve months later.",
    category: "Institutional Platforms",
    publishedAt: "2026-05-14",
    content: [
      "Most school portal projects fail quietly. They launch well, parents log in during the first admissions cycle, staff are trained, everyone is satisfied. Then six months pass, a staff member who understood the system leaves, and the portal slowly reverts to spreadsheets.",
      "The pattern is almost never a technology failure. It's an ownership failure. The system was built for the person who commissioned it, not for whoever inherits it.",
      "The fix is structural, not technical: every institutional platform needs at least two trained internal owners from day one, documentation written for a non-technical reader, and an admin dashboard that doesn't require a developer for routine changes. Build for succession, not just for launch.",
    ],
  },
  {
    slug: "direct-booking-vs-ota-commission-math",
    title: "The real math behind direct booking engines",
    excerpt:
      "OTA commissions look small per booking. Over a year, they're usually the difference between a good margin and a break-even one.",
    category: "Commerce & Booking",
    publishedAt: "2026-04-02",
    content: [
      "A 15-20% commission on every third-party booking sounds manageable until you total it against annual revenue. For a mid-sized hotel doing significant volume through OTAs, that commission is frequently larger than the entire marketing budget.",
      "A direct booking engine doesn't need to replace OTA channels, it needs to convert the guests who already know your name. Repeat guests, referrals, and anyone who found you through search should never be paying an OTA a cut on your behalf.",
      "The engines that actually shift booking mix share three traits: real-time availability synced with the OTA calendar, a checkout that takes under two minutes, and a reason to book direct, a small discount or an amenity the OTA listing can't offer.",
    ],
  },
  {
    slug: "what-an-admin-dashboard-should-never-require",
    title: "What a good admin dashboard should never require",
    excerpt:
      "If updating your own homepage needs a developer, the dashboard didn't do its job.",
    category: "Product Engineering",
    publishedAt: "2026-02-19",
    content: [
      "The test I use for every admin dashboard I build: could the person who runs day-to-day operations change a homepage headline, swap a photo, or update a price without calling me? If the answer is no, the dashboard isn't finished.",
      "This sounds obvious, but it's the single most common gap in commissioned websites, an agency ships something polished, then every future change routes back through a support ticket and an invoice.",
      "The underlying discipline is simple: no text lives only in component code. Every visible string reads from a content table an admin can edit. It costs more time up front and pays for itself the first time a client needs an urgent change on a weekend.",
    ],
  },
  {
    slug: "hotels-restaurants-need-booking-systems-not-websites",
    title: "Hotels and restaurants don't need a website. They need a booking system.",
    excerpt:
      "A beautiful page that can't take a reservation is a brochure, not a business tool.",
    category: "Commerce & Booking",
    publishedAt: "2026-06-18",
    content: [
      "A restaurant or hotel website with no way to actually book is solving the wrong problem. Guests don't visit your site to admire the photography, they visit to answer one question: can I get a table or a room, and how do I lock it in right now.",
      "Every extra step between a guest deciding to book and them actually confirming is a chance to lose them to whichever competitor made it easier. A phone number in the footer is not a booking system. A booking system holds real-time availability, takes a deposit, and sends a confirmation without a human needing to be watching an inbox.",
      "This is also where a lot of budget gets wasted on the wrong priority. A gorgeous homepage with a broken booking flow converts worse than a plain page with a booking flow that actually works. Build the function first, then make it beautiful.",
    ],
  },
  {
    slug: "hospital-records-system-vs-school-portal",
    title: "What makes a hospital records system different from a school portal",
    excerpt:
      "They look similar on a slide deck. They are not similar to build, and treating them the same is how projects go over budget.",
    category: "Institutional Platforms",
    publishedAt: "2026-06-05",
    content: [
      "On paper, a hospital system and a school portal sound like the same idea. Different people, different roles, records that need to be looked up quickly. In practice, the two have almost nothing in common once you get past the surface.",
      "A school portal's biggest risk is convenience failing, parents getting frustrated, staff going back to spreadsheets. A hospital system's biggest risk is a wrong record costing someone their health. That difference changes everything about how the system gets built. Patient data needs stricter access controls, audit trails on every view and edit, and a much lower tolerance for ambiguity in who can see what.",
      "If a developer quotes a hospital records system the same way they'd quote a school portal, that's usually a sign they haven't built one before. The extra rigor costs more time upfront. It's not optional.",
    ],
  },
  {
    slug: "paystack-vs-flutterwave-vs-stripe",
    title: "Paystack vs Flutterwave vs Stripe, picked properly",
    excerpt:
      "The right payment provider depends on where your customers actually are, not which one has the nicest dashboard.",
    category: "Commerce & Booking",
    publishedAt: "2026-05-28",
    content: [
      "Every one of these three processes payments reliably. The decision isn't really about reliability, it's about who your customers are and where their money already lives.",
      "For a business collecting naira from customers inside Nigeria, Paystack is usually the simplest path, fast local payouts and a setup most Nigerian customers already trust from other sites. Flutterwave covers similar ground with broader reach across African currencies, useful if you're expecting customers from more than one country on the continent. Stripe makes the most sense when a meaningful share of your customers are paying in dollars, pounds, or euros from outside Africa.",
      "Most of the projects I build start with one provider live at launch and add a second only once there's an actual customer base that needs it. Wiring up three payment providers before you have paying customers is effort spent in the wrong place.",
    ],
  },
  {
    slug: "why-you-need-a-whatsapp-button-not-just-a-contact-form",
    title: "Why your business needs a WhatsApp button, not just a contact form",
    excerpt:
      "In most of the markets I build for, a contact form is where inquiries go to die. WhatsApp is where they actually get answered.",
    category: "Corporate & Brand",
    publishedAt: "2026-05-11",
    content: [
      "A contact form assumes the visitor is willing to type a formal message, wait an unknown amount of time, and hope someone checks the inbox. That's a fine assumption in some markets. It's a bad one in most of the ones I build for, where WhatsApp is already how people expect to reach a business.",
      "The fix isn't complicated: a floating WhatsApp button that's visible on every page, pre-filled with a sensible starting message, so a visitor is one tap away from a real conversation instead of a form they're not sure will be read.",
      "Contact forms still matter, some inquiries genuinely need to be written down and routed properly, and not everyone wants to text a stranger. The point isn't to replace the form. It's to stop making WhatsApp an afterthought when it's often the channel that actually converts.",
    ],
  },
  {
    slug: "the-real-cost-of-a-cheap-website",
    title: "The real cost of a cheap website (and what it costs later)",
    excerpt:
      "The lowest quote is rarely the lowest total cost. It just moves the cost to a date you haven't hit yet.",
    category: "Corporate & Brand",
    publishedAt: "2026-04-22",
    content: [
      "A cheap website is easy to spot after the fact: it's the one that needed a full rebuild eighteen months later because it couldn't handle a feature the business now actually needs, or because whoever built it is no longer reachable.",
      "The upfront price of a website mostly reflects how much thinking went into the parts you can't see, the data structure, the admin tooling, whether the code is something another developer could pick up later. Skipping that thinking is exactly how a project gets cheaper today and dramatically more expensive the day something needs to change.",
      "The honest question to ask any quote isn't just what it costs to build. It's what it costs to change something in a year. A quote that hasn't thought about that question yet usually hasn't thought about much beyond the launch date.",
    ],
  },
  {
    slug: "what-a-church-website-should-actually-do",
    title: "What a church website should actually do beyond looking nice",
    excerpt:
      "A sermon archive and a giving button matter more than a hero image, even though the hero image is what gets noticed first.",
    category: "Institutional Platforms",
    publishedAt: "2026-04-08",
    content: [
      "Most church website briefs start with how it should look. That's understandable, but the sites that actually get used daily are built around three things that have nothing to do with visual design: can members find last week's sermon, can visitors see when and where to show up, and can giving happen without someone having to be physically present.",
      "A sermon archive that isn't scattered across a YouTube channel and three different social pages is worth more to a congregation than another homepage redesign. The same goes for online giving, it reaches members who've moved away, who are travelling, or who simply forgot their wallet that Sunday.",
      "None of this means design doesn't matter. It means design should serve those three functions first, and look good doing it, rather than the other way around.",
    ],
  },
  {
    slug: "how-to-brief-a-developer-properly",
    title: "How to brief a developer so you actually get what you need",
    excerpt:
      "The quality of what you get built is decided more by the brief than by the developer.",
    category: "Product Engineering",
    publishedAt: "2026-03-19",
    content: [
      "A vague brief produces a vague result, no matter how good the developer is. \"I want a modern website\" tells a builder almost nothing about what modern actually means to you, or what the site needs to do once it exists.",
      "The briefs that lead to the best outcomes answer three questions before a single design decision gets made: who is this for, what should they be able to do once they're on it, and how will you know it worked. A school admin needs different answers than a hotel manager, even if both start with \"I want a modern website.\"",
      "It's fine to not have all of this figured out before the first conversation. That's what a discovery call is for. The point is to treat that conversation as the most important part of the project, not a formality before the real work starts.",
    ],
  },
  {
    slug: "local-seo-that-actually-moves-the-needle",
    title: "Local SEO that actually moves the needle, not just checkboxes",
    excerpt:
      "Most local SEO advice is generic. Here's what actually changes whether someone finds you first.",
    category: "Ongoing Care",
    publishedAt: "2026-03-02",
    content: [
      "A lot of local SEO advice reads like a checklist written for anywhere in the world, meta tags, alt text, a sitemap. All correct, all necessary, and all insufficient on their own for a business trying to be found locally.",
      "What actually moves the needle for a local business is consistency: the same business name, address, and phone number everywhere it appears online, a Google Business Profile that's actually kept current, and pages that mention the specific city and neighborhood a customer would search for rather than vague regional language.",
      "SEO also isn't a one-time setup. It's closer to maintenance, the businesses that keep showing up are the ones that keep publishing something, updating something, or fixing something every few months, not the ones that did it once at launch and never touched it again.",
    ],
  },
  {
    slug: "why-dealerships-need-searchable-inventory",
    title: "Why car dealerships need a searchable inventory, not a photo gallery",
    excerpt:
      "A gallery shows what you have. A search filter tells a buyer whether it's worth their time to call.",
    category: "Commerce & Booking",
    publishedAt: "2026-02-14",
    content: [
      "A dealership site that's just a scrolling gallery of car photos puts all the filtering work on the buyer. They have to scroll through everything to find something in their price range, their preferred make, or their body type.",
      "A searchable inventory flips that. A buyer filters by what actually matters to them, price, make, year, availability, and only sees vehicles worth their attention. That difference alone changes who calls you: instead of general browsers, you get people who already know the specific vehicle they're asking about.",
      "The lead capture matters just as much as the search. A form attached to each individual vehicle, routed straight to the right salesperson at the right lot, turns interest into a conversation faster than a general \"contact us\" page ever will.",
    ],
  },
  {
    slug: "what-custom-web-application-actually-means",
    title: "What \"custom web application\" actually means, and when you need one",
    excerpt:
      "Not every business needs custom software. Here's how to tell the difference between a website problem and a software problem.",
    category: "Product Engineering",
    publishedAt: "2026-01-27",
    content: [
      "A website tells people about your business and lets them take a small number of predictable actions, book, buy, or get in touch. A custom web application is something different, it's software that runs part of how your business actually operates day to day.",
      "The signal that you need the second thing instead of the first is usually a process happening in spreadsheets or someone's memory that should be a system: inventory that three staff members update inconsistently, a booking calendar shared over WhatsApp, records that live in someone's head instead of a database.",
      "It's tempting to try to stretch a normal website into solving that kind of problem. It usually works for a while and then breaks at the worst possible moment, right when the business has grown enough that the workaround can't keep up. Recognizing that shift early is cheaper than recognizing it after it's already caused a problem.",
    ],
  },
];

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function fetchFromDb(): Promise<BlogPost[] | null> {
  try {
    const rows = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    if (rows.length === 0) return null;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content.split("\n\n").filter(Boolean),
      category: r.category ?? "General",
      publishedAt: toIsoDate(r.publishedAt ?? r.createdAt),
    }));
  } catch {
    return null;
  }
}

export async function getBlogPosts() {
  const posts = (await fetchFromDb()) ?? fallbackPosts;
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getBlogPostBySlug(slug: string) {
  const posts = (await fetchFromDb()) ?? fallbackPosts;
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getAllBlogSlugs() {
  const posts = (await fetchFromDb()) ?? fallbackPosts;
  return posts.map((p) => p.slug);
}
