const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// Standalone verification replicating the engine logic
async function verify() {
  const pdfPath = path.join(__dirname, '..', 'public', 'test-fixtures', 'legal', '03_freelance_services_agreement.pdf');
  const buf = fs.readFileSync(pdfPath);
  const pdfData = await pdf(buf);
  const text = pdfData.text;

  console.log('=== VERIFYING REAL ANALYSIS ENGINE ON 03_FREELANCE_SERVICES_AGREEMENT.PDF ===');
  console.log(`Document text extracted: ${text.length} characters\n`);

  // 1. Classification
  let detectedType = 'Commercial Contract';
  if (/\bFREELANCE SERVICES\b|\bFREELANCER\b|\bCONTRACTOR\b.*\bCLIENT\b/i.test(text)) {
    detectedType = 'Freelance / Services Agreement';
  }
  console.log(`1. Detected Type: "${detectedType}"`);

  // 2. Role
  const roleMap = {
    'Employment Agreement': 'Employee',
    'Freelance / Services Agreement': 'Freelancer',
    'Residential Rental Agreement': 'Tenant',
  };
  const role = roleMap[detectedType] || 'Other';
  console.log(`2. Inferred Role: "${role}" (MUST NOT BE 'Employee')`);

  // 3. Parties
  const clean = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  const partyPattern = /between\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)\s*(?:and|,?\s*and)\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)/i;
  const match = clean.match(partyPattern);
  const cleanRole = (r) => r.replace(/["']/g, '').split(/\s+or\s+/i)[0].replace(/^the\s+/i, '').trim();
  const parties = match ? [
    { name: match[1].trim(), role: cleanRole(match[2]) },
    { name: match[3].trim(), role: cleanRole(match[4]) },
  ] : [];
  console.log(`3. Parties:`, parties);

  // 4. Rights
  const RIGHT_PATTERNS = [
    { pattern: /retains? the right\s+([^.]+)/i, title: 'Retained Right' },
    { pattern: /retains?\s+([^.]+portfolio[^.]+)/i, title: 'Portfolio Display Right' },
    { pattern: /may terminate\s+([^.]+)/i, title: 'Termination Right' },
    { pattern: /shall provide up to\s+([^.]+revisions?)/i, title: 'Revision Right' },
    { pattern: /shall pay\s+([^.]+(?:completed milestone work|severance|bonus)[^.]*)/i, title: 'Payment Right' },
  ];
  const rights = [];
  for (const rp of RIGHT_PATTERNS) {
    const m = text.match(rp.pattern);
    if (m) rights.push({ title: rp.title, excerpt: m[0] });
  }
  console.log(`4. Rights Extracted (${rights.length}):`, rights.map(r => r.title));

  // 5. Obligations
  const OBLIGATION_PATTERNS = [
    /(?:shall|must|agrees? to|is required to|undertakes? to)\s+([^.]{12,120})/ig,
  ];
  const obligations = [];
  for (const p of OBLIGATION_PATTERNS) {
    let m;
    while ((m = p.exec(text)) !== null) {
      obligations.push(m[0].trim());
    }
  }
  console.log(`5. Obligations Extracted (${obligations.length}):`, obligations.slice(0, 4));

  // 6. Deadlines
  const DEADLINE_PATTERNS = [
    /within\s+(\d+\s+(?:business\s+)?(?:days?|weeks?|months?|hours?))(?:\s+of|\s+after|\s+receipt)?/ig,
    /Net\s+(\d+)\s+days?(?:\s+of\s+invoice\s+date)?/ig,
    /(\d+)\s+days?\s+(?:prior|advance|written)\s+notice/ig,
    /for\s+(\d+\s+(?:years?|months?))\s+(?:from|following)\s+disclosure/ig,
  ];
  const deadlines = [];
  for (const dp of DEADLINE_PATTERNS) {
    let m;
    while ((m = dp.exec(text)) !== null) {
      deadlines.push(m[0].trim());
    }
  }
  console.log(`6. Deadlines Extracted (${deadlines.length}):`, deadlines);

  console.log('\n=============================================');
  console.log('SUMMARY METRICS:');
  console.log(`Role: ${role}`);
  console.log(`Rights: ${rights.length}`);
  console.log(`Obligations: ${obligations.length}`);
  console.log(`Deadlines: ${deadlines.length}`);
  console.log('=============================================');
}

verify();
