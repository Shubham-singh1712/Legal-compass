const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

function extractParties(rawText) {
  const cleanText = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  // Match "between Party A ... and Party B ..."
  const partyPattern = /between\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)\s*(?:and|,?\s*and)\s+([A-Z][A-Za-z0-9\s.,]+?)\s+\(([^)]+)\)/i;
  const match = cleanText.match(partyPattern);
  if (!match) return [];

  const cleanRole = (roleStr) => {
    return roleStr
      .replace(/["']/g, '')
      .split(/\s+or\s+/i)[0]
      .replace(/^the\s+/i, '')
      .trim();
  };

  return [
    { name: match[1].trim(), role: cleanRole(match[2]) },
    { name: match[3].trim(), role: cleanRole(match[4]) },
  ];
}

async function testAll() {
  const dir = path.join(__dirname, '..', 'public', 'test-fixtures', 'legal');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    const data = await pdf(buf);
    const parties = extractParties(data.text);
    console.log(`${f} -> Parties:`, parties);
  }
}

testAll();
