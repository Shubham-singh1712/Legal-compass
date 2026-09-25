const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function testAll() {
  const dir = path.join(__dirname, '..', 'public', 'test-fixtures', 'legal');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

  for (const f of files) {
    try {
      const buf = fs.readFileSync(path.join(dir, f));
      const data = await pdf(buf);
      console.log(`SUCCESS [${f}]: text length = ${data.text.length}`);
    } catch (err) {
      console.error(`FAILED [${f}]: ${err.message}`);
    }
  }
}

testAll();
