const fs = require('fs');
const pdf = require('pdf-parse');

async function run() {
  const buf = fs.readFileSync('public/test-fixtures/legal/03_freelance_services_agreement.pdf');
  const data = await pdf(buf);
  const rawText = data.text;

  // Let's test the patterns from analysisEngine
  const RIGHT_PATTERNS = [
    { pattern: /entitled to\s+([^.]+)/i, title: 'Entitlement Right' },
    { pattern: /may terminate\s+([^.]+)/i, title: 'Termination Right' },
    { pattern: /right to\s+([^.]+)/i, title: 'Explicit Right' },
    { pattern: /shall receive\s+([^.]+)/i, title: 'Payment / Receipt Right' },
    { pattern: /retains? the right\s+([^.]+)/i, title: 'Retained Right' },
    { pattern: /retains?\s+([^.]+portfolio[^.]+)/i, title: 'Portfolio Display Right' },
    { pattern: /severance\s+([^.]+)/i, title: 'Severance Right' },
    { pattern: /eligible for\s+([^.]+)/i, title: 'Eligibility Right' },
    { pattern: /refundable\s+([^.]+)/i, title: 'Refund Right' },
    { pattern: /service credit\s+([^.]+)/i, title: 'Service Credit Right' },
    { pattern: /ownership of\s+([^.]+)/i, title: 'Ownership Right' },
    { pattern: /shall provide up to\s+([^.]+revisions?)/i, title: 'Revision Right' },
  ];

  const OBLIGATION_PATTERNS = [
    /(?:shall|must|agrees? to|is required to|will|obligated to)\s+([^.]{10,120})/ig,
    /(?:is responsible for|undertakes? to)\s+([^.]{10,100})/ig,
  ];

  console.log('--- TESTING RIGHTS ---');
  for (const rp of RIGHT_PATTERNS) {
    const m = rawText.match(rp.pattern);
    if (m) {
      console.log(`[RIGHT] ${rp.title}: ${m[0]}`);
    }
  }

  console.log('\n--- TESTING OBLIGATIONS ---');
  for (const pat of OBLIGATION_PATTERNS) {
    let m;
    while ((m = pat.exec(rawText)) !== null) {
      console.log(`[OBLIGATION]: ${m[0].trim()}`);
    }
  }

  console.log('\n--- TESTING DEADLINES ---');
  const DEADLINE_PATTERNS = [
    /within\s+(\d+\s+(?:business\s+)?(?:days?|weeks?|months?|hours?))[^.]{0,80}/ig,
    /Net\s+(\d+)\s+days?[^.]{0,80}/ig,
    /(\d+)\s+(?:days?|weeks?|months?)\s+(?:prior|advance|written|before)[^.]{0,80}/ig,
    /for\s+(\d+\s+(?:years?|months?))\s+from[^.]{0,80}/ig,
  ];
  for (const dp of DEADLINE_PATTERNS) {
    let m;
    while ((m = dp.exec(rawText)) !== null) {
      console.log(`[DEADLINE]: ${m[0].trim()}`);
    }
  }
}

run();
