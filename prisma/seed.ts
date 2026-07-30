/**
 * Seed script, populates sample data so the site isn't empty on first run.
 * Run with: npm run prisma:seed  (requires `tsx`: npm i -D tsx)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Accounts -----------------------------------------------------
  // CHANGE THESE PASSWORDS before running against a real database,
  // these are seed defaults for local development only.
  const adminPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@nobsagent.com" },
    create: {
      name: "Studio Admin",
      email: "admin@nobsagent.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    update: {},
  });

  const clientPasswordHash = await bcrypt.hash("ChangeMe123!", 12);
  // Kept as a bare test account with no projects attached, lets the
  // studio owner log into /portal himself to see the client-side
  // experience before any real client is onboarded. No fake project,
  // client, or testimonial is seeded, those get added for real via
  // /admin/portfolio and /admin/clients.
  await prisma.user.upsert({
    where: { email: "client-test@nobsagent.com" },
    create: {
      name: "Test Client",
      email: "client-test@nobsagent.com",
      passwordHash: clientPasswordHash,
      role: "CLIENT",
    },
    update: {},
  });

  await prisma.service.createMany({
    data: [
      { name: "School Portals", slug: "school-portals", category: "institutional", description: "Admissions, fees, and academic records in one system.", startingPrice: 1500000 },
      { name: "Hospital Systems", slug: "hospital-systems", category: "institutional", description: "Patient records, scheduling, and billing.", startingPrice: 2500000 },
      { name: "Hotel Booking", slug: "hotel-booking", category: "commerce", description: "Direct booking engine with payments.", startingPrice: 1200000 },
      { name: "Business Websites", slug: "business-websites", category: "corporate", description: "A professional web presence built to convert.", startingPrice: 450000 },
    ],
  });

  await prisma.pricingPlan.createMany({
    data: [
      { name: "Starter", description: "A professional presence for a business that needs to be found and trusted.", price: 450000, interval: "one-time", features: ["Up to 5 pages", "Contact form", "Basic SEO"], order: 1 },
      { name: "Growth", description: "For businesses that need a real content management layer and payments.", price: 1200000, interval: "one-time", features: ["Up to 15 pages", "CMS admin access", "Payment integration"], highlighted: true, order: 2 },
      { name: "Institutional", description: "Custom portals for schools, hospitals, and multi-role organizations.", price: 2500000, interval: "one-time", features: ["Custom portal", "Role-based accounts", "Ongoing support"], order: 3 },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Why most school portals fail in year two",
        slug: "why-school-portals-fail-in-year-two",
        excerpt: "Launch day is the easy part. Here's what actually determines whether a portal is still in use twelve months later.",
        content: [
          "Most school portal projects fail quietly. They launch well, parents log in during the first admissions cycle, staff are trained, everyone is satisfied. Then six months pass, a staff member who understood the system leaves, and the portal slowly reverts to spreadsheets.",
          "The pattern is almost never a technology failure. It's an ownership failure. The system was built for the person who commissioned it, not for whoever inherits it.",
          "The fix is structural, not technical: every institutional platform needs at least two trained internal owners from day one, documentation written for a non-technical reader, and an admin dashboard that doesn't require a developer for routine changes. Build for succession, not just for launch.",
        ].join("\n\n"),
        category: "Institutional Platforms",
        published: true,
        publishedAt: new Date("2026-05-14"),
      },
      {
        title: "The real math behind direct booking engines",
        slug: "direct-booking-vs-ota-commission-math",
        excerpt: "OTA commissions look small per booking. Over a year, they're usually the difference between a good margin and a break-even one.",
        content: [
          "A 15-20% commission on every third-party booking sounds manageable until you total it against annual revenue. For a mid-sized hotel doing significant volume through OTAs, that commission is frequently larger than the entire marketing budget.",
          "A direct booking engine doesn't need to replace OTA channels, it needs to convert the guests who already know your name. Repeat guests, referrals, and anyone who found you through search should never be paying an OTA a cut on your behalf.",
          "The engines that actually shift booking mix share three traits: real-time availability synced with the OTA calendar, a checkout that takes under two minutes, and a reason to book direct, a small discount or an amenity the OTA listing can't offer.",
        ].join("\n\n"),
        category: "Commerce & Booking",
        published: true,
        publishedAt: new Date("2026-04-02"),
      },
      {
        title: "What a good admin dashboard should never require",
        slug: "what-an-admin-dashboard-should-never-require",
        excerpt: "If updating your own homepage needs a developer, the dashboard didn't do its job.",
        content: [
          "The test I use for every admin dashboard I build: could the person who runs day-to-day operations change a homepage headline, swap a photo, or update a price without calling me? If the answer is no, the dashboard isn't finished.",
          "This sounds obvious, but it's the single most common gap in commissioned websites, an agency ships something polished, then every future change routes back through a support ticket and an invoice.",
          "The underlying discipline is simple: no text lives only in component code. Every visible string reads from a content table an admin can edit. It costs more time up front and pays for itself the first time a client needs an urgent change on a weekend.",
        ].join("\n\n"),
        category: "Product Engineering",
        published: true,
        publishedAt: new Date("2026-02-19"),
      },
      {
        title: "Hotels and restaurants don't need a website. They need a booking system.",
        slug: "hotels-restaurants-need-booking-systems-not-websites",
        excerpt: "A beautiful page that can't take a reservation is a brochure, not a business tool.",
        content: [
          "A restaurant or hotel website with no way to actually book is solving the wrong problem. Guests don't visit your site to admire the photography, they visit to answer one question: can I get a table or a room, and how do I lock it in right now.",
          "Every extra step between a guest deciding to book and them actually confirming is a chance to lose them to whichever competitor made it easier. A phone number in the footer is not a booking system. A booking system holds real-time availability, takes a deposit, and sends a confirmation without a human needing to be watching an inbox.",
          "This is also where a lot of budget gets wasted on the wrong priority. A gorgeous homepage with a broken booking flow converts worse than a plain page with a booking flow that actually works. Build the function first, then make it beautiful.",
        ].join("\n\n"),
        category: "Commerce & Booking",
        published: true,
        publishedAt: new Date("2026-06-18"),
      },
      {
        title: "What makes a hospital records system different from a school portal",
        slug: "hospital-records-system-vs-school-portal",
        excerpt: "They look similar on a slide deck. They are not similar to build, and treating them the same is how projects go over budget.",
        content: [
          "On paper, a hospital system and a school portal sound like the same idea. Different people, different roles, records that need to be looked up quickly. In practice, the two have almost nothing in common once you get past the surface.",
          "A school portal's biggest risk is convenience failing, parents getting frustrated, staff going back to spreadsheets. A hospital system's biggest risk is a wrong record costing someone their health. That difference changes everything about how the system gets built. Patient data needs stricter access controls, audit trails on every view and edit, and a much lower tolerance for ambiguity in who can see what.",
          "If a developer quotes a hospital records system the same way they'd quote a school portal, that's usually a sign they haven't built one before. The extra rigor costs more time upfront. It's not optional.",
        ].join("\n\n"),
        category: "Institutional Platforms",
        published: true,
        publishedAt: new Date("2026-06-05"),
      },
      {
        title: "Paystack vs Flutterwave vs Stripe, picked properly",
        slug: "paystack-vs-flutterwave-vs-stripe",
        excerpt: "The right payment provider depends on where your customers actually are, not which one has the nicest dashboard.",
        content: [
          "Every one of these three processes payments reliably. The decision isn't really about reliability, it's about who your customers are and where their money already lives.",
          "For a business collecting naira from customers inside Nigeria, Paystack is usually the simplest path, fast local payouts and a setup most Nigerian customers already trust from other sites. Flutterwave covers similar ground with broader reach across African currencies, useful if you're expecting customers from more than one country on the continent. Stripe makes the most sense when a meaningful share of your customers are paying in dollars, pounds, or euros from outside Africa.",
          "Most of the projects I build start with one provider live at launch and add a second only once there's an actual customer base that needs it. Wiring up three payment providers before you have paying customers is effort spent in the wrong place.",
        ].join("\n\n"),
        category: "Commerce & Booking",
        published: true,
        publishedAt: new Date("2026-05-28"),
      },
      {
        title: "Why your business needs a WhatsApp button, not just a contact form",
        slug: "why-you-need-a-whatsapp-button-not-just-a-contact-form",
        excerpt: "In most of the markets I build for, a contact form is where inquiries go to die. WhatsApp is where they actually get answered.",
        content: [
          "A contact form assumes the visitor is willing to type a formal message, wait an unknown amount of time, and hope someone checks the inbox. That's a fine assumption in some markets. It's a bad one in most of the ones I build for, where WhatsApp is already how people expect to reach a business.",
          "The fix isn't complicated: a floating WhatsApp button that's visible on every page, pre-filled with a sensible starting message, so a visitor is one tap away from a real conversation instead of a form they're not sure will be read.",
          "Contact forms still matter, some inquiries genuinely need to be written down and routed properly, and not everyone wants to text a stranger. The point isn't to replace the form. It's to stop making WhatsApp an afterthought when it's often the channel that actually converts.",
        ].join("\n\n"),
        category: "Corporate & Brand",
        published: true,
        publishedAt: new Date("2026-05-11"),
      },
      {
        title: "The real cost of a cheap website (and what it costs later)",
        slug: "the-real-cost-of-a-cheap-website",
        excerpt: "The lowest quote is rarely the lowest total cost. It just moves the cost to a date you haven't hit yet.",
        content: [
          "A cheap website is easy to spot after the fact: it's the one that needed a full rebuild eighteen months later because it couldn't handle a feature the business now actually needs, or because whoever built it is no longer reachable.",
          "The upfront price of a website mostly reflects how much thinking went into the parts you can't see, the data structure, the admin tooling, whether the code is something another developer could pick up later. Skipping that thinking is exactly how a project gets cheaper today and dramatically more expensive the day something needs to change.",
          "The honest question to ask any quote isn't just what it costs to build. It's what it costs to change something in a year. A quote that hasn't thought about that question yet usually hasn't thought about much beyond the launch date.",
        ].join("\n\n"),
        category: "Corporate & Brand",
        published: true,
        publishedAt: new Date("2026-04-22"),
      },
      {
        title: "What a church website should actually do beyond looking nice",
        slug: "what-a-church-website-should-actually-do",
        excerpt: "A sermon archive and a giving button matter more than a hero image, even though the hero image is what gets noticed first.",
        content: [
          "Most church website briefs start with how it should look. That's understandable, but the sites that actually get used daily are built around three things that have nothing to do with visual design: can members find last week's sermon, can visitors see when and where to show up, and can giving happen without someone having to be physically present.",
          "A sermon archive that isn't scattered across a YouTube channel and three different social pages is worth more to a congregation than another homepage redesign. The same goes for online giving, it reaches members who've moved away, who are travelling, or who simply forgot their wallet that Sunday.",
          "None of this means design doesn't matter. It means design should serve those three functions first, and look good doing it, rather than the other way around.",
        ].join("\n\n"),
        category: "Institutional Platforms",
        published: true,
        publishedAt: new Date("2026-04-08"),
      },
      {
        title: "How to brief a developer so you actually get what you need",
        slug: "how-to-brief-a-developer-properly",
        excerpt: "The quality of what you get built is decided more by the brief than by the developer.",
        content: [
          "A vague brief produces a vague result, no matter how good the developer is. \"I want a modern website\" tells a builder almost nothing about what modern actually means to you, or what the site needs to do once it exists.",
          "The briefs that lead to the best outcomes answer three questions before a single design decision gets made: who is this for, what should they be able to do once they're on it, and how will you know it worked. A school admin needs different answers than a hotel manager, even if both start with \"I want a modern website.\"",
          "It's fine to not have all of this figured out before the first conversation. That's what a discovery call is for. The point is to treat that conversation as the most important part of the project, not a formality before the real work starts.",
        ].join("\n\n"),
        category: "Product Engineering",
        published: true,
        publishedAt: new Date("2026-03-19"),
      },
      {
        title: "Local SEO that actually moves the needle, not just checkboxes",
        slug: "local-seo-that-actually-moves-the-needle",
        excerpt: "Most local SEO advice is generic. Here's what actually changes whether someone finds you first.",
        content: [
          "A lot of local SEO advice reads like a checklist written for anywhere in the world, meta tags, alt text, a sitemap. All correct, all necessary, and all insufficient on their own for a business trying to be found locally.",
          "What actually moves the needle for a local business is consistency: the same business name, address, and phone number everywhere it appears online, a Google Business Profile that's actually kept current, and pages that mention the specific city and neighborhood a customer would search for rather than vague regional language.",
          "SEO also isn't a one-time setup. It's closer to maintenance, the businesses that keep showing up are the ones that keep publishing something, updating something, or fixing something every few months, not the ones that did it once at launch and never touched it again.",
        ].join("\n\n"),
        category: "Ongoing Care",
        published: true,
        publishedAt: new Date("2026-03-02"),
      },
      {
        title: "Why car dealerships need a searchable inventory, not a photo gallery",
        slug: "why-dealerships-need-searchable-inventory",
        excerpt: "A gallery shows what you have. A search filter tells a buyer whether it's worth their time to call.",
        content: [
          "A dealership site that's just a scrolling gallery of car photos puts all the filtering work on the buyer. They have to scroll through everything to find something in their price range, their preferred make, or their body type.",
          "A searchable inventory flips that. A buyer filters by what actually matters to them, price, make, year, availability, and only sees vehicles worth their attention. That difference alone changes who calls you: instead of general browsers, you get people who already know the specific vehicle they're asking about.",
          "The lead capture matters just as much as the search. A form attached to each individual vehicle, routed straight to the right salesperson at the right lot, turns interest into a conversation faster than a general \"contact us\" page ever will.",
        ].join("\n\n"),
        category: "Commerce & Booking",
        published: true,
        publishedAt: new Date("2026-02-14"),
      },
      {
        title: "What \"custom web application\" actually means, and when you need one",
        slug: "what-custom-web-application-actually-means",
        excerpt: "Not every business needs custom software. Here's how to tell the difference between a website problem and a software problem.",
        content: [
          "A website tells people about your business and lets them take a small number of predictable actions, book, buy, or get in touch. A custom web application is something different, it's software that runs part of how your business actually operates day to day.",
          "The signal that you need the second thing instead of the first is usually a process happening in spreadsheets or someone's memory that should be a system: inventory that three staff members update inconsistently, a booking calendar shared over WhatsApp, records that live in someone's head instead of a database.",
          "It's tempting to try to stretch a normal website into solving that kind of problem. It usually works for a while and then breaks at the worst possible moment, right when the business has grown enough that the workaround can't keep up. Recognizing that shift early is cheaper than recognizing it after it's already caused a problem.",
        ].join("\n\n"),
        category: "Product Engineering",
        published: true,
        publishedAt: new Date("2026-01-27"),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.siteContent.createMany({
    data: [
      { page: "home", key: "hero.title", value: "Institutions building their next chapter deserve infrastructure, not templates." },
      { page: "home", key: "hero.subtitle", value: "I design and build the websites, portals, and systems that schools, hospitals, hotels, dealerships, and growing businesses run on." },
      { page: "home", key: "cta.title", value: "Tell me what you're building." },
      { page: "footer", key: "tagline", value: "Digital infrastructure for growing institutions." },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete. Admin login: admin@nobsagent.com / ChangeMe123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
