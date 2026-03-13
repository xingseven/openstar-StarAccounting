import iconv from "iconv-lite";
import Papa from "papaparse";

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
  const probe = buf.subarray(0, Math.min(buf.length, 4096)).toString("utf8");
  const replacementCount = probe.split("�").length - 1;
  if (replacementCount > 2) return "gbk";
  return "utf8";
}

function parseRows(csvText: string) {
  const parsed = Papa.parse<string[]>(csvText, {
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
  const wechatFeatures = ["交易时间", "交易类型", "收/支", "金额(元)", "交易单号"];
  const alipayFeatures = ["交易时间", "交易分类", "收/支金额", "交易订单号", "商家订单号"];
  const features = source === "wechat" ? wechatFeatures : alipayFeatures;

  const maxScan = Math.min(rows.length, 80);
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < maxScan; i++) {
    const score = scoreHeader(rows[i] ?? [], features);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex >= 0 && bestScore >= 3) return bestIndex;
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
  const encoding = detectEncoding(buffer);
  const text =
    encoding === "gbk" ? iconv.decode(buffer, "gbk") : buffer.toString("utf8");

  const rows = parseRows(text);
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

