import { writeFile, mkdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { MediaRow, UploadResult } from "./media";
import { getSession } from "@/lib/auth.functions";

const UPLOAD_DIR = resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function assertSession() {
  const session = await getSession();

  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function saveMediaFiles(
  files: File[],
  category: string,
  userId: string,
): Promise<UploadResult> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const uploaded: UploadResult["uploaded"] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      errors.push(`${file.name}: unsupported type ${file.type}`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: exceeds 20 MB limit`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { width, height } = getImageDimensions(buffer, file.type);

    const id = randomUUID();
    const ext = extname(file.name) || mimeToExt(file.type);
    const filename = `${id}${ext}`;
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    db.prepare(
      `INSERT INTO media (id, filename, originalName, mimeType, size, width, height, category, uploadedBy, createdAt)
       VALUES (@id, @filename, @originalName, @mimeType, @size, @width, @height, @category, @uploadedBy, @createdAt)`,
    ).run({
      id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      width,
      height,
      category,
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
    });

    uploaded.push({ id, filename, originalName: file.name });
  }

  return { uploaded, errors };
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  return map[mime] ?? ".bin";
}

function getImageDimensions(
  buf: Buffer,
  mime: string,
): { width: number; height: number } {
  try {
    if (mime === "image/png") {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (mime === "image/gif") {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (mime === "image/webp") {
      const riff = buf.toString("ascii", 0, 4);
      const webp = buf.toString("ascii", 8, 12);
      if (riff === "RIFF" && webp === "WEBP") {
        const chunkType = buf.toString("ascii", 12, 16);
        if (chunkType === "VP8 ") {
          return {
            width: (buf.readUInt16LE(26) & 0x3fff) + 1,
            height: (buf.readUInt16LE(28) & 0x3fff) + 1,
          };
        }
        if (chunkType === "VP8L") {
          const b = buf.readUInt32LE(21);
          return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
        }
        if (chunkType === "VP8X") {
          const w = (buf[24]! | (buf[25]! << 8) | (buf[26]! << 16)) + 1;
          const h = (buf[27]! | (buf[28]! << 8) | (buf[29]! << 16)) + 1;
          return { width: w, height: h };
        }
      }
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1]!;
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          return {
            width: buf.readUInt16BE(i + 7),
            height: buf.readUInt16BE(i + 5),
          };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch {
    // fall through
  }
  return { width: 0, height: 0 };
}
