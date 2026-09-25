const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

function makePdfProper(lines) {
  let streamText = 'BT\r\n/F1 10 Tf\r\n50 750 Td\r\n';
  for (const l of lines) {
    if (!l || l.trim() === '') {
      streamText += '0 -10 Td\r\n';
    } else {
      // Escape PDF special chars: backslash, parens, and percent sign
      const clean = l
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/%/g, 'pct');
      streamText += `(${clean}) Tj\r\n0 -14 Td\r\n`;
    }
  }
  streamText += 'ET';

  const streamBuf = Buffer.from(streamText, 'latin1');

  const obj1 = Buffer.from('1 0 obj\r\n<< /Type /Catalog /Pages 2 0 R >>\r\nendobj\r\n', 'latin1');
  const obj2 = Buffer.from('2 0 obj\r\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\r\nendobj\r\n', 'latin1');
  const obj3 = Buffer.from('3 0 obj\r\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /ProcSet [/PDF /Text] /Font << /F1 5 0 R >> >> >>\r\nendobj\r\n', 'latin1');
  const obj4Head = Buffer.from(`4 0 obj\r\n<< /Length ${streamBuf.length} >>\r\nstream\r\n`, 'latin1');
  const obj4Tail = Buffer.from('\r\nendstream\r\nendobj\r\n', 'latin1');
  const obj4 = Buffer.concat([obj4Head, streamBuf, obj4Tail]);
  const obj5 = Buffer.from('5 0 obj\r\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\r\nendobj\r\n', 'latin1');

  const header = Buffer.from('%PDF-1.4\r\n', 'latin1');
  const objs = [obj1, obj2, obj3, obj4, obj5];

  let totalOffset = header.length;
  const offsets = [];
  for (const o of objs) {
    offsets.push(totalOffset);
    totalOffset += o.length;
  }

  const startXref = totalOffset;
  let xrefStr = `xref\r\n0 ${objs.length + 1}\r\n0000000000 65535 f \r\n`;
  for (const ofs of offsets) {
    xrefStr += String(ofs).padStart(10, '0') + ' 00000 n \r\n';
  }
  const xrefBuf = Buffer.from(xrefStr, 'latin1');
  const trailerBuf = Buffer.from(`trailer\r\n<< /Size ${objs.length + 1} /Root 1 0 R >>\r\nstartxref\r\n${startXref}\r\n%%EOF\r\n`, 'latin1');

  return Buffer.concat([header, ...objs, xrefBuf, trailerBuf]);
}

const doc1 = [
  'EXECUTIVE EMPLOYMENT AGREEMENT',
  'This Executive Employment Agreement (the "Agreement") is entered into as of January 15, 2025,',
  'by and between TechCorp Systems Inc. ("Company") and Alex Mercer ("Executive").',
  '',
  '1. POSITION AND DUTIES',
  'Executive shall serve as Vice President of Engineering and report to the Chief Executive Officer.',
  'Executive agrees to devote full business time and best efforts to the performance of duties.',
  '',
  '2. COMPENSATION AND BENEFITS',
  'Company shall pay Executive a base salary of $220,000 per annum, payable in semi-monthly installments.',
  'Executive is eligible for an annual performance bonus of up to 25 percent of base salary based on milestones.',
  'Executive is entitled to 20 days paid vacation per calendar year and standard health benefits.',
  '',
  '3. NON-COMPETE AND RESTRICTIVE COVENANTS',
  'During employment and for 12 months post-termination, Executive shall not engage in competing business',
  'within North America. Non-solicitation of clients and employees applies for 24 months post-termination.',
  '',
  '4. TERMINATION AND SEVERANCE',
  'Company may terminate employment without Cause upon 30 days written notice, provided Company pays',
  '6 months of continued base salary as severance subject to execution of a general release.',
  'Executive may resign upon 30 days written notice.',
  '',
  '5. GOVERNING LAW AND ARBITRATION',
  'This Agreement shall be governed by the laws of the State of Delaware. Any dispute shall be resolved',
  'via binding arbitration in Wilmington, Delaware.'
];

const doc2 = [
  'RESIDENTIAL LEASE AGREEMENT',
  'This Lease Agreement is executed on February 1, 2025 between Metro Properties LLC ("Landlord")',
  'and Sarah Jenkins ("Tenant") for the premises located at 742 Evergreen Terrace, Apt 4B.',
  '',
  '1. LEASE TERM AND RENT',
  'The lease term commences on March 1, 2025 and ends on February 28, 2026.',
  'Monthly rent is $2,850, due on the 1st day of each calendar month. A late fee of $150 applies after the 5th.',
  '',
  '2. SECURITY DEPOSIT',
  'Tenant shall deposit $2,850 upon execution. Refundable within 30 days of move-out less lawful deductions.',
  'Landlord shall hold deposit in an interest-bearing escrow account.',
  '',
  '3. MAINTENANCE AND ALTERATIONS',
  'Tenant must notify Landlord immediately of plumbing or electrical faults.',
  'No alterations or repainting permitted without prior written consent of Landlord.',
  'Landlord is obligated to maintain structural components, plumbing, and heating in good repair.',
  '',
  '4. TERMINATION AND EARLY BREAK',
  'Early termination requires 60 days advance written notice and payment of a 2-month rent penalty fee.',
  'Tenant remains liable for rent until replacement tenant is secured.',
  '',
  '5. PETS AND OCCUPANCY',
  'No unapproved pets permitted on premises. Premises shall be occupied solely by named Tenant.',
  '',
  '6. GOVERNING LAW',
  'This Lease is governed by the laws of the State of New York.'
];

const doc3 = [
  'FREELANCE SERVICES AGREEMENT',
  'This Freelance Services Agreement is entered into on March 10, 2025 between Apex Marketing Solutions LLC ("Client")',
  'and David Vance ("Freelancer" or "Contractor").',
  '',
  '1. SCOPE OF SERVICES',
  'Freelancer shall deliver comprehensive UI/UX design, design systems, and front-end integration components.',
  'All work shall meet professional industry standards and specifications set forth in Statement of Work 1.',
  '',
  '2. COMPENSATION AND PAYMENT TERMS',
  'Client shall pay Freelancer a fixed fee of $15,000 for the project.',
  'Payment schedule: 30 percent upfront deposit upon signing, 40 percent upon milestone 2 delivery, and 30 percent upon final acceptance.',
  'Invoices are payable within Net 15 days of invoice date. Late payments incur a 1.5 percent monthly late fee.',
  '',
  '3. ACCEPTANCE AND REVISION PERIOD',
  'Client must review and provide written feedback on deliverables within 7 days of receipt.',
  'Deliverables are deemed accepted if no written objection is received within 7 days.',
  'Freelancer shall provide up to 2 rounds of revisions at no additional charge.',
  '',
  '4. INTELLECTUAL PROPERTY RIGHTS',
  'Freelancer assigns all right, title, and ownership in final deliverables to Client upon receipt of full payment.',
  'Freelancer retains the right to display non-confidential project work in professional portfolios.',
  '',
  '5. CONFIDENTIALITY',
  'Both parties agree to hold confidential information in strict confidence for 2 years from disclosure.',
  '',
  '6. TERMINATION',
  'Either party may terminate this Agreement upon 14 days written notice. In the event of early termination,',
  'Client shall pay Freelancer for all completed milestone work and hours accrued to date.',
  '',
  '7. GOVERNING LAW',
  'This Agreement shall be governed by and construed under the laws of the State of California.'
];

const doc4 = [
  'MUTUAL NON-DISCLOSURE AGREEMENT',
  'This Mutual Non-Disclosure Agreement ("Agreement") is entered into on April 5, 2025 between',
  'Quantum Innovations Inc. ("Party A") and Nexus Data Labs LLC ("Party B").',
  '',
  '1. DEFINITION OF CONFIDENTIAL INFORMATION',
  'Confidential Information includes technical data, software architecture, product designs, customer lists,',
  'and proprietary business information disclosed in connection with exploring a commercial partnership.',
  '',
  '2. EXCLUSIONS FROM CONFIDENTIALITY',
  'Confidential Information does not include information that is publicly known, already in possession of recipient',
  'without breach, or independently developed without reference to disclosed materials.',
  '',
  '3. OBLIGATIONS OF RECEIVING PARTY',
  'Receiving party shall maintain strict confidentiality and exercise a reasonable degree of care.',
  'Receiving party may disclose confidential information only to employees and advisers with a need to know.',
  'Receiving party shall not reverse engineer, decompile, or disassemble any proprietary prototypes.',
  '',
  '4. TERM AND RETURN OF MATERIALS',
  'Confidentiality obligations shall survive for a period of 3 years following disclosure.',
  'Upon written request, receiving party shall return or destroy all confidential documents within 15 days.',
  '',
  '5. REMEDIES AND INJUNCTIVE RELIEF',
  'Parties agree that unauthorized disclosure causes irreparable harm entitled to seek injunctive relief without bond.',
  '',
  '6. GOVERNING LAW',
  'This Agreement is governed by the laws of the State of New York.'
];

const doc5 = [
  'ENTERPRISE SAAS VENDOR AGREEMENT',
  'This Enterprise SaaS Agreement is entered into on May 1, 2025 between CloudScale Analytics Inc. ("Vendor")',
  'and Global Enterprises Ltd. ("Customer").',
  '',
  '1. SUBSCRIPTION GRANT AND USAGE',
  'Vendor grants Customer a non-exclusive, non-transferable subscription license to access the Analytics Platform.',
  'Customer is authorized for up to 100 enterprise user accounts.',
  '',
  '2. SERVICE LEVEL AGREEMENT (SLA) AND UPTIME',
  'Vendor guarantees 99.9 percent monthly platform uptime excluding scheduled maintenance.',
  'Customer is entitled to a 10 percent monthly service credit if monthly uptime drops below 99.9 percent in any calendar month.',
  'Vendor shall respond to critical service tickets within 1 hour.',
  '',
  '3. DATA SECURITY AND PRIVACY',
  'Vendor shall maintain SOC 2 Type II compliance and AES-256 encryption for data in transit and at rest.',
  'Customer retains sole and exclusive ownership of all Customer Data uploaded to the platform.',
  '',
  '4. FEES AND PAYMENT TERMS',
  'Customer shall pay an annual subscription fee of $48,000, invoiced annually in advance.',
  'Invoices are payable within Net 30 days. Unpaid invoices past 30 days are subject to service suspension.',
  '',
  '5. LIMITATION OF LIABILITY',
  'Vendor total aggregate liability under this Agreement shall not exceed the total fees paid in previous 12 months.',
  'Neither party shall be liable for indirect, punitive, or consequential damages.',
  '',
  '6. TERM, RENEWAL, AND TERMINATION',
  'Initial term is 12 months, auto-renewing for successive 1-year terms unless notice is given 60 days prior to renewal.',
  'Either party may terminate for material breach if not cured within 30 days written notice.',
  '',
  '7. GOVERNING LAW',
  'This Agreement shall be governed by the laws of the State of Delaware.'
];

const doc6 = [
  'CREATIVE AGENCY MASTER SERVICES AGREEMENT',
  'This Master Services Agreement ("MSA") is entered into on June 1, 2025 between Studio Spark Design LLC ("Agency")',
  'and Horizon Consumer Brands Co. ("Client").',
  '',
  '1. SERVICES AND STATEMENTS OF WORK',
  'Agency will provide creative brand strategy, digital asset production, and multi-channel campaign management.',
  'Specific project deliverables and schedules shall be set forth in executed Statements of Work (SOWs).',
  '',
  '2. AGENCY FEES AND RETAINER',
  'Client shall pay Agency a monthly retainer fee of $12,500, due on the 1st day of each month.',
  'Pre-approved travel and out-of-pocket production expenses shall be reimbursed within Net 30 days.',
  '',
  '3. REVISIONS AND APPROVALS',
  'Deliverables include up to 2 rounds of revisions. Additional revision cycles are billed at $150 per hour.',
  'Client shall provide feedback or milestone approval within 5 business days of deliverable submission.',
  '',
  '4. INTELLECTUAL PROPERTY AND PORTFOLIO RIGHTS',
  'All final approved creative deliverables become the exclusive property of Client upon full payment of fees.',
  'Agency retains the right to display final deliverables in its marketing portfolio, awards, and case studies.',
  '',
  '5. TERMINATION AND NOTICE',
  'Either party may terminate this Agreement for convenience upon 30 days prior written notice.',
  'Client remains obligated to pay for all work performed and non-cancellable expenses incurred prior to termination.',
  '',
  '6. GOVERNING LAW',
  'This Agreement shall be governed by the laws of the State of California.'
];

const outputDir = path.join(__dirname, '..', 'public', 'test-fixtures', 'legal');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = [
  { name: '01_employment_agreement.pdf', content: doc1 },
  { name: '02_residential_lease.pdf', content: doc2 },
  { name: '03_freelance_services_agreement.pdf', content: doc3 },
  { name: '04_mutual_nda.pdf', content: doc4 },
  { name: '05_saas_vendor_agreement.pdf', content: doc5 },
  { name: '06_creative_agency_service_agreement.pdf', content: doc6 },
];

(async () => {
  let allPassed = true;
  for (const f of files) {
    const filePath = path.join(outputDir, f.name);
    const pdfBuf = makePdfProper(f.content);
    fs.writeFileSync(filePath, pdfBuf);
    try {
      const parsed = await pdf(pdfBuf);
      const firstLine = parsed.text.trim().split('\n')[0];
      console.log(`[PASS] ${f.name} -> ${parsed.text.length} chars | Title: "${firstLine}"`);
    } catch(e) {
      console.log(`[FAIL] ${f.name} -> ${e.message}`);
      allPassed = false;
    }
  }
  if (allPassed) {
    console.log('\nAll 6 PDF fixtures generated and verified successfully!');
  }
})();
