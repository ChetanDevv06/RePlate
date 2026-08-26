// ============================================================
// RePlate — Legal, Compliance & Marketplace Configuration
// ============================================================

/**
 * Legal Entity and Operational Placeholders
 * IMPORTANT: Replace these placeholders with validated corporate details
 * prior to commercial launch in accordance with Indian regulatory requirements.
 */
export const REPLATE_LEGAL_ENTITY_NAME = '[LEGAL ENTITY NAME]';
export const REPLATE_BRAND_NAME = 'RePlate';
export const REPLATE_CIN_OR_REG_NO = '[CORPORATE IDENTIFICATION NUMBER / REGISTRATION NO.]';
export const REPLATE_REGISTERED_ADDRESS = '[REGISTERED OFFICE ADDRESS, BANGALORE, KARNATAKA, INDIA]';
export const REPLATE_OPERATIONAL_ADDRESS = '[CAMPUS / OPERATIONAL OFFICE ADDRESS]';

// Contact & Support Configuration
export const REPLATE_SUPPORT_EMAIL = 'support@replate.demo';
export const REPLATE_PRIVACY_EMAIL = 'privacy@replate.demo';
export const REPLATE_GRIEVANCE_EMAIL = 'grievance@replate.demo';
export const REPLATE_FOOD_SAFETY_EMAIL = 'foodsafety@replate.demo';
export const REPLATE_SUPPORT_PHONE = '[CUSTOMER CARE TELEPHONE NUMBER]';

// Statutory Grievance Redressal Officer (Consumer Protection E-Commerce Rules 2020)
export const REPLATE_GRIEVANCE_OFFICER_NAME = '[GRIEVANCE REDRESSAL OFFICER NAME]';
export const REPLATE_GRIEVANCE_OFFICER_DESIGNATION = 'Nodal Grievance Redressal Officer';
export const REPLATE_GRIEVANCE_OFFICER_PHONE = '[GRIEVANCE OFFICER TELEPHONE]';
export const REPLATE_GRIEVANCE_OFFICER_ADDRESS = '[GRIEVANCE OFFICER POSTAL ADDRESS]';

// Policy Versions & Effective Dates
export const LEGAL_POLICY_METADATA = {
  terms: {
    title: 'Terms of Service',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/terms',
  },
  privacy: {
    title: 'Privacy Policy',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/privacy',
  },
  foodSafety: {
    title: 'Food Safety & Hygiene Policy',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/food-safety',
  },
  refunds: {
    title: 'Refund & Cancellation Policy',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/refunds',
  },
  businessTerms: {
    title: 'Business Partner Agreement',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/business-terms',
  },
  grievance: {
    title: 'Grievance Redressal Policy',
    version: '1.0',
    effectiveDate: 'February 26, 2026',
    lastUpdated: 'February 26, 2026',
    route: '/grievance',
  },
};

/** Mandatory food safety declaration text required from business prior to publishing */
export const FOOD_SAFETY_DECLARATION_TEXT = 
  'I confirm that this food has been prepared, handled, stored and packaged in accordance with applicable food-safety requirements and FSSAI standards, is wholesome and fit for human consumption, and is being offered strictly within its safe-consumption period.';

export const FOOD_SAFETY_DECLARATION_VERSION = '1.0';

/** Standard platform commission rate */
export const PLATFORM_COMMISSION_RATE = 0.10; // 10%
