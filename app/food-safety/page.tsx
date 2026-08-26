import { LegalPageLayout } from '@/components/legal/legal-page-layout';
import {
  REPLATE_LEGAL_ENTITY_NAME,
  REPLATE_FOOD_SAFETY_EMAIL,
  LEGAL_POLICY_METADATA,
} from '@/lib/constants/legal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Food Safety & Hygiene Policy — RePlate',
  description: 'Standards for safe surplus food handling, FSSAI compliance, safe consumption periods, and incident reporting.',
};

const sections = [
  { id: 'definition', title: 'What is Surplus Food?' },
  { id: 'business-responsibilities', title: 'Business Partner FSSAI Responsibilities' },
  { id: 'safe-consumption', title: 'Safe Consumption & Pickup Windows' },
  { id: 'hygiene-packaging', title: 'Hygiene, Storage & Packaging Standards' },
  { id: 'allergens-dietary', title: 'Allergen Disclosures & Dietary Labels' },
  { id: 'prohibited-items', title: 'Prohibited Food Items' },
  { id: 'declaration-audit', title: 'Mandatory Food Safety Declaration' },
  { id: 'incident-reporting', title: 'Reporting a Food Safety Concern' },
  { id: 'enforcement-suspension', title: 'Investigation & Account Suspension' },
];

export default function FoodSafetyPolicyPage() {
  const meta = LEGAL_POLICY_METADATA.foodSafety;

  return (
    <LegalPageLayout
      title={meta.title}
      subtitle="Strict hygiene, safety, and regulatory compliance standards for all food listings on RePlate."
      version={meta.version}
      effectiveDate={meta.effectiveDate}
      lastUpdated={meta.lastUpdated}
      sections={sections}
    >
      <section id="definition" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">1. What is Surplus Food?</h2>
        <p>
          At RePlate, <strong>&quot;Surplus Food&quot;</strong> refers exclusively to clean, wholesome, freshly prepared food items that remain unsold at the end of a shift, lunch hour, or bakery cycle.
        </p>
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm space-y-1">
          <p className="font-bold text-amber-900">Critical Clarification:</p>
          <p className="text-amber-800">
            Surplus food does <strong>NOT</strong> mean spoiled, damaged, contaminated, or expired food. Any food item that fails to meet basic sensory or microbiological food standards must be discarded and is strictly prohibited on RePlate.
          </p>
        </div>
      </section>

      <section id="business-responsibilities" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">2. Business Partner FSSAI Responsibilities</h2>
        <p>
          All participating food businesses (restaurants, canteens, bakeries, cafés) must hold a valid registration or license under the <strong>Food Safety and Standards Act, 2006 (FSSAI)</strong> and comply with:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Good Hygiene Practices (GHP) and Good Manufacturing Practices (GMP).</li>
          <li>Proper sanitary maintenance of food preparation and holding areas.</li>
          <li>Accurate disclosure of business FSSAI registration numbers on their RePlate partner profile.</li>
        </ul>
      </section>

      <section id="safe-consumption" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">3. Safe Consumption & Pickup Windows</h2>
        <p>
          Listings are only active during strictly designated pickup windows. Businesses must ensure that all food offered can be safely collected and consumed by the customer within its recommended safe consumption period.
        </p>
      </section>

      <section id="hygiene-packaging" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">4. Hygiene, Storage & Packaging Standards</h2>
        <p>
          Businesses must store prepared surplus under proper temperature control (hot holding above 60°C or refrigerated below 5°C) and provide secure, food-grade packaging suitable for takeaway collection.
        </p>
      </section>

      <section id="allergens-dietary" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">5. Allergen Disclosures & Dietary Labels</h2>
        <p>
          Businesses must clearly specify dietary classifications (<code>Veg</code>, <code>Non-Veg</code>, <code>Vegan</code>, <code>Contains Egg</code>) and common allergens (such as milk, gluten, nuts, soy). Customers with severe food allergies must always check with store counter staff before consuming food.
        </p>
      </section>

      <section id="prohibited-items" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">6. Prohibited Food Items</h2>
        <p>The following are strictly banned from listing on RePlate:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>Uncooked raw meats, seafood, or unpasteurized dairy.</li>
          <li>Food showing any signs of souring, mold, discoloration, or off-odors.</li>
          <li>Re-served food or food returned by previous dining customers.</li>
          <li>Packaged foods past their stated &quot;Best Before&quot; or &quot;Use By&quot; date.</li>
        </ul>
      </section>

      <section id="declaration-audit" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">7. Mandatory Food Safety Declaration</h2>
        <p>
          Before any listing can be published, the authenticated business manager must actively confirm the mandatory Food Safety Declaration. This confirmation is timestamped and recorded as an auditable compliance log in our database.
        </p>
      </section>

      <section id="incident-reporting" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">8. Reporting a Food Safety Concern</h2>
        <p>
          If a customer receives an item that does not meet safety or quality expectations, they can click <strong>&quot;Report Food Safety Concern&quot;</strong> on their order confirmation page. All food-safety tickets are classified as <code>HIGH / URGENT</code> priority for immediate review.
        </p>
        <p className="text-xs text-muted-foreground">
          Direct food-safety reports can also be emailed directly to our safety desk at <code>{REPLATE_FOOD_SAFETY_EMAIL}</code>.
        </p>
      </section>

      <section id="enforcement-suspension" className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">9. Investigation & Account Suspension</h2>
        <p>
          RePlate reserves the right to immediately suspend listings or deactivate the partner account of any business facing verified hygiene complaints or FSSAI non-compliance notices pending full investigation.
        </p>
      </section>
    </LegalPageLayout>
  );
}
