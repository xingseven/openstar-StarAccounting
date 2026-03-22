import iconv from "iconv-lite";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// XLSX 文件签名 (ZIP)
const XLSX_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // "PK.."

function isXlsx(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer[0] === XLSX_SIGNATURE[0] &&
         buffer[1] === XLSX_SIGNATURE[1] &&
         buffer[2] === XLSX_SIGNATURE[2] &&
         buffer[3] === XLSX_SIGNATURE[3];
}

function parseXlsx(buffer: Buffer): string[][] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return csv.split(/[\r\n]+/).map(row => row.split(","));
}

type Source = "wechat" | "alipay";

export type ImportRow = Record<string, string>;

export type ImportResult = {
  source: Source;
  headerIndex: number;
  headers: string[];
  rows: ImportRow[];
};

function normalizeCell(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function detectEncoding(buf: Buffer) {
  // 检查是否有 BOM
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    return "utf8";
  }

  // 检查是否是 GBK 编码（中文）
  const probe = buf.subarray(0, Math.min(buf.length, 4096));
  let hasGBKChars = 0;
  for (let i = 0; i < probe.length - 1; i++) {
    const byte = probe[i];
    // GBK 范围：0x81-0xFE (双字节)
    if (byte >= 0x81 && byte <= 0xFE) {
      hasGBKChars++;
      i++; // 跳过下一个字节
    }
  }

  // 如果发现大量可能的 GBK 字符，使用 GBK 解码
  if (hasGBKChars > 10) return "gbk";

  // 尝试用 UTF-8 解码，检查乱码
  const utf8Probe = probe.toString("utf8");
  const replacementCount = (utf8Probe.match(/�/g) || []).length;
  if (replacementCount > 2) return "gbk";

  return "utf8";
}

function parseRows(csvText: string) {
  // 移除 BOM 头
  const cleanText = csvText.replace(/^\uFEFF/, "");
  const parsed = Papa.parse<string[]>(cleanText, {
    skipEmptyLines: true,
  });

  const data = Array.isArray(parsed.data) ? parsed.data : [];
  return data
    .map((row) => (Array.isArray(row) ? row.map((c) => normalizeCell(c)) : []))
    .filter((row) => row.some((c) => c.length > 0));
}

function scoreHeader(row: string[], features: string[]) {
  const set = new Set(row.map((c) => c.replace(/\s+/g, "")));
  return features.reduce((acc, f) => acc + (set.has(f) ? 1 : 0), 0);
}

function findHeaderIndex(rows: string[][], source: Source) {
  // 微信特征列
  const wechatFeatures = ["交易时间", "交易类型", "收/支", "金额", "交易对方", "金额(元)"];
  // 支付宝特征列
  const alipayFeatures = ["交易时间", "交易分类", "交易对方", "收/支", "金额", "交易状态"];
  const features = source === "wechat" ? wechatFeatures : alipayFeatures;

  const maxScan = Math.min(rows.length, 100);
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < maxScan; i++) {
    const row = rows[i] ?? [];
    // 跳过空行
    if (row.length === 0 || row.every(c => !c || c.trim() === "")) continue;

    const set = new Set(row.map((c) => c.replace(/\s+/g, "")));
    const score = features.reduce((acc, f) => acc + (set.has(f) ? 1 : 0), 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  // 降低阈值，只要匹配2个以上特征就认为找到了
  const threshold = 2;
  if (bestIndex >= 0 && bestScore >= threshold) {
    return bestIndex;
  }
  return -1;
}

function buildRow(headers: string[], row: string[]) {
  const obj: ImportRow = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    if (!key) continue;
    obj[key] = row[i] ?? "";
  }
  return obj;
}

export function importCsvBuffer(buffer: Buffer, source: Source): ImportResult {
  let rows: string[][];

  // 检测是否是 XLSX 文件
  if (isXlsx(buffer)) {
    rows = parseXlsx(buffer);
  } else {
    // CSV/GBK 文件处理
    const encoding = detectEncoding(buffer);
    const text =
      encoding === "gbk" ? iconv.decode(buffer, "gbk") : buffer.toString("utf8");
    rows = parseRows(text);
  }

  const headerIndex = findHeaderIndex(rows, source);
  if (headerIndex < 0) {
    const err = new Error("IMPORT_HEADER_NOT_FOUND");
    (err as { code?: number }).code = 30001;
    throw err;
  }

  const headers = (rows[headerIndex] ?? []).map((h) => h.trim());
  const dataRows = rows.slice(headerIndex + 1);
  const objects = dataRows.map((r) => buildRow(headers, r));

  return { source, headerIndex, headers, rows: objects };
}

