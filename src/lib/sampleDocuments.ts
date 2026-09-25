export type FixtureType = 'employment' | 'rental' | 'freelance' | 'nda' | 'saas' | 'agency';

export interface SampleDocumentInfo {
  type: FixtureType;
  filename: string;
  fixturePath: string;
  title: string;
  defaultRole: 'Employee' | 'Tenant' | 'Freelancer' | 'Disclosing Party' | 'Vendor' | 'Client';
  defaultDocType: string;
  defaultJurisdiction: string;
  fileSizeBytes: number;
  pageCount: number;
  summary: string;
}

export const SAMPLE_DOCUMENTS: Record<FixtureType, SampleDocumentInfo> = {
  employment: {
    type: 'employment',
    filename: '01_employment_agreement.pdf',
    fixturePath: '/test-fixtures/legal/01_employment_agreement.pdf',
    title: 'Executive Employment Agreement',
    defaultRole: 'Employee',
    defaultDocType: 'Employment Agreement',
    defaultJurisdiction: 'US - Delaware',
    fileSizeBytes: 1926,
    pageCount: 1,
    summary: 'Executive engineering offer with 12-month post-termination non-compete, 24-month non-solicitation, and 30-day notice severance term.',
  },
  rental: {
    type: 'rental',
    filename: '02_residential_lease.pdf',
    fixturePath: '/test-fixtures/legal/02_residential_lease.pdf',
    title: 'Residential Lease Agreement',
    defaultRole: 'Tenant',
    defaultDocType: 'Residential Rental Agreement',
    defaultJurisdiction: 'US - New York',
    fileSizeBytes: 1694,
    pageCount: 1,
    summary: '12-month residential apartment lease with 60-day early termination notice requirement and 2-month rent penalty fee.',
  },
  freelance: {
    type: 'freelance',
    filename: '03_freelance_services_agreement.pdf',
    fixturePath: '/test-fixtures/legal/03_freelance_services_agreement.pdf',
    title: 'Freelance Services Agreement',
    defaultRole: 'Freelancer',
    defaultDocType: 'Services Agreement',
    defaultJurisdiction: 'US - California',
    fileSizeBytes: 1648,
    pageCount: 1,
    summary: 'Independent contractor agreement featuring milestone payment structure, Net-15 payment terms, and total deliverable IP transfer upon full payment.',
  },
  nda: {
    type: 'nda',
    filename: '04_mutual_nda.pdf',
    fixturePath: '/test-fixtures/legal/04_mutual_nda.pdf',
    title: 'Mutual Non-Disclosure Agreement',
    defaultRole: 'Disclosing Party',
    defaultDocType: 'Non-Disclosure Agreement',
    defaultJurisdiction: 'US - New York',
    fileSizeBytes: 1603,
    pageCount: 1,
    summary: '3-year mutual confidentiality agreement for strategic technology integration with standard exclusions and New York governing law.',
  },
  saas: {
    type: 'saas',
    filename: '05_saas_vendor_agreement.pdf',
    fixturePath: '/test-fixtures/legal/05_saas_vendor_agreement.pdf',
    title: 'SaaS Enterprise Vendor Agreement',
    defaultRole: 'Vendor',
    defaultDocType: 'SaaS Agreement',
    defaultJurisdiction: 'US - Delaware',
    fileSizeBytes: 1578,
    pageCount: 1,
    summary: 'Enterprise SaaS agreement with 99.9% uptime SLA guarantee, SOC 2 Type II compliance standards, and 12-month fee liability cap.',
  },
  agency: {
    type: 'agency',
    filename: '06_creative_agency_service_agreement.pdf',
    fixturePath: '/test-fixtures/legal/06_creative_agency_service_agreement.pdf',
    title: 'Creative Agency Master Services Agreement',
    defaultRole: 'Client',
    defaultDocType: 'Master Services Agreement',
    defaultJurisdiction: 'US - California',
    fileSizeBytes: 1572,
    pageCount: 1,
    summary: 'Master services contract specifying monthly retainer billing, 2 revision rounds per deliverable, and portfolio display rights.',
  },
};
