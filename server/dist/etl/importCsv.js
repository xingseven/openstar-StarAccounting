import iconv from "iconv-lite";
import Papa from "papaparse";
import * as XLSX from "xlsx";
const XLSX_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const UTF8_BOM = [0xef, 0xbb, 0xbf];
const UTF16LE_BOM = [0xff, 0xfe];
const UTF16BE_BOM = [0xfe, 0xff];
const CSV_DELIMITERS = [",", "\t", ";"];
function isXlsx(buffer) {
    if (buffer.length < 4)
        return false;
    return buffer[0] === XLSX_SIGNATURE[0]
        && buffer[1] === XLSX_SIGNATURE[1]
        && buffer[2] === XLSX_SIGNATURE[2]
        && buffer[3] === XLSX_SIGNATURE[3];
}
function startsWithBytes(buffer, bytes) {
    if (buffer.length < bytes.length)
        return false;
    return bytes.every((byte, index) => buffer[index] === byte);
}
function normalizeCell(value) {
    if (value === null || value === undefined)
        return "";
    return String(value).replace(/\u0000/g, "").trim();
}
function parseXlsx(buffer) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: "",
    });
    return rows
        .map((row) => (Array.isArray(row) ? row.map((cell) => normalizeCell(cell)) : []))
        .filter((row) => row.some((cell) => cell.length > 0));
}
function parseRows(csvText) {
    const cleanText = csvText.replace(/^\uFEFF/, "");
    const parsed = Papa.parse(cleanText, {
        skipEmptyLines: true,
    });
    const data = Array.isArray(parsed.data) ? parsed.data : [];
    return data
        .map((row) => (Array.isArray(row) ? row.map((cell) => normalizeCell(cell)) : []))
        .filter((row) => row.some((cell) => cell.length > 0));
}
function splitLenientLine(line, delimiter) {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = i + 1 < line.length ? line[i + 1] : "";
        if (char === "\"") {
            if (inQuotes && next === "\"") {
                current += "\"";
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }
        if (char === delimiter && !inQuotes) {
            cells.push(normalizeCell(current));
            current = "";
            continue;
        }
        current += char;
    }
    cells.push(normalizeCell(current));
    return cells;
}
function parseRowsLenient(csvText, source) {
    const cleanText = csvText.replace(/^\uFEFF/, "");
    const rawLines = cleanText
        .split(/\r\n|\n|\r/)
        .map((line) => line.replace(/\u0000/g, "").trimEnd())
        .filter((line) => line.trim().length > 0);
    let bestRows = [];
    let bestScore = -1;
    let bestColumns = -1;
    for (const delimiter of CSV_DELIMITERS) {
        const rows = rawLines
            .map((line) => splitLenientLine(line, delimiter))
            .filter((row) => row.some((cell) => cell.length > 0));
        const candidate = findHeaderCandidate(rows, source);
        if (candidate.headerIndex < 0)
            continue;
        const isBetter = candidate.headerScore > bestScore
            || (candidate.headerScore === bestScore && candidate.columnCount > bestColumns)
            || (candidate.headerScore === bestScore && candidate.columnCount === bestColumns && rows.length > bestRows.length);
        if (isBetter) {
            bestRows = rows;
            bestScore = candidate.headerScore;
            bestColumns = candidate.columnCount;
        }
    }
    return bestRows;
}
function getHeaderFeatures(source) {
    if (source === "wechat") {
        return ["交易时间", "交易类型", "收/支", "金额", "交易对方", "金额(元)"];
    }
    return ["交易时间", "交易分类", "交易对方", "收/支", "金额", "交易状态"];
}
function findHeaderCandidate(rows, source) {
    const features = getHeaderFeatures(source);
    const maxScan = Math.min(rows.length, 100);
    let best = {
        headerIndex: -1,
        headerScore: 0,
        columnCount: 0,
    };
    for (let i = 0; i < maxScan; i++) {
        const row = rows[i] ?? [];
        if (row.length === 0 || row.every((cell) => cell.trim() === ""))
            continue;
        const normalized = new Set(row.map((cell) => cell.replace(/\s+/g, "")));
        const score = features.reduce((total, feature) => total + (normalized.has(feature) ? 1 : 0), 0);
        const columnCount = row.filter((cell) => cell.length > 0).length;
        const isBetter = score > best.headerScore
            || (score === best.headerScore && columnCount > best.columnCount);
        if (isBetter) {
            best = {
                headerIndex: i,
                headerScore: score,
                columnCount,
            };
        }
    }
    return best;
}
function hasUtf16NullPattern(buffer) {
    const probe = buffer.subarray(0, Math.min(buffer.length, 4096));
    let evenNulls = 0;
    let oddNulls = 0;
    for (let i = 0; i < probe.length; i++) {
        if (probe[i] !== 0)
            continue;
        if (i % 2 === 0) {
            evenNulls++;
        }
        else {
            oddNulls++;
        }
    }
    const threshold = Math.max(8, Math.floor(probe.length * 0.1));
    return evenNulls >= threshold || oddNulls >= threshold;
}
function detectLegacyEncoding(buffer) {
    if (startsWithBytes(buffer, UTF8_BOM))
        return "utf8";
    if (startsWithBytes(buffer, UTF16LE_BOM))
        return "utf16le";
    if (startsWithBytes(buffer, UTF16BE_BOM))
        return "utf16be";
    const probe = buffer.subarray(0, Math.min(buffer.length, 4096));
    let hasGbkChars = 0;
    for (let i = 0; i < probe.length - 1; i++) {
        const byte = probe[i];
        if (byte >= 0x81 && byte <= 0xfe) {
            hasGbkChars++;
            i++;
        }
    }
    if (hasGbkChars > 10)
        return "gbk";
    const utf8Probe = probe.toString("utf8");
    const replacementCount = (utf8Probe.match(/�/g) || []).length;
    if (replacementCount > 2)
        return "gbk";
    return "utf8";
}
function getEncodingCandidates(buffer) {
    const candidates = [];
    if (startsWithBytes(buffer, UTF16LE_BOM)) {
        candidates.push("utf16le", "utf8", "gbk", "utf16be");
    }
    else if (startsWithBytes(buffer, UTF16BE_BOM)) {
        candidates.push("utf16be", "utf8", "gbk", "utf16le");
    }
    else if (hasUtf16NullPattern(buffer)) {
        candidates.push("utf16le", "utf16be");
        const fallback = detectLegacyEncoding(buffer);
        candidates.push(fallback, fallback === "utf8" ? "gbk" : "utf8");
    }
    else {
        const primary = detectLegacyEncoding(buffer);
        candidates.push(primary, primary === "utf8" ? "gbk" : "utf8", "utf16le", "utf16be");
    }
    return candidates.filter((encoding, index) => candidates.indexOf(encoding) === index);
}
function decodeUtf16be(buffer) {
    const body = startsWithBytes(buffer, UTF16BE_BOM) ? buffer.subarray(2) : buffer;
    const swapped = Buffer.from(body);
    for (let i = 0; i < swapped.length - 1; i += 2) {
        const temp = swapped[i];
        swapped[i] = swapped[i + 1];
        swapped[i + 1] = temp;
    }
    return iconv.decode(swapped, "utf16-le");
}
function decodeBuffer(buffer, encoding) {
    switch (encoding) {
        case "utf8":
            return buffer.toString("utf8");
        case "gbk":
            return iconv.decode(buffer, "gbk");
        case "utf16le":
            return iconv.decode(buffer, "utf16-le");
        case "utf16be":
            return decodeUtf16be(buffer);
        case "xlsx":
            throw new Error("XLSX decode should use parseXlsx");
        default:
            return buffer.toString("utf8");
    }
}
function buildRow(headers, row) {
    const result = {};
    for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        if (!key)
            continue;
        result[key] = row[i] ?? "";
    }
    return result;
}
function buildCandidate(rows, source, encoding) {
    const { headerIndex, headerScore } = findHeaderCandidate(rows, source);
    if (headerIndex < 0 || headerScore < 2)
        return null;
    return {
        encoding,
        rows,
        headerIndex,
        headerScore,
        dataCount: Math.max(0, rows.length - headerIndex - 1),
    };
}
function pickBetterCandidate(current, next) {
    if (!next)
        return current;
    if (!current)
        return next;
    if (next.headerScore !== current.headerScore) {
        return next.headerScore > current.headerScore ? next : current;
    }
    if (next.dataCount !== current.dataCount) {
        return next.dataCount > current.dataCount ? next : current;
    }
    return next.rows.length > current.rows.length ? next : current;
}
export function importCsvBuffer(buffer, source) {
    if (isXlsx(buffer)) {
        const rows = parseXlsx(buffer);
        const candidate = buildCandidate(rows, source, "xlsx");
        if (!candidate) {
            const err = new Error("IMPORT_HEADER_NOT_FOUND");
            err.code = 30001;
            throw err;
        }
        if (candidate.dataCount <= 0) {
            const err = new Error("IMPORT_NO_DATA_ROWS");
            err.code = 30002;
            throw err;
        }
        const headers = (rows[candidate.headerIndex] ?? []).map((header) => header.trim());
        const objects = rows.slice(candidate.headerIndex + 1).map((row) => buildRow(headers, row));
        return {
            source,
            headerIndex: candidate.headerIndex,
            headers,
            rows: objects,
            encoding: "xlsx",
        };
    }
    let bestCandidate = null;
    for (const encoding of getEncodingCandidates(buffer)) {
        try {
            const decoded = decodeBuffer(buffer, encoding);
            const parsedRows = parseRows(decoded);
            const parsedCandidate = buildCandidate(parsedRows, source, encoding);
            bestCandidate = pickBetterCandidate(bestCandidate, parsedCandidate);
            const lenientRows = parseRowsLenient(decoded, source);
            const lenientCandidate = buildCandidate(lenientRows, source, encoding);
            bestCandidate = pickBetterCandidate(bestCandidate, lenientCandidate);
        }
        catch {
            // Ignore invalid decode candidates and keep trying.
        }
    }
    if (!bestCandidate) {
        const err = new Error("IMPORT_HEADER_NOT_FOUND");
        err.code = 30001;
        throw err;
    }
    if (bestCandidate.dataCount <= 0) {
        const err = new Error("IMPORT_NO_DATA_ROWS");
        err.code = 30002;
        throw err;
    }
    const headers = (bestCandidate.rows[bestCandidate.headerIndex] ?? []).map((header) => header.trim());
    const objects = bestCandidate.rows
        .slice(bestCandidate.headerIndex + 1)
        .map((row) => buildRow(headers, row));
    return {
        source,
        headerIndex: bestCandidate.headerIndex,
        headers,
        rows: objects,
        encoding: bestCandidate.encoding,
    };
}
