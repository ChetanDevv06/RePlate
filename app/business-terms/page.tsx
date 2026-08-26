import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  PLATFORM_COMMISSION_RATE,
  REPLATE_SUPPORT_EMAIL,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Partner Agreement — RePlate',
  description: 'Terms governing restaurants, cafés, and college canteens listing surplus food on the RePlate marketplace.',
};

const sections = [
  { id: 'appointment', title: 'Marketplace Relationship & Scope' },
  { id: 'eligibility-fssai', title: 'Merchant Eligibility & FSSAI Compliance' },
  { id: 'listing-standards', title: 'Food Listing & Truth in Advertising' },
  { id: 'order-fulfilment', title: 'Order Fulfilment & Counter Verification' },
  { id: 'commission-settlement', title: 'Commission & Settlement Framework' },
  { id: 'customer-data', title: 'Customer Data Confidentiality' },
  { id: 'indemnity', title: 'Food Safety Indemnification & Liability' },
  { id: 'suspension-termination', title: 'Listing Removal & Partner Termination' },
];

export default function BusinessTermsPage() {
  const meta = LEGAL_POLICY_METADATA.businessTerms;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="Commercial terms, commission model, and food safety commitments for RePlate food business partners."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="appointment" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Marketplace Relationship & Scope</h2>
        <p>
          This Business Partner Agreement (&quot;Agreement&quot;) governs the listing and sale of surplus food items by food business operators (&quot;Partner&quot;, &quot;Merchant&quot;, &quot;you&quot;) on the RePlate platform operated by <strong>{REPLATE_LEGAL_ENTITY_NAME}</strong>.
        </p>
        <p>
          RePlate acts solely as an independent digital marketplace facilitator providing listing technology, demand forecasting analytics, reservation systems, and order tracking.
        </p>
      </section>

      <section id="eligibility-fssai" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. Merchant Eligibility & FSSAI Compliance</h2>
        <p>
          You represent and warrant that you hold a valid, active license/registration under the <strong>Food Safety and Standards Act, 2006 (FSSAI)</strong> and comply with all applicable municipal sanitary regulations in India. You agree to provide your FSSAI registration details during onboarding.
        </p>
      </section>

      <section id="listing-standards" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. Food Listing & Truth in Advertising</h2>
        <p>When creating food listings on RePlate, you agree to:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>List only wholesome, safely prepared, edible surplus food items.</li>
          <li>Accurately declare food names, descriptions, dietary classification (Veg/Non-Veg), and common allergens.</li>
          <li>Set a genuine original price and discounted surplus selling price.</li>
          <li>Confirm the mandatory Food Safety Declaration for each published listing.</li>
        </ul>
      </section>

      <section id="order-fulfilment" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Order Fulfilment & Counter Verification</h2>
        <p>
          When a customer arrives at your counter, you must ask for their 8-character verification code (e.g. <code>RP-XXXXXX</code>). Once verified, hand over the packaged order and click <strong>&quot;Mark Collected&quot;</strong> in your Business Portal.
        </p>
      </section>

      <section id="commission-settlement" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Commission & Settlement Framework</h2>
        <p>
          RePlate charges a standard platform commission of <strong>{PLATFORM_COMMISSION_RATE * 100}%</strong> on the total value of completed, collected customer orders. Cancelled orders are exempt from platform commission.
        </p>
      </section>

      <section id="customer-data" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Customer Data Confidentiality</h2>
        <p>
          Customer information (such as customer name and order code) provided to you must be used solely for order verification and fulfillment. You agree not to harvest, export, sell, or use customer data for unsolicited external marketing.
        </p>
      </section>

      <section id="indemnity" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">7. Food Safety Indemnification & Liability</h2>
        <p>
          The Merchant bears sole responsibility for the preparation, hygienic handling, storage, and packaging of food items. The Merchant agrees to indemnify and hold harmless RePlate from any claims, consumer grievances, penalties, or damages arising from food quality defects or failure to comply with FSSAI standards.
        </p>
      </section>

      <section id="suspension-termination" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">8. Listing Removal & Partner Termination</h2>
        <p>
          RePlate reserves the right to unpublish listings or terminate partner accounts for recurring customer complaints, food safety violations, price misrepresentations, or breach of this Agreement.
        </p>
        <p className="text-xs text-muted-foreground">
          Partner inquiries and onboarding assistance can be directed to <code>{REPLATE_SUPPORT_EMAIL}</code>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
