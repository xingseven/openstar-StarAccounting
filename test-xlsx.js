
const XLSX = require('xlsx');
const workbook = XLSX.readFile('f:/1python/xiangmu/openstar-xfdashboard/支付宝交易明细(20260101-20260322).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('Total rows:', data.length);
for (let i = 0; i < Math.min(30, data.length); i++) {
  console.log('Row ' + (i + 1) + ':', data[i]);
}

