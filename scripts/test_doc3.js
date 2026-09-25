const fs = require('fs');
const pdf = require('pdf-parse');

function createValidPdf(paragraphs) {
  let textStream = 'BT\n/F1 10 Tf\n50 750 Td\n14 TL\n';
  for (const para of paragraphs) {
    if (!para) {
      textStream += 'T*\n';
      continue;
    }
    const clean = para.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    textStream += `(${clean}) '\n`;
  }
  textStream += 'ET';

  const streamBuffer = Buffer.from(textStream, 'binary');
  const streamLength = streamBuffer.length;

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  objects.push(`4 0 obj\n<< /Length ${streamLength} >>\nstream\n${textStream}\nendstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdfOutput = '%PDF-1.4\n';
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdfOutput, 'binary'));
    pdfOutput += objects[i];
  }

  const xrefOffset = Buffer.byteLength(pdfOutput, 'binary');
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \r\n`;
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \r\n';
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfOutput + xref + trailer, 'binary');
}

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
  'Payment schedule: 30% upfront deposit upon signing, 40% upon milestone 2 delivery, and 30% upon final acceptance.',
  'Invoices are payable within Net 15 days of invoice date. Late payments incur a 1.5% monthly late fee.',
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

(async () => {
  for (let i = 1; i <= doc3.length; i++) {
    const sub = doc3.slice(0, i);
    const pdfBuf = createValidPdf(sub);
    try {
      const data = await pdf(pdfBuf);
      console.log(`Lines 1..${i}: length=${data.text.length} (OK)`);
    } catch(e) {
      console.log(`Lines 1..${i}: ERROR:`, e.message);
    }
  }
})();
