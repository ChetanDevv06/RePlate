import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  REPLATE_REGISTERED_ADDRESS,
  REPLATE_GRIEVANCE_EMAIL,
  REPLATE_GRIEVANCE_OFFICER_NAME,
  REPLATE_GRIEVANCE_OFFICER_DESIGNATION,
  REPLATE_GRIEVANCE_OFFICER_PHONE,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grievance Redressal Policy — RePlate',
  description: 'Statutory grievance redressal mechanism under Consumer Protection (E-Commerce) Rules 2020 and DPDP Act 2023.',
};

const sections = [
  { id: 'statutory-framework', title: 'Statutory Grievance Framework' },
  { id: 'officer-details', title: 'Grievance Officer Contact Details' },
  { id: 'submission-process', title: 'How to File a Complaint or Grievance' },
  { id: 'categories', title: 'Grievance Categories & Priority Matrix' },
  { id: 'resolution-timeline', title: 'Acknowledgment & Resolution Timelines' },
  { id: 'escalation-matrix', title: 'Escalation & Consumer Forum Rights' },
];

export default function GrievancePolicyPage() {
  const meta = LEGAL_POLICY_METADATA.grievance;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="Structured mechanism for addressing consumer grievances, order disputes, and data protection concerns."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="statutory-framework" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. Statutory Grievance Framework</h2>
        <p>
          In accordance with the <strong>Consumer Protection Act, 2019</strong>, the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, and the <strong>Digital Personal Data Protection Act, 2023</strong>, <strong>{REPLATE_LEGAL_ENTITY_NAME}</strong> (&quot;RePlate&quot;) has established a nodal Grievance Redressal Mechanism to address user inquiries and complaints promptly and transparently.
        </p>
      </section>

      <section id="officer-details" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. Grievance Officer Contact Details</h2>
        <p>You may submit official grievances directly to our designated Grievance Officer:</p>
        <div className="p-4 rounded-xl bg-muted/50 border space-y-1.5 text-xs sm:text-sm">
          <p><strong className="text-foreground">Name:</strong> {REPLATE_GRIEVANCE_OFFICER_NAME}</p>
          <p><strong className="text-foreground">Designation:</strong> {REPLATE_GRIEVANCE_OFFICER_DESIGNATION}</p>
          <p><strong className="text-foreground">Entity:</strong> {REPLATE_LEGAL_ENTITY_NAME}</p>
          <p><strong className="text-foreground">Address:</strong> {REPLATE_REGISTERED_ADDRESS}</p>
          <p><strong className="text-foreground">Email:</strong> <code className="text-primary font-mono">{REPLATE_GRIEVANCE_EMAIL}</code></p>
          <p><strong className="text-foreground">Phone:</strong> {REPLATE_GRIEVANCE_OFFICER_PHONE}</p>
        </div>
      </section>

      <section id="submission-process" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. How to File a Complaint or Grievance</h2>
        <p>You can file an issue using either of the following methods:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong className="text-foreground">In-App Report System:</strong> Click <strong>&quot;Report an Issue&quot;</strong> on your Order Confirmation or History page to automatically generate an auditable ticket (<code>RP-2026-XXXXXX</code>).</li>
          <li><strong className="text-foreground">Email Submission:</strong> Send an email to <code>{REPLATE_GRIEVANCE_EMAIL}</code> specifying your registered email, order code, and detailed description of the issue.</li>
        </ul>
      </section>

      <section id="categories" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Grievance Categories & Priority Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
            <thead className="bg-muted/70 text-foreground font-semibold">
              <tr>
                <th className="p-2.5 border-b">Category</th>
                <th className="p-2.5 border-b">Priority</th>
                <th className="p-2.5 border-b">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              <tr>
                <td className="p-2.5 font-medium text-foreground">Food Safety & Hygiene</td>
                <td className="p-2.5"><span className="text-red-700 bg-red-50 font-bold px-2 py-0.5 rounded">Urgent / High</span></td>
                <td className="p-2.5">Suspected food spoilage, packaging breach, off-odors, or allergen defects.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-foreground">Order & Counter Fulfillment</td>
                <td className="p-2.5"><span className="text-amber-700 bg-amber-50 font-semibold px-2 py-0.5 rounded">Normal</span></td>
                <td className="p-2.5">Store unavailable, wrong item handed over, or counter verification issue.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-foreground">Refund & Payment Issues</td>
                <td className="p-2.5"><span className="text-blue-700 bg-blue-50 font-semibold px-2 py-0.5 rounded">Normal</span></td>
                <td className="p-2.5">Duplicate charges, incorrect billings, or refund processing delays.</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-foreground">Privacy & Data Requests</td>
                <td className="p-2.5"><span className="text-purple-700 bg-purple-50 font-semibold px-2 py-0.5 rounded">Normal</span></td>
                <td className="p-2.5">DPDP Act data access, correction, or account deletion requests.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="resolution-timeline" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Acknowledgment & Resolution Timelines</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li><strong className="text-foreground">Acknowledgment:</strong> Each submitted grievance is acknowledged with a unique Ticket ID within <strong>48 hours</strong>.</li>
          <li><strong className="text-foreground">Food Safety Concerns:</strong> Preliminary review and merchant outreach initiated within <strong>2 to 4 hours</strong>.</li>
          <li><strong className="text-foreground">Final Resolution:</strong> Complete investigation and resolution provided within <strong>30 days</strong> from the receipt of grievance as mandated by the Consumer Protection Rules.</li>
        </ul>
      </section>

      <section id="escalation-matrix" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Escalation & Consumer Forum Rights</h2>
        <p>
          If you remain dissatisfied with the Grievance Officer’s resolution, you retain the full right to approach the appropriate Consumer Disputes Redressal Commission or file a complaint with the <strong>National Consumer Helpline (NCH)</strong> under the Ministry of Consumer Affairs, Government of India.
        </p>
      </section>
    </LegalPageLayout>
  );
}
