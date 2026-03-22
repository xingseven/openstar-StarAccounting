const fs = require('fs');
const iconv = require('iconv-lite');
const { importCsvBuffer } = require('./src/server/dist/etl/importCsv.js');
const { mapRowToTransaction } = require('./src/server/dist/etl/mapTransaction.js');
const bufUtf8 = fs.readFileSync('test-alipay-real.csv');
const text = bufUtf8.toString('utf8');
const bufGbk = iconv.encode(text, 'gbk');
console.log('--- UTF8 Test ---');
try {
  const importedUtf8 = importCsvBuffer(bufUtf8, 'alipay');
  console.log('UTF8 rows count:', importedUtf8.rows.length);
} catch(e) { console.error('UTF8 Error:', e.message); }
console.log('--- GBK Test ---');
try {
  const importedGbk = importCsvBuffer(bufGbk, 'alipay');
  console.log('GBK rows count:', importedGbk.rows.length);
} catch(e) { console.error('GBK Error:', e.message); }
