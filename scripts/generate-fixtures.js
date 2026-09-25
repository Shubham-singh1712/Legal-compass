const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'public', 'test-fixtures', 'legal');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function buildPdf(title, textLines) {
  // Escape backslashes and parentheses for PDF text string literals
  const streamLines = ['BT', '/F1 12 Tf', '50 750 Td', '14 TL'];
  
  // Title
  streamLines.push(`(${title.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj`);
  streamLines.push('T*');
  streamLines.push('T*');
  
  for (const line of textLines) {
    if (!line.trim()) {
      streamLines.push('T*');
      continue;
    }
    const safeLine = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamLines.push(`(${safeLine}) Tj`);
    streamLines.push('T*');
  }
  streamLines.push('ET');

  const streamData = streamLines.join('\n');
  const streamLength = Buffer.byteLength(streamData, 'utf8');

  let pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamData}
endstream
endobj
`;

  // Compute byte offsets for xref
  const lines = pdf.split('\n');
  let offset = 0;
  const offsets = [0];
  
  // Calculate offsets by substring search
  const obj1 = pdf.indexOf('1 0 obj');
  const obj2 = pdf.indexOf('2 0 obj');
  const obj3 = pdf.indexOf('3 0 obj');
  const obj4 = pdf.indexOf('4 0 obj');
  const obj5 = pdf.indexOf('5 0 obj');

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');

  const xref = `xref
0 6
0000000000 65535 f 
${String(obj1).padStart(10, '0')} 00000 n 
${String(obj2).padStart(10, '0')} 00000 n 
${String(obj3).padStart(10, '0')} 00000 n 
${String(obj4).padStart(10, '0')} 00000 n 
${String(obj5).padStart(10, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;

  return Buffer.from(pdf + xref, 'utf8');
}

const fixtures = [
  {
    filename: '01_employment_agreement.pdf',
    title: 'EXECUTIVE EMPLOYMENT AGREEMENT',
    lines: [
      'This Executive Employment Agreement (the "Agreement") is entered into as of January 15, 2025,',
      'by and between TechCorp Systems Inc. ("Company") and Alex Mercer ("Executive").',
      '',
      '1. POSITION AND DUTIES',
      'Executive shall serve as Vice President of Engineering and report to the Chief Executive Officer.',
      '',
      '2. COMPENSATION AND BENEFITS',
      'Company shall pay Executive a base salary of $220,000 per annum, payable in semi-monthly installments.',
      'Executive is eligible for an annual performance bonus of up to 25% of base salary.',
      '',
      '3. NON-COMPETE AND RESTRICTIVE COVENANTS',
      'During employment and for 12 months post-termination, Executive shall not engage in competing business',
      'within North America. Non-solicitation of clients and employees applies for 24 months post-termination.',
      '',
      '4. TERMINATION AND SEVERANCE',
      'Company may terminate employment without Cause upon 30 days written notice, provided Company pays',
      '6 months of continued base salary as severance subject to execution of a general release.',
      '',
      '5. GOVERNING LAW AND ARBITRATION',
      'This Agreement shall be governed by the laws of the State of Delaware. Any dispute shall be resolved',
      'via binding arbitration in Wilmington, Delaware.'
    ]
  },
  {
    filename: '02_residential_lease.pdf',
    title: 'RESIDENTIAL LEASE AGREEMENT',
    lines: [
      'This Lease Agreement is executed on February 1, 2025 between Metro Properties LLC ("Landlord")',
      'and Sarah Jenkins ("Tenant") for the premises located at 742 Evergreen Terrace, Apt 4B.',
      '',
      '1. LEASE TERM AND RENT',
      'The lease term commences on March 1, 2025 and ends on February 28, 2026.',
      'Monthly rent is $2,850, due on the 1st day of each calendar month. A late fee of $150 applies after the 5th.',
      '',
      '2. SECURITY DEPOSIT',
      'Tenant shall deposit $2,850 upon execution. Refundable within 30 days of move-out less lawful deductions.',
      '',
      '3. MAINTENANCE AND ALTERATIONS',
      'Tenant must notify Landlord immediately of plumbing or electrical faults. No alterations permitted',
      'without prior written consent of Landlord.',
      '',
      '4. TERMINATION AND EARLY BREAK',
      'Early termination requires 60 days advance written notice and payment of a 2-month rent penalty fee.',
      '',
      '5. PETS AND OCCUPANCY',
      'No unapproved pets permitted. Premises shall be occupied solely by named Tenant and registered occupants.'
    ]
  },
  {
    filename: '03_freelance_services_agreement.pdf',
    title: 'INDEPENDENT FREELANCE SERVICES AGREEMENT',
    lines: [
      'This Services Agreement is made between Apex Marketing Solutions LLC ("Client") and David Vance ("Contractor")',
      'effective as of March 10, 2025.',
      '',
      '1. SCOPE OF SERVICES',
      'Contractor shall deliver UI Design, Brand Identity Guidelines, and Frontend Integration support.',
      '',
      '2. COMPENSATION AND PAYMENT TERMS',
      'Fixed fee of $15,000 paid as follows: 30% deposit upon signing, 40% upon milestone 2, 30% upon completion.',
      'Invoices are payable Net 15 days. Late payments accrue interest at 1.5% per month.',
      '',
      '3. INTELLECTUAL PROPERTY RIGHTS',
      'All deliverables shall belong exclusively to Client upon full payment of all fees due under this Agreement.',
      '',
      '4. INDEPENDENT CONTRACTOR STATUS',
      'Contractor is an independent contractor. Neither taxes nor employment benefits shall be withheld or provided.',
      '',
      '5. TERMINATION',
      'Either party may terminate upon 14 days written notice. Client shall pay for all work performed prior to notice.'
    ]
  },
  {
    filename: '04_mutual_nda.pdf',
    title: 'MUTUAL NON-DISCLOSURE AGREEMENT',
    lines: [
      'This Mutual Non-Disclosure Agreement ("NDA") is made on January 8, 2025 between',
      'Vanguard Innovation Labs Inc. ("Party A") and CloudScale Technologies Corp. ("Party B").',
      '',
      '1. PURPOSE',
      'The parties wish to explore a potential strategic partnership regarding cloud security architecture.',
      '',
      '2. DEFINITION OF CONFIDENTIAL INFORMATION',
      'Confidential Information includes technical data, trade secrets, customer lists, and financial projections.',
      '',
      '3. NON-DISCLOSURE OBLIGATIONS',
      'Each receiving party agrees to hold all Confidential Information in strict confidence for 3 years.',
      'Information shall not be disclosed to any third party without prior written authorization.',
      '',
      '4. EXCLUSIONS',
      'Confidential Information does not include information already public or independently developed.',
      '',
      '5. GOVERNING LAW',
      'Governed by New York law without giving effect to conflict of laws principles.'
    ]
  },
  {
    filename: '05_saas_vendor_agreement.pdf',
    title: 'SAAS ENTERPRISE VENDOR AGREEMENT',
    lines: [
      'This Enterprise SaaS Agreement is entered into on April 2, 2025 between DataPulse Analytics Corp. ("Provider")',
      'and Enterprise Global Logistics Inc. ("Customer").',
      '',
      '1. SERVICE SUBSCRIPTION',
      'Provider grants Customer a non-exclusive, non-transferable right to access the DataPulse Analytics Platform.',
      '',
      '2. FEES AND BILLING',
      'Annual subscription fee of $48,000 billed annually in advance. Overage usage fees billed monthly at $0.05/API call.',
      '',
      '3. SERVICE LEVEL AGREEMENT (SLA)',
      'Provider guarantees 99.9% uptime. Customer is entitled to 5% service credit per 0.5% uptime drop below target.',
      '',
      '4. DATA PRIVACY AND SECURITY',
      'Provider agrees to maintain SOC 2 Type II compliance and encrypt all customer data at rest and in transit.',
      '',
      '5. LIMITATION OF LIABILITY',
      'Neither party liability shall exceed total fees paid under this agreement in the preceding 12 months.'
    ]
  },
  {
    filename: '06_creative_agency_service_agreement.pdf',
    title: 'CREATIVE AGENCY MASTER SERVICES AGREEMENT',
    lines: [
      'This Master Services Agreement ("MSA") is entered into on May 12, 2025 between Studio Spark Design LLC ("Agency")',
      'and Horizon Consumer Brands Co. ("Client").',
      '',
      '1. SERVICES & STATEMENTS OF WORK',
      'Agency will provide creative design, media production, and campaign management as specified in executed SOWs.',
      '',
      '2. AGENCY FEES AND REIMBURSEMENTS',
      'Client shall pay monthly retainer of $12,500 plus pre-approved out-of-pocket expenses within 30 days.',
      '',
      '3. REVISIONS & APPROVALS',
      'Up to 2 rounds of design revisions included per deliverable. Additional revisions billed at $150/hour.',
      '',
      '4. INTELLECTUAL PROPERTY & PORTFOLIO RIGHTS',
      'Final work product ownership transfers to Client upon full payment. Agency retains right to exhibit in portfolio.',
      '',
      '5. TERMINATION',
      'Either party may terminate this MSA for convenience with 30 days prior written notice.'
    ]
  }
];

for (const f of fixtures) {
  const pdfBuffer = buildPdf(f.title, f.lines);
  const filePath = path.join(outputDir, f.filename);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated fixture PDF: ${f.filename} (${pdfBuffer.length} bytes)`);
}

console.log('All 6 fixture PDFs created successfully!');
