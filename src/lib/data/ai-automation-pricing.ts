// AI Automation is a service line scoped per client and never priced on
// the site, in any currency — no standardPrice/launchPrice fields here on
// purpose, and no entry in pricing-international.ts. The number is agreed
// on the scoping call. Copy is written for clients, in plain English: no
// technical terms like "RAG" or "RBAC".

export type AiAutomationTier = {
  id: string;
  name: string;
  audience: string;
  summary: string;
  inclusions: string[];
};

export const aiAutomationTiers: AiAutomationTier[] = [
  {
    id: "starter-ai",
    name: "Starter AI",
    audience: "Small businesses & solo operators",
    summary:
      "One clear job, done properly: answering customers, helping with bookings, or sorting serious enquiries from casual ones, trained on your own business information, not a generic bot.",
    inclusions: [
      "A discovery call to pick the one job it will do: answering customer questions, helping with bookings, sorting serious enquiries, or handling reviews",
      "Trained on your own FAQs, documents, menu or policies, so it answers the way your business would",
      "Works on your website plus one messaging app (WhatsApp or Instagram DM)",
      "A chat window designed to match your website's look",
      "Hands over to you whenever it isn't sure, so customers are never left without an answer",
      "Every conversation saved, so you can see exactly what customers are asking",
      "One full round of adjusting its tone and answers after real customers start using it",
      "A short setup call for you or your staff, plus a written quick-start guide",
      "30 days of adjustments after launch at no extra cost",
      "A monthly report on how much it was used and whether it stayed online",
    ],
  },
  {
    id: "growth-ai",
    name: "Growth AI",
    audience: "Medium businesses, multi-location or multi-department",
    summary:
      "AI built into how your business actually runs, connected to the tools you already use, not just a chat window added to the homepage.",
    inclusions: [
      "Everything in Starter AI, across several branches or departments",
      "Connected to the systems you already use (customer records, bookings, stock, schedules) so it can get real work done, not just answer questions",
      "Website, WhatsApp, email and SMS messages in one shared inbox, where your team can take over any conversation at any time",
      "A staff assistant that answers questions from your own manuals and policies, so new staff get up to speed faster",
      "Information pulled out of forms, applications or receipts automatically, so nobody has to retype it",
      "Automatic reminders before appointments and follow-ups for people who missed one or went quiet",
      "Conversation steps designed around your own process, such as multi-step bookings or checking who qualifies for financing",
      "A dashboard showing how many conversations the AI handled, how many it resolved, and when it passed one to a person",
      "A training session showing your staff how to review and correct the AI over time",
      "60 days of adjustments after launch, plus one scheduled review call",
      "Priority support during setup and the first month live",
    ],
  },
  {
    id: "enterprise-ai",
    name: "Enterprise AI",
    audience: "Institutions & company-size organizations",
    summary:
      "Built to the same security standard as the rest of your systems, for hospitals, large organizations, and institutions with strict rules about how data is handled.",
    inclusions: [
      "Everything in Growth AI, across your whole organization",
      "An assistant that answers from your own private documents (policy manuals, procedures, case files) and shows which document each answer came from",
      "Each person only sees what their role allows, and every AI conversation and action is recorded so you can always check who did what",
      "AI that can carry out tasks in your internal systems (making bookings, updating records, sending notifications), with your team approving anything important",
      "Replies automatically in each customer's or staff member's own language",
      "Spotting unusual transactions or claims that might be fraud or mistakes, where that applies",
      "Ask questions about your reports and dashboards in plain English and get straight answers",
      "Keeps its knowledge up to date automatically as your documents change",
      "A formal security review and a written data-handling agreement before anything goes live",
      "Rolled out in stages: one department or branch first, then everywhere once it's proven",
      "One dedicated contact person throughout the build, and a clear support period after launch",
      "Ongoing upkeep available on a monthly arrangement after launch",
    ],
  },
];
