import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  REPLATE_REGISTERED_ADDRESS,
  REPLATE_PRIVACY_EMAIL,
  REPLATE_GRIEVANCE_EMAIL,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — RePlate',
  description: 'How RePlate collects, uses, protects, and retains your personal information under the Digital Personal Data Protection Act, 2023.',
};

const sections = [
  { id: 'introduction', title: 'Introduction & Scope' },
  { id: 'data-collected', title: 'Personal Data We Collect' },
  { id: 'purpose-use', title: 'How We Use Your Personal Data' },
  { id: 'third-parties', title: 'Data Sharing & Third-Party Processors' },
  { id: 'security', title: 'Data Security & Storage Safeguards' },
  { id: 'retention', title: 'Data Retention & Audit Obligations' },
  { id: 'user-rights', title: 'Your Rights & Consent Withdrawal' },
  { id: 'account-deletion', title: 'Account Deletion & Data Erasure' },
  { id: 'children-privacy', title: 'Children’s Privacy & Age Policy' },
  { id: 'grievance', title: 'Grievance Officer & Contact Details' },
];

export default function PrivacyPolicyPage() {
  const meta = LEGAL_POLICY_METADATA.privacy;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="How RePlate collects, uses, and safeguards your data in compliance with the Digital Personal Data Protection Act, 2023."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="introduction" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Introduction & Scope</h2>
        <p>
          This Privacy Policy explains how <strong>{REPLATE_LEGAL_ENTITY_NAME}</strong> (operating as <strong>RePlate</strong>, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, processes, and protects your personal data when you access or use our web platform, mobile interfaces, and surplus food marketplace services.
        </p>
        <p>
          RePlate operates as a digital marketplace intermediary connecting food business partners (such as canteens, restaurants, and bakeries) with consumers. We are committed to processing personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, the Digital Personal Data Protection Rules, 2025, and other applicable Indian data-protection laws.
        </p>
      </section>

      <section id="data-collected" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. Personal Data We Collect</h2>
        <p>We collect only the minimum personal data necessary to operate our surplus marketplace:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong className="text-foreground">Account Information:</strong> Full name, email address, encrypted authentication credentials, and user role (Customer or Business).</li>
          <li><strong className="text-foreground">Business Partner Information:</strong> Store name, registered business location, physical address, business contact phone number, and FSSAI registration details.</li>
          <li><strong className="text-foreground">Transaction & Reservation Data:</strong> Unique reservation codes (e.g. <code>RP-XXXXXX</code>), reserved item names, quantities, transaction amounts, collection timestamps, and order history.</li>
          <li><strong className="text-foreground">Grievance & Support Records:</strong> Ticket descriptions, issue categories, and communication history submitted through our Help & Grievance portals.</li>
        </ul>
      </section>

      <section id="purpose-use" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. How We Use Your Personal Data</h2>
        <p>Personal data is processed strictly for the following legitimate purposes:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Facilitating food listing discovery, reservations, and counter pickup verification.</li>
          <li>Maintaining user profiles and authenticating sessions.</li>
          <li>Calculating aggregated sustainability metrics (meals rescued, waste avoided, revenue recovered).</li>
          <li>Providing customer assistance, grievance resolution, and food-safety incident tracking.</li>
          <li>Complying with statutory consumer-protection, tax, accounting, and food-safety legal obligations.</li>
        </ul>
      </section>

      <section id="third-parties" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Data Sharing & Third-Party Processors</h2>
        <p>
          RePlate does not sell, rent, or trade your personal information. We share minimal data only with authorized service providers under strict data-processing terms:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong className="text-foreground">Database & Auth Infrastructure:</strong> Supabase Inc., utilizing enterprise-grade encryption and secure access controls for database hosting and session management.</li>
          <li><strong className="text-foreground">Food Business Partners:</strong> When you reserve a meal, the fulfilling business partner receives your name, order code, and item details strictly for pickup fulfilment.</li>
          <li><strong className="text-foreground">Statutory & Law Enforcement Authorities:</strong> Where legally mandated by applicable Indian court orders, regulatory notices, or food-safety investigations.</li>
        </ul>
      </section>

      <section id="security" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Data Security & Storage Safeguards</h2>
        <p>
          RePlate uses Supabase’s authentication infrastructure and appropriate technical and organizational safeguards (including Row-Level Security (RLS) policies, HTTPS encryption in transit, and encrypted passwords) to help protect account and transaction information against unauthorized access, loss, or alteration.
        </p>
        <p className="text-xs text-muted-foreground italic">
          * While we implement industry-standard safeguards, no digital transmission over the internet can be guaranteed as 100% immune from external security incidents. We maintain incident response procedures to address any suspected data breaches promptly.
        </p>
      </section>

      <section id="retention" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Data Retention & Audit Obligations</h2>
        <p>
          We retain personal data for as long as your account remains active. When an account is closed or deleted, certain transactional, financial, and grievance records are retained for statutory periods required under applicable Indian accounting, tax, and consumer-protection laws to resolve potential disputes and satisfy audit requirements.
        </p>
      </section>

      <section id="user-rights" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">7. Your Rights & Consent Withdrawal</h2>
        <p>Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Access a summary of your personal data processed by RePlate.</li>
          <li>Request correction or updating of inaccurate personal data via your Profile Account Center.</li>
          <li>Request erasure of personal data that is no longer necessary for the purpose it was collected (subject to statutory retention exceptions).</li>
          <li>Nominate an individual to exercise rights on your behalf in the event of incapacity.</li>
        </ul>
      </section>

      <section id="account-deletion" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">8. Account Deletion & Data Erasure</h2>
        <p>
          You may request deletion of your RePlate account at any time through your Profile settings or by emailing <code>{REPLATE_PRIVACY_EMAIL}</code>. Upon processing, your profile and login credentials will be deactivated, and personal identifiers removed from non-statutory records.
        </p>
      </section>

      <section id="children-privacy" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">9. Children’s Privacy & Age Policy</h2>
        <p>
          RePlate is intended for use by individuals who are at least 18 years of age or possess valid parental/guardian consent under applicable Indian law. We do not knowingly collect personal data from children without verifiable parental consent.
        </p>
      </section>

      <section id="grievance" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">10. Grievance Officer & Contact Details</h2>
        <p>
          In accordance with the DPDP Act 2023 and the Consumer Protection (E-Commerce) Rules 2020, if you have any questions, concerns, or grievances regarding your data, you may reach our Grievance Officer:
        </p>
        <div className="p-4 rounded-xl bg-muted/50 border space-y-1 text-xs sm:text-sm">
          <p><strong className="text-foreground">Entity:</strong> {REPLATE_LEGAL_ENTITY_NAME}</p>
          <p><strong className="text-foreground">Registered Address:</strong> {REPLATE_REGISTERED_ADDRESS}</p>
          <p><strong className="text-foreground">Privacy Desk Email:</strong> {REPLATE_PRIVACY_EMAIL}</p>
          <p><strong className="text-foreground">Grievance Desk Email:</strong> {REPLATE_GRIEVANCE_EMAIL}</p>
        </div>
      </section>
    </LegalPageLayout>
  );
}
