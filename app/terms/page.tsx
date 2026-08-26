import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  REPLATE_REGISTERED_ADDRESS,
  REPLATE_SUPPORT_EMAIL,
  REPLATE_GRIEVANCE_EMAIL,
  PLATFORM_COMMISSION_RATE,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — RePlate',
  description: 'Terms and conditions governing the use of the RePlate marketplace platform in India.',
};

const sections = [
  { id: 'introduction', title: 'Introduction & Acceptance' },
  { id: 'marketplace-role', title: 'RePlate’s Marketplace Role' },
  { id: 'account-eligibility', title: 'User Eligibility & Accounts' },
  { id: 'food-listings', title: 'Food Listings & Availability' },
  { id: 'orders-pickup', title: 'Orders, Order Codes & Pickup' },
  { id: 'pricing-commission', title: 'Pricing & Platform Commission' },
  { id: 'cancellations', title: 'Cancellations & Refunds' },
  { id: 'food-safety', title: 'Food Safety & Business Obligations' },
  { id: 'prohibited-conduct', title: 'Prohibited Activities' },
  { id: 'disclaimers-liability', title: 'Disclaimers & Limitation of Liability' },
  { id: 'governing-law', title: 'Governing Law & Dispute Resolution' },
];

export default function TermsOfServicePage() {
  const meta = LEGAL_POLICY_METADATA.terms;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="Standard terms and conditions governing customer reservations and business listings on RePlate."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="introduction" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Introduction & Acceptance</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Customer&quot;, or &quot;Business&quot;) and <strong>{REPLATE_LEGAL_ENTITY_NAME}</strong> (&quot;RePlate&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account, browsing listings, or reserving food, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy.
        </p>
      </section>

      <section id="marketplace-role" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. RePlate’s Marketplace Role</h2>
        <p>
          RePlate operates as an <strong>e-commerce marketplace intermediary</strong> as defined under the Consumer Protection Act, 2019 and the Information Technology Act, 2000. RePlate provides digital software infrastructure enabling independent food businesses (&quot;Businesses&quot;) to list surplus food items and consumers (&quot;Customers&quot;) to discover and reserve such items.
        </p>
        <div className="p-3.5 rounded-xl bg-muted/50 border space-y-1 text-xs sm:text-sm">
          <p><strong className="text-foreground">Important Distinction:</strong></p>
          <p className="text-muted-foreground">
            Food businesses independently prepare, package, price, store, and hand over the food items. RePlate does not manufacture, prepare, inspect, or physically hold inventory. Nothing in these Terms creates an employment, agency, or partnership relationship between RePlate and participating food businesses.
          </p>
        </div>
      </section>

      <section id="account-eligibility" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. User Eligibility & Accounts</h2>
        <p>
          You must be at least 18 years of age and legally capable of entering into binding contracts under the Indian Contract Act, 1872. You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.
        </p>
      </section>

      <section id="food-listings" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Food Listings & Availability</h2>
        <p>
          Listings represent edible surplus food items offered at discounted prices during specified daily pickup windows. Businesses are solely responsible for ensuring that listings accurately describe food names, ingredients, dietary classifications (Veg/Non-Veg), and allergen warnings.
        </p>
      </section>

      <section id="orders-pickup" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Orders, Order Codes & Pickup</h2>
        <p>
          Upon reserving a listing, Customers receive a unique 8-character verification code (e.g. <code>RP-XXXXXX</code>).
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Customers must arrive at the business location within the designated pickup window.</li>
          <li>Customers must present their valid pickup code at the counter for verification.</li>
          <li>Once verified, the business marks the order as Collected.</li>
          <li>Failure to collect items within the pickup window may result in order expiration without refund eligibility.</li>
        </ul>
      </section>

      <section id="pricing-commission" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Pricing & Platform Commission</h2>
        <p>
          All prices displayed are in Indian Rupees (INR) and represent the final discounted price set by the Business. RePlate charges a standard platform fee of {PLATFORM_COMMISSION_RATE * 100}% on completed transactions to support digital marketplace operations and infrastructure.
        </p>
      </section>

      <section id="cancellations" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">7. Cancellations & Refunds</h2>
        <p>
          Due to the time-sensitive nature of prepared surplus food, cancellations and refund requests are governed strictly by our <a href="/refunds" className="text-primary underline">Refund & Cancellation Policy</a>.
        </p>
      </section>

      <section id="food-safety" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">8. Food Safety & Business Obligations</h2>
        <p>
          Businesses warrant that all listed items are wholesome, hygienic, fit for consumption, and prepared in compliance with Food Safety and Standards Authority of India (FSSAI) regulations. For complete standards, refer to our <a href="/food-safety" className="text-primary underline">Food Safety Policy</a>.
        </p>
      </section>

      <section id="prohibited-conduct" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">9. Prohibited Activities</h2>
        <p>Users and businesses shall not:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>List expired, spoiled, unsafe, or contaminated food items.</li>
          <li>Create fake reservations or tamper with pickup verification codes.</li>
          <li>Use scraping tools, bots, or unauthorized automated access mechanisms.</li>
          <li>Harass counter staff, customers, or platform support personnel.</li>
        </ul>
      </section>

      <section id="disclaimers-liability" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">10. Disclaimers & Limitation of Liability</h2>
        <p>
          RePlate provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by applicable Indian law, RePlate disclaims all warranties regarding the preparation, quality, or taste of food prepared by independent businesses.
        </p>
        <p className="text-xs text-muted-foreground italic">
          * Nothing in these Terms is intended to exclude or restrict statutory consumer rights or liabilities that cannot legally be excluded under the Consumer Protection Act, 2019.
        </p>
      </section>

      <section id="governing-law" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">11. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.
        </p>
        <p className="text-xs text-muted-foreground">
          For support inquiries, contact <code>{REPLATE_SUPPORT_EMAIL}</code> or file a grievance via <code>{REPLATE_GRIEVANCE_EMAIL}</code>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
