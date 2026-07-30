import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The studio, the standard, and the story behind NOBS AGENT.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        About
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        Built like a product team. Run like a single point of contact.
      </h1>

      <div className="mt-10 space-y-5 text-[var(--color-slate)]">
        <p>
          NOBS AGENT exists because the institutions that keep a community running,
          schools, hospitals, hotels, churches, dealerships, are usually offered two bad
          options. A cheap template that breaks under real use, or an agency quote sized
          for a bank. Neither respects what the work actually requires.
        </p>
        <p>
          I run every project the way a well-resourced product team would. Proper
          architecture, a real database behind the content, security treated as a
          requirement rather than an afterthought, and a system the client can actually
          operate once I&apos;m gone. Not a website that only I know how to update.
        </p>
        <p>
          Every engagement ends with documentation, an admin dashboard the client&apos;s
          own staff can use, and a maintenance plan. The goal isn&apos;t to hand over a
          launch. It&apos;s to hand over infrastructure.
        </p>
      </div>

      <h2 className="mt-16 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        What I bring to a project
      </h2>
      <div className="glass space-y-4 rounded-2xl p-8 text-[var(--color-slate)]">
        <p>
          I handle a project end to end, from the first architecture decision to the
          server it ends up running on. I design the database and the solution
          architecture before I write a line of interface code, so the system holds up
          once real people and real data are pushing on it, not just at launch.
        </p>
        <p>
          On the frontend, I build with React, Next.js, and TypeScript. On the backend,
          Node.js and PostgreSQL, with proper API design underneath. I design the
          interface and the system architecture together rather than treating one as an
          afterthought to the other, and I set up deployment on Vercel or Cloudflare so
          the site is genuinely production ready, not just running on my laptop.
        </p>
        <p>
          When a project needs to take money, I wire up Paystack, Flutterwave, or
          Stripe, whichever fits the client&apos;s actual customers. Security isn&apos;t
          a separate phase I bolt on at the end, it&apos;s part of how the system gets
          built from the start, hardened and checked before anything goes live. The same
          goes for SEO and performance, both are built in rather than patched on
          afterward.
        </p>
        <p>
          What all of this adds up to is simple. A client should never need to call me
          for something their own staff can be trusted to handle, and the system should
          still be running well long after the invoice is paid.
        </p>
      </div>
    </div>
  );
}
