import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const ORB_FILES_DIR = path.join(process.cwd(), "orb-files");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_PAGES = 30;

export type GeneratedFileType = "docx" | "xlsx" | "pdf";
export type UploadedFileType = "pdf" | "docx" | "xlsx" | "txt" | "csv";

export interface ExtractedFile {
  fileName: string;
  fileType: UploadedFileType;
  text: string;
  truncated: boolean;
}

export interface OrbFileMeta {
  id: string;
  fileName: string;
  type: GeneratedFileType;
  ownerId: string;
  createdAt: string;
}

const MIME_TO_TYPE: Record<string, UploadedFileType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "text/csv": "csv",
};

const EXT_TO_TYPE: Record<string, UploadedFileType> = {
  pdf: "pdf",
  docx: "docx",
  xlsx: "xlsx",
  txt: "txt",
  csv: "csv",
};

const MAX_EXTRACTED_CHARS = 60_000;

export function resolveUploadType(fileName: string, mime: string): UploadedFileType | null {
  if (MIME_TO_TYPE[mime]) return MIME_TO_TYPE[mime];
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_TYPE[ext] ?? null;
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function extractPdf(buffer: Buffer): Promise<string> {
  type PdfParseFn = (data: Buffer) => Promise<{ text: string; numpages: number }>;
  const mod = (await import("pdf-parse")) as unknown as { default: PdfParseFn };
  const parsed = await mod.default(buffer);
  if (parsed.numpages > MAX_PDF_PAGES) {
    throw new Error(`PDF превышает лимит ${MAX_PDF_PAGES} страниц (${parsed.numpages}).`);
  }
  return parsed.text;
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const input = { buffer } as unknown as Parameters<typeof mammoth.extractRawText>[0];
  const result = await mammoth.extractRawText(input);
  return result.value;
}

async function extractXlsx(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const parts: string[] = [];
  workbook.eachSheet(sheet => {
    parts.push(`# Лист: ${sheet.name}`);
    sheet.eachRow(row => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: false }, cell => {
        const value = cell.value;
        if (value === null || value === undefined) return;
        if (typeof value === "object" && value !== null && "result" in value) {
          cells.push(String((value as { result: unknown }).result ?? ""));
        } else {
          cells.push(String(value));
        }
      });
      if (cells.length > 0) parts.push(cells.join("\t"));
    });
    parts.push("");
  });
  return parts.join("\n");
}

export async function extractFileText(
  fileName: string,
  fileType: UploadedFileType,
  buffer: Buffer,
): Promise<ExtractedFile> {
  let text: string;
  switch (fileType) {
    case "pdf":
      text = await extractPdf(buffer);
      break;
    case "docx":
      text = await extractDocx(buffer);
      break;
    case "xlsx":
      text = await extractXlsx(buffer);
      break;
    case "txt":
    case "csv":
      text = buffer.toString("utf8");
      break;
  }

  const truncated = text.length > MAX_EXTRACTED_CHARS;
  return {
    fileName,
    fileType,
    text: truncated ? text.slice(0, MAX_EXTRACTED_CHARS) : text,
    truncated,
  };
}

export interface DocxSpec {
  title?: string;
  sections: { heading?: string; paragraphs: string[] }[];
}

export interface XlsxSpec {
  sheetName?: string;
  headers?: string[];
  rows: (string | number)[][];
}

export interface PdfSpec {
  title?: string;
  paragraphs: string[];
}

export interface GenerateRequest {
  type: GeneratedFileType;
  fileName: string;
  docx?: DocxSpec;
  xlsx?: XlsxSpec;
  pdf?: PdfSpec;
}

async function buildDocx(spec: DocxSpec): Promise<Buffer> {
  const children: Paragraph[] = [];
  if (spec.title) {
    children.push(new Paragraph({ text: spec.title, heading: HeadingLevel.TITLE }));
  }
  for (const section of spec.sections) {
    if (section.heading) {
      children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
    }
    for (const p of section.paragraphs) {
      children.push(new Paragraph({ children: [new TextRun(p)] }));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
}

async function buildXlsx(spec: XlsxSpec): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(spec.sheetName ?? "Sheet1");
  if (spec.headers && spec.headers.length > 0) {
    sheet.addRow(spec.headers).font = { bold: true };
  }
  for (const row of spec.rows) {
    sheet.addRow(row);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function buildPdf(spec: PdfSpec): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const pageSize: [number, number] = [595, 842];
  const margin = 50;
  const titleSize = 18;
  const bodySize = 12;
  const lineHeight = 16;
  const maxWidth = pageSize[0] - margin * 2;

  function wrap(text: string, size: number, useFont = font): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  function ensureSpace(needed: number): void {
    if (y - needed < margin) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  }

  if (spec.title) {
    for (const line of wrap(spec.title, titleSize, fontBold)) {
      ensureSpace(lineHeight + 4);
      page.drawText(line, { x: margin, y: y - titleSize, size: titleSize, font: fontBold, color: rgb(0, 0, 0) });
      y -= lineHeight + 4;
    }
    y -= 8;
  }

  for (const p of spec.paragraphs) {
    for (const line of wrap(p, bodySize)) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: margin, y: y - bodySize, size: bodySize, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
    y -= 6;
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export async function generateFile(req: GenerateRequest, ownerId: string): Promise<OrbFileMeta> {
  await ensureDir(ORB_FILES_DIR);

  const id = `${Date.now()}-${randomBytes(6).toString("hex")}`;
  const safeName = req.fileName.replace(/[^a-zA-Z0-9_.\-А-Яа-яЁё ]/g, "_").slice(0, 100) || `orb-file.${req.type}`;
  const ensuredExt = safeName.endsWith(`.${req.type}`) ? safeName : `${safeName}.${req.type}`;
  const storedName = `${id}__${ensuredExt}`;
  const fullPath = path.join(ORB_FILES_DIR, storedName);

  let buffer: Buffer;
  switch (req.type) {
    case "docx":
      if (!req.docx) throw new Error("docx spec missing");
      buffer = await buildDocx(req.docx);
      break;
    case "xlsx":
      if (!req.xlsx) throw new Error("xlsx spec missing");
      buffer = await buildXlsx(req.xlsx);
      break;
    case "pdf":
      if (!req.pdf) throw new Error("pdf spec missing");
      buffer = await buildPdf(req.pdf);
      break;
  }

  await fs.writeFile(fullPath, buffer);

  return {
    id: storedName,
    fileName: ensuredExt,
    type: req.type,
    ownerId,
    createdAt: new Date().toISOString(),
  };
}

export async function readGeneratedFile(id: string): Promise<{ buffer: Buffer; fileName: string; type: GeneratedFileType } | null> {
  if (!/^[\w\-]+__[^/\\]+$/.test(id)) return null;
  const fullPath = path.join(ORB_FILES_DIR, id);
  try {
    const buffer = await fs.readFile(fullPath);
    const fileName = id.split("__").slice(1).join("__");
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext !== "docx" && ext !== "xlsx" && ext !== "pdf") return null;
    return { buffer, fileName, type: ext };
  } catch {
    return null;
  }
}

const MIME: Record<GeneratedFileType, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export function getMimeType(type: GeneratedFileType): string {
  return MIME[type];
}
