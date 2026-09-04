// Single source of truth for the Referral Partner Agreement text, used by
// both the PDF generator (src/lib/referral-agreement-pdf.ts) and the public
// reference page (src/app/partner/agreement/page.tsx) — a legal document
// must never have two independently-maintained copies of its own wording.
//
// Rebuilt from the original Referral_Partner_Agreement_Branded.docx, with
// two changes reflecting what's actually shipped: (1) the commission
// section now describes the real repeating 10%-then-20% tier structure and
// the Paystack auto-split instead of a flat 10% manually paid, and (2) a
// new clause 3.5 requiring the signed copy back within 7 days of account
// creation — this clause did not exist in the original document at all,
// it's a new addition pending the account owner's sign-off on its wording.

export type AgreementSection = {
  number: string;
  title: string;
  paragraphs: string[];
};

export const AGREEMENT_SECTIONS: AgreementSection[] = [
  {
    number: "1",
    title: "Background and Purpose",
    paragraphs: [
      '1.1  The Company provides web and software development, design, and related digital services to clients ("Services").',
      "1.2  The Referrer wishes to introduce prospective clients to the Company in exchange for a commission on Services successfully sold and paid for as a result of such introductions.",
      "1.3  This Agreement sets out the terms on which the Referrer may refer prospective clients to the Company and the basis on which commission will be calculated, earned, and paid.",
    ],
  },
  {
    number: "2",
    title: "Nature of Relationship",
    paragraphs: [
      "2.1  The Referrer is an independent, non-exclusive referral partner. Nothing in this Agreement shall be construed to create a partnership, joint venture, agency, franchise, or employment relationship between the Parties.",
      "2.2  The Referrer has no authority, express or implied, to act on behalf of the Company, to make representations, warranties, or commitments on the Company's behalf, to negotiate or agree pricing or scope with any client, to sign contracts, accept payments, or bind the Company in any way.",
      "2.3  The Referrer is solely responsible for their own tax obligations, including declaration and payment of any applicable personal income tax on commissions earned under this Agreement. The Company shall not withhold any statutory deductions unless required to do so by applicable Nigerian law, in which case such deductions shall be disclosed to the Referrer.",
      "2.4  This arrangement is non-exclusive. The Referrer is free to refer prospective clients to other agencies, freelancers, or service providers, including competitors of the Company, and the Company is free to work with other referral partners.",
    ],
  },
  {
    number: "3",
    title: "Referral Process",
    paragraphs: [
      "3.1  To qualify for commission, the Referrer must submit each referral in writing (via WhatsApp, email, or the Company's designated referral form) before the Company's first substantive contact with the prospective client. Each referral must include, at minimum, the prospective client's full name, business name (if applicable), contact details, and a brief description of the client's need.",
      '3.2  The Company will acknowledge receipt of each referral within a reasonable time and confirm whether the referral is accepted as a "Qualified Referral" under this Agreement.',
      "3.3  A referral will NOT be treated as a Qualified Referral, and no commission shall be payable, where:",
      "(a) the prospective client is already an existing client of the Company, or was already in active discussion, proposal, or negotiation with the Company prior to the referral being submitted;",
      "(b) the prospective client was independently sourced by the Company or referred by another party prior to the Referrer's submission;",
      "(c) the referral information provided is materially false, misleading, or submitted in bad faith;",
      "(d) the referral is submitted after this Agreement has been terminated, except where clause 7.4 applies.",
      "3.4  Referrals are tracked automatically through the Company's referral platform once the Referrer shares their unique referral link or code; a prospective client who signs up through that link or code is treated as having been referred in writing for the purposes of clause 3.1.",
      "3.5  The Referrer shall submit a signed copy of this Agreement to the Company by email within seven (7) days of creating a referral partner account on the Company's platform. The Company may, at its sole discretion, suspend or disqualify a referral partner account for which a signed Agreement has not been received within this period.",
    ],
  },
  {
    number: "4",
    title: "Commission Structure",
    paragraphs: [
      "4.1  Commission Rate: The Referrer earns commission on the total contract value actually paid by each Qualified Referral that results in a signed agreement and paid engagement with the Company (a \"Successful Referral\"), calculated on a repeating fifteen-referral cycle measured across the lifetime of this Agreement: the Referrer's 1st through 10th Successful Referrals in the cycle each earn a flat commission of ten percent (10%); the 11th through 15th each earn a flat commission of twenty percent (20%); the cycle then repeats (the 16th through 25th at 10%, the 26th through 30th at 20%, and so on) for as long as this Agreement remains in effect.",
      "4.2  Rate Locked at Qualification: The commission rate applicable to a given referral is determined by, and permanently fixed at, the Referrer's position in the cycle at the moment that referral's first payment is received by the Company. A referral's rate is not affected by the Referrer's position in the cycle changing afterward, whether upward into the 20% tier or back down to 10% at the start of a new cycle.",
      "4.3  Basis of Calculation: Commission is calculated on amounts actually received by the Company from the client, exclusive of any applicable taxes, transaction fees, or third-party payment processing charges deducted at source. Commission is not calculated on quoted, invoiced, or outstanding amounts that have not yet been paid.",
      "4.4  Payment Method: (a) Automatic portion: ten percent (10%) of each payment received from a Successful Referral is paid automatically and directly to the Referrer's nominated bank account via the Company's payment processor's split-payment functionality, at the same time the Company receives the client's payment, once the Referrer has completed payout setup on the Company's referral portal. (b) Manual portion: where a referral falls within the 20% tier described in clause 4.1, the additional ten percent (10%) above the automatic portion is paid manually by the Company via bank transfer within fourteen (14) days of the Company's receipt of the relevant payment. (c) Until the Referrer completes payout setup on the Company's referral portal, the Referrer's full commission is paid manually by bank transfer within fourteen (14) days of receipt, in accordance with sub-clause (b).",
      "4.5  No Advance or Guaranteed Commission: Commission is earned only as and when the client actually pays the Company. The Referrer has no entitlement to commission on unpaid, cancelled, disputed, or refunded amounts. Because commission tracks actual payments received rather than being paid upfront, no clawback mechanism is required: if a client cancels, fails to pay, or receives a refund before full payment is made, the Referrer simply does not earn commission on the unpaid portion.",
      "4.6  Currency: Commission is paid in the same currency in which the Company receives payment from the client, unless otherwise agreed in writing.",
      "4.7  Statements: The Company shall, upon reasonable written request (no more than once per calendar quarter), provide the Referrer with a summary statement of commissions earned and paid in respect of their referrals. The Referrer may also view this information at any time on their dashboard on the Company's referral platform.",
    ],
  },
  {
    number: "5",
    title: "Confidentiality",
    paragraphs: [
      "5.1  The Referrer shall keep confidential any non-public information disclosed by the Company in connection with this Agreement, including client details, pricing, business strategy, and proprietary methods, and shall not disclose such information to any third party without the Company's prior written consent, except as required by law.",
      "5.2  This confidentiality obligation shall survive termination of this Agreement indefinitely with respect to trade secrets, and for a period of two (2) years with respect to other confidential information.",
    ],
  },
  {
    number: "6",
    title: "Conduct and Compliance",
    paragraphs: [
      "6.1  The Referrer shall conduct all referral activity honestly, professionally, and in a manner that does not misrepresent the Company's Services, pricing, or capabilities.",
      "6.2  The Referrer shall not make any promises, guarantees, or commitments to prospective clients on the Company's behalf, including as to price, timeline, or scope of work.",
      "6.3  The Referrer shall not offer, solicit, or accept any bribe, kickback, or improper payment in connection with referrals made under this Agreement, and shall comply with all applicable Nigerian anti-corruption laws, including the Corrupt Practices and Other Related Offences Act and the Money Laundering (Prevention and Prohibition) Act.",
      "6.4  The Referrer shall not disparage the Company or interfere with the Company's relationship with any client, whether referred by the Referrer or otherwise.",
    ],
  },
  {
    number: "7",
    title: "Term and Termination",
    paragraphs: [
      "7.1  This Agreement commences on the Effective Date and continues until terminated by either Party in accordance with this clause.",
      "7.2  Either Party may terminate this Agreement at any time, for any reason, by giving fourteen (14) days' written notice to the other Party.",
      "7.3  The Company may terminate this Agreement immediately, without notice, if the Referrer breaches clause 5 (Confidentiality) or clause 6 (Conduct and Compliance), or engages in fraudulent or dishonest conduct in connection with this Agreement.",
      "7.4  Termination shall not affect commission already earned (i.e., amounts already paid by the client to the Company) prior to the effective date of termination. Where a Qualified Referral was submitted and accepted before termination but the client has not yet signed or paid at the time of termination, the Company shall, at its sole discretion acting reasonably, determine whether that referral remains eligible for commission if it later converts, having regard to how much work the Referrer actually did to bring it to that point.",
    ],
  },
  {
    number: "8",
    title: "Indemnity and Limitation of Liability",
    paragraphs: [
      "8.1  The Referrer shall indemnify and hold harmless the Company against any claims, losses, damages, or liabilities arising from the Referrer's breach of this Agreement, misrepresentation to a prospective client, or any unauthorized statement or commitment made on the Company's behalf.",
      "8.2  In no event shall the Company's total liability to the Referrer under this Agreement exceed the total commission actually paid to the Referrer in the twelve (12) months preceding the event giving rise to the claim.",
      "8.3  Neither Party shall be liable to the other for indirect, incidental, or consequential losses arising from this Agreement.",
    ],
  },
  {
    number: "9",
    title: "Dispute Resolution",
    paragraphs: [
      "9.1  The Parties shall first attempt to resolve any dispute arising from or relating to this Agreement through good-faith negotiation within twenty-one (21) days of written notice of the dispute.",
      "9.2  If the dispute is not resolved through negotiation, it shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Mediation Act 2023 (or its successor legislation), by a single arbitrator agreed by the Parties, or in default of agreement within fourteen (14) days, appointed by the Chartered Institute of Arbitrators (Nigeria Branch). The seat of arbitration shall be Kaduna, Kaduna State, Nigeria, and the language of the arbitration shall be English.",
      "9.3  Nothing in this clause prevents either Party from seeking urgent injunctive or equitable relief from a court of competent jurisdiction in Nigeria, including to protect confidential information, pending resolution of arbitration.",
    ],
  },
  {
    number: "10",
    title: "Governing Law",
    paragraphs: [
      "10.1  This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.",
    ],
  },
  {
    number: "11",
    title: "General Provisions",
    paragraphs: [
      "11.1  Entire Agreement: This Agreement constitutes the entire agreement between the Parties in relation to its subject matter and supersedes all prior discussions, understandings, or agreements, whether oral or written.",
      "11.2  Amendment: This Agreement may only be amended by a written instrument signed by both Parties.",
      "11.3  Assignment: The Referrer may not assign or transfer this Agreement or any rights under it without the Company's prior written consent. The Company may assign this Agreement in connection with a merger, acquisition, or sale of substantially all of its business.",
      "11.4  Severability: If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect, and the invalid provision shall be replaced with a valid provision that most closely reflects the Parties' original intent.",
      "11.5  No Waiver: Failure by either Party to enforce any provision of this Agreement shall not be construed as a waiver of that provision or any other provision.",
      "11.6  Notices: Any notice under this Agreement shall be in writing and delivered by email or WhatsApp to the contact details provided by each Party, and shall be deemed received on the next business day.",
      "11.7  Force Majeure: Neither Party shall be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, government action, internet or power outages, or civil unrest.",
      "11.8  Counterparts: This Agreement may be executed in counterparts, including by electronic signature, each of which shall be deemed an original, and all of which together shall constitute one instrument.",
    ],
  },
  {
    number: "12",
    title: "Acknowledgement",
    paragraphs: [
      "By signing below, each Party acknowledges that they have read, understood, and agree to be bound by the terms of this Agreement.",
    ],
  },
];

export const COMPANY_SIGNATORY_NAME = "Nobert Agu";
export const COMPANY_SIGNATORY_TITLE = "Founder";

export const AGREEMENT_INTRO_PARAGRAPHS = [
  'This Referral Partner Agreement ("Agreement") is made and entered into by and between:',
  `NOBS AGENT, a digital agency with its principal place of business at Kaduna, Kaduna State, Nigeria, represented herein by ${COMPANY_SIGNATORY_NAME} ("the Company", "NOBS AGENT", "we", "us", or "our");`,
  'AND the Referrer named below ("the Referrer", "Partner", "you"), (each individually a "Party" and collectively the "Parties").',
];
