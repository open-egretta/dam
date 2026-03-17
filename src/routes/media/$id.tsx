import { getMedia } from "@/utils/media.functions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { filesize } from "filesize";

export const Route = createFileRoute("/media/$id")({
  loader: async ({ params }) => {
    const media = await getMedia({ data: { id: params.id } });
    return { media };
  },
  component: MediaDetailPage,
});

function MediaDetailPage() {
  const { media } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to="/media"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          返回圖庫
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Image */}
          <div className="bg-gray-100 md:w-3/5 flex items-center justify-center min-h-64">
            <img
              src={`/uploads/${media.filename}`}
              alt={media.originalName}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="md:w-2/5 p-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-lg font-semibold text-gray-900 break-all">
                {media.originalName}
              </h1>

              <dl className="text-sm space-y-2">
                {media.category && (
                  <div className="flex gap-2">
                    <dt className="text-gray-400 w-16 shrink-0">分類</dt>
                    <dd className="text-gray-700">{media.category}</dd>
                  </div>
                )}
                {media.width > 0 && media.height > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-gray-400 w-16 shrink-0">尺寸</dt>
                    <dd className="text-gray-700">
                      {media.width} × {media.height}
                    </dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">大小</dt>
                  <dd className="text-gray-700">
                    {filesize(media.size, { standard: "jedec" })}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">格式</dt>
                  <dd className="text-gray-700">{media.mimeType}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">上傳</dt>
                  <dd className="text-gray-700">
                    {new Date(media.createdAt).toLocaleString("zh-TW")}
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href={`/api/media/download/${media.id}`}
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={15} />
              下載原檔
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
