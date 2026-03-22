
const fs = require('fs');
const XLSX = require('xlsx');
const workbook = XLSX.readFile('f:/1python/xiangmu/openstar-xfdashboard/支付宝交易明细(20260101-20260322).xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const csv = XLSX.utils.sheet_to_csv(sheet);
const lines = csv.split(/[\r\n]+/);
for (let i = 0; i < Math.min(30, lines.length); i++) {
  console.log('Line ' + (i + 1) + ':', lines[i]);
}

