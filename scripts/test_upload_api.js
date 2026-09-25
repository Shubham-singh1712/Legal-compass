const fs = require('fs');
const http = require('http');
const path = require('path');

const files = [
  '01_employment_agreement.pdf',
  '02_residential_lease.pdf',
  '03_freelance_services_agreement.pdf',
  '04_mutual_nda.pdf',
  '05_saas_vendor_agreement.pdf',
  '06_creative_agency_service_agreement.pdf'
];

async function testUpload(fileName) {
  const filePath = path.join(__dirname, '../public/test-fixtures/legal', fileName);
  const buf = fs.readFileSync(filePath);
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  
  const body = Buffer.concat([
    Buffer.from(header, 'utf8'),
    buf,
    Buffer.from(footer, 'utf8')
  ]);

  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/documents/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ fileName, status: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ fileName, status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => resolve({ fileName, error: err.message }));
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('Testing upload of all 6 test PDFs:');
  for (const file of files) {
    const res = await testUpload(file);
    console.log(`\nFile: ${file}`);
    console.log(`Status: ${res.status}`);
    console.log(`Body:`, res.body || res.raw || res.error);
  }
}

run();
