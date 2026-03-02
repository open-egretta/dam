import { createFileRoute } from "@tanstack/react-router";
import { resolve } from "path";
import { createReadStream, statSync } from "fs";

const UPLOAD_DIR = resolve(process.cwd(), "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export const Route = createFileRoute("/uploads/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { _splat: key } = params;
        console.log(key);
        if (!key) return new Response("Not found", { status: 404 });
        const filePath = resolve(UPLOAD_DIR, key);

        // 防 path traversal
        if (!filePath.startsWith(UPLOAD_DIR)) {
          return new Response("Forbidden", { status: 403 });
        }

        const ext = "." + key.split(".").pop()?.toLowerCase();
        if (!MIME[ext]) return new Response("Not found", { status: 404 });

        try {
          const { size } = statSync(filePath);
          const nodeStream = createReadStream(filePath);
          const stream = new ReadableStream({
            start(controller) {
              nodeStream.on("data", (chunk) => controller.enqueue(chunk));
              nodeStream.on("end", () => controller.close());
              nodeStream.on("error", (err) => controller.error(err));
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": MIME[ext],
              "Content-Length": String(size),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
