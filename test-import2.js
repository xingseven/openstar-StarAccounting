
const fs = require('fs');
const { importCsvBuffer } = require('./src/server/dist/etl/importCsv.js');
const { mapRowToTransaction } = require('./src/server/dist/etl/mapTransaction.js');
const buf = fs.readFileSync('f:/1python/xiangmu/openstar-xfdashboard/支付宝交易明细(20260101-20260322).xlsx');
try {
  const imported = importCsvBuffer(buf, 'alipay');
  console.log('headerIndex:', imported.headerIndex);
  console.log('headers:', imported.headers);
  console.log('rows count:', imported.rows.length);
  const mapped = imported.rows.map(r => mapRowToTransaction(r, 'alipay'));
  const valid = mapped.filter(m => m.ok);
  const invalid = mapped.filter(m => !m.ok);
  console.log('valid:', valid.length);
  console.log('invalid:', invalid.length);
  if (invalid.length > 0) {
    console.log('first 5 invalid reasons:', invalid.slice(0, 5).map(i => i.reason));
    console.log('first 5 invalid rows:', imported.rows.slice(0, 5));
  }
} catch (e) {
  console.error(e);
}

