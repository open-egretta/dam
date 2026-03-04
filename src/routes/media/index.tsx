import { listCategories } from "@/utils/categories.functions";
import { listMedia } from "@/utils/media.functions";
import type { MediaRow } from "@/utils/media";
import { createFileRoute } from "@tanstack/react-router";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { filesize } from "filesize";

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

function thumbUrl(filename: string) {
  const uuid = filename.split(".")[0];
  return `/uploads/thumbs/${uuid}_thumb.webp`;
}

function ImageCard({
  row,
  onOpen,
}: {
  row: MediaRow;
  onOpen: (row: MediaRow) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer group bg-gray-200 aspect-square"
      onClick={() => onOpen(row)}
    >
      <img
        src={thumbUrl(row.filename)}
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
    </div>
  );
}

function DetailModal({
  row,
  onClose,
}: {
  row: MediaRow;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col sm:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="bg-gray-100 sm:w-1/2 flex items-center justify-center min-h-48">
          <img
            src={`/uploads/${row.filename}`}
            alt={row.originalName}
            className="max-h-[60vh] w-full object-contain"
          />
        </div>

        {/* Info */}
        <div className="sm:w-1/2 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold text-gray-900 break-all">
                {row.originalName}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="text-sm space-y-1.5">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">分類</dt>
                <dd className="text-gray-700">{row.category}</dd>
              </div>
              {row.width > 0 && row.height > 0 && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">尺寸</dt>
                  <dd className="text-gray-700">
                    {row.width} × {row.height}
                  </dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">大小</dt>
                <dd className="text-gray-700">
                  {filesize(row.size, { standard: "jedec" })}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">格式</dt>
                <dd className="text-gray-700">{row.mimeType}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-16 shrink-0">上傳</dt>
                <dd className="text-gray-700">
                  {new Date(row.createdAt).toLocaleString("zh-TW")}
                </dd>
              </div>
            </dl>
          </div>

          <a
            href={`/api/media/download/${row.id}`}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={15} />
            下載
          </a>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const loaderData = Route.useLoaderData();
  const { categories, media } = loaderData;
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<MediaRow | null>(null);

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
              <ImageCard key={row.id} row={row} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal row={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
