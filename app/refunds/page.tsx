import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  REPLATE_SUPPORT_EMAIL,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — RePlate',
  description: 'Rules governing order cancellations, merchant unavailability, quality refunds, and dispute resolution.',
};

const sections = [
  { id: 'overview', title: 'Policy Overview' },
  { id: 'customer-cancellation', title: 'Customer Cancellations' },
  { id: 'business-cancellation', title: 'Merchant Unavailability & Store Cancellation' },
  { id: 'missed-pickup', title: 'Missed Pickup & Expired Orders' },
  { id: 'quality-issues', title: 'Quality, Wrong Item & Food Safety Refunds' },
  { id: 'refund-methods', title: 'Refund Processing & Timelines' },
  { id: 'dispute-redressal', title: 'Dispute Resolution Process' },
];

export default function RefundPolicyPage() {
  const meta = LEGAL_POLICY_METADATA.refunds;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="Clear, fair rules regarding cancellations, counter pickups, store stockouts, and refund eligibility."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="overview" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Policy Overview</h2>
        <p>
          RePlate connects consumers with time-sensitive surplus food offered by local food businesses. Because surplus food is prepared in limited quantities and held within tight operational windows, this Policy outlines when cancellations and refunds are permitted.
        </p>
      </section>

      <section id="customer-cancellation" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. Customer Cancellations</h2>
        <p>
          Customers may cancel a reservation within <strong>10 minutes</strong> of booking, provided the scheduled pickup window has not already commenced. Once food preparation/packaging has completed or the pickup deadline is within 30 minutes, reservations cannot be cancelled to prevent food waste.
        </p>
      </section>

      <section id="business-cancellation" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. Merchant Unavailability & Store Cancellation</h2>
        <p>
          If a partner business runs out of surplus stock unexpectedly, closes early, or cannot fulfill your reserved order, the order will be cancelled immediately with zero penalty to the customer and a <strong>100% full refund</strong> (where pre-payment applies) or zero counter charge.
        </p>
      </section>

      <section id="missed-pickup" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Missed Pickup & Expired Orders</h2>
        <p>
          Customers must collect their reserved food items before the stated pickup deadline. If a customer fails to arrive within the pickup window without prior notice, the reservation is marked Expired, and the business may dispose of or re-allocate the item.
        </p>
      </section>

      <section id="quality-issues" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Quality, Wrong Item & Food Safety Refunds</h2>
        <p>You are eligible for a full review and resolution if:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>The food handed over was incorrect or significantly mismatched with the listing description.</li>
          <li>The food item exhibits genuine quality or freshness defects.</li>
          <li>The business charged an amount differing from the agreed discounted price.</li>
        </ul>
        <p className="text-xs text-muted-foreground">
          To request review, click <strong>&quot;Report an Issue&quot;</strong> on your order confirmation page within 2 hours of pickup.
        </p>
      </section>

      <section id="refund-methods" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Refund Processing & Timelines</h2>
        <p>
          For digital transactions, approved refunds are initiated back to the original payment source within 24 to 48 hours. Actual credit reflection may take 3 to 7 business days depending on your bank and payment gateway processing timelines.
        </p>
      </section>

      <section id="dispute-redressal" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">7. Dispute Resolution Process</h2>
        <p>
          If an amicable resolution cannot be reached at the store counter, submit a ticket via our Help & Support portal or write to <code>{REPLATE_SUPPORT_EMAIL}</code> with your Order Code (e.g. <code>RP-XXXXXX</code>). Our team responds within 24 hours.
        </p>
      </section>
    </LegalPageLayout>
  );
}
