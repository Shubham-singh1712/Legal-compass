const fs = require('fs');
const pdf = require('pdf-parse');

function makePdfProper(lines) {
  let streamText = 'BT\n/F1 10 Tf\n50 750 Td\n';
  for (const l of lines) {
    if (!l) {
      streamText += '0 -10 Td\n';
    } else {
      const clean = l.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      streamText += `(${clean}) Tj\n0 -14 Td\n`;
    }
  }
  streamText += 'ET\n';

  const streamBuf = Buffer.from(streamText, 'binary');

  const obj1 = Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'binary');
  const obj2 = Buffer.from('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n', 'binary');
  const obj3 = Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /ProcSet [/PDF /Text] /Font << /F1 5 0 R >> >> >>\nendobj\n', 'binary');
  const obj4Head = Buffer.from(`4 0 obj\n<< /Length ${streamBuf.length} >>\nstream\n`, 'binary');
  const obj4Tail = Buffer.from('\nendstream\nendobj\n', 'binary');
  const obj4 = Buffer.concat([obj4Head, streamBuf, obj4Tail]);
  const obj5 = Buffer.from('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n', 'binary');

  const header = Buffer.from('%PDF-1.4\n', 'binary');
  const objs = [obj1, obj2, obj3, obj4, obj5];

  let totalOffset = header.length;
  const offsets = [];
  for (const o of objs) {
    offsets.push(totalOffset);
    totalOffset += o.length;
  }

  const startXref = totalOffset;
  let xrefStr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \r\n`;
  for (const ofs of offsets) {
    xrefStr += String(ofs).padStart(10, '0') + ' 00000 n \r\n';
  }
  const xrefBuf = Buffer.from(xrefStr, 'binary');
  const trailerBuf = Buffer.from(`trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`, 'binary');

  return Buffer.concat([header, ...objs, xrefBuf, trailerBuf]);
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
  const buf = makePdfProper(doc3);
  try {
    const d = await pdf(buf);
    console.log('SUCCESS! Extracted length:', d.text.length);
    console.log('--- EXTRACTED TEXT PREVIEW ---');
    console.log(d.text.substring(0, 300));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
})();
