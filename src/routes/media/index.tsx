import { db } from "@/lib/db";
import { listCategories } from "@/utils/categories.functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

interface MediaRow {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  category: string;
  uploadedBy: string;
  createdAt: string;
}

const listMediaSchema = z.object({
  category: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().min(0).default(0),
});
const listMedia = createServerFn({ method: "GET" })
  .inputValidator(listMediaSchema)
  .handler(async ({ data }) => {
    const { category, limit, offset } = data;
    console.log(`createServerFn`);
    if (category && category !== "All") {
      return db
        .prepare(
          `SELECT * FROM media WHERE category = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        )
        .all(category, limit, offset) as MediaRow[];
    }
    return db
      .prepare(`SELECT * FROM media ORDER BY createdAt DESC LIMIT ? OFFSET ?`)
      .all(limit, offset) as MediaRow[];
  });

export const Route = createFileRoute("/media/")({
  loader: async () => {
    const [media, categories] = await Promise.all([
      listMedia({ data: { limit: 100, offset: 0 } }),
      listCategories(),
    ]);
    return { media, categories };
  },
  staleTime: 0,
  component: RouteComponent,
});

function ImageCard({
  row,
  isAdmin,
  onOpen,
  onDeleted,
}: {
  row: MediaRow;
  isAdmin: boolean;
  onOpen: () => void;
  onDeleted: () => void;
}) {
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("確定要刪除此素材？")) return;
    const res = await fetch("/api/media/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    if (res.ok) onDeleted();
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group bg-gray-200 aspect-square"
      onClick={onOpen}
    >
      <img
        src={`/uploads/${row.filename}`}
        alt={row.originalName}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white font-medium text-xs truncate">
          {row.originalName}
        </p>
      </div>

      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-1.5 right-1.5 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
          title="刪除"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const { categories, media } = loaderData;
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered =
    activeCategory === "All"
      ? media
      : media.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto py-3 scrollbar-none">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === "All"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.name
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      {/* Media Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-2xl font-light">No results found</p>
            <p className="mt-2 text-sm">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((row) => (
              <ImageCard
                key={row.id}
                row={row}
                isAdmin={false}
                onOpen={() => {}}
                onDeleted={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
