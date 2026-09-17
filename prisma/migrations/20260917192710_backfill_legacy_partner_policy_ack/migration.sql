-- Data-only migration, no schema change.
--
-- 20260914192547_partner_inactivity_policy_ack added inactivityPolicyAckAt
-- with no backfill, so every ReferralPartner that already existed before
-- that policy screen (/partner/policy) was ever shown to anyone sat at
-- NULL — even though they'd never had a chance to see or tick it, since
-- it didn't exist yet at their signup time. That NULL was never meant to
-- mean "hasn't agreed" for them, only "predates this feature entirely."
--
-- getReferralPartnerCount() (src/lib/referral-partner-capacity.ts) was
-- later changed to exclude any partner with inactivityPolicyAckAt still
-- NULL, to stop an abandoned brand-new signup from occupying a capacity
-- slot. That's correct for a signup after the policy screen existed, but
-- it wrongly swept up every pre-existing partner who simply hadn't
-- happened to revisit their dashboard since Sept 14 — dropping the admin
-- overview's "Referral partners" count from the real number down to just
-- whoever had logged back in and ticked the box. It also meant any of
-- those existing, already-active partners would hit a surprise one-time
-- consent interruption next time they opened their dashboard.
--
-- This backfills exactly the partners affected: created strictly before
-- the policy-ack column existed, still unacknowledged. Stamped with their
-- own createdAt rather than NOW(), so the timestamp reads as "always
-- true," not "just agreed today." Anyone created on or after that moment
-- had the real, working /partner/policy redirect at signup — a NULL for
-- them is a genuine incomplete signup, correctly left alone here.
UPDATE "ReferralPartner"
SET "inactivityPolicyAckAt" = "createdAt"
WHERE "inactivityPolicyAckAt" IS NULL
  AND "createdAt" < '2026-09-14 19:25:47'::timestamp;
