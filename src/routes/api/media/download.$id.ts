import { db } from "@/lib/db";
import { createFileRoute } from "@tanstack/react-router";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const UPLOAD_DIR = resolve(process.cwd(), "uploads");

export const Route = createFileRoute("/api/media/download/$id")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { id: string } }) => {
        const row = db
          .prepare(
            `SELECT filename, originalName, mimeType FROM media WHERE id = ?`,
          )
          .get(params.id) as
          | { filename: string; originalName: string; mimeType: string }
          | undefined;

        if (!row) {
          return new Response("Not Found", { status: 404 });
        }

        const buffer = await readFile(join(UPLOAD_DIR, row.filename));

        return new Response(buffer, {
          headers: {
            "Content-Type": row.mimeType,
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(row.originalName)}`,
          },
        });
      },
    },
  },
});
