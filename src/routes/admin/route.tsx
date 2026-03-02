import { getSession } from "@/lib/auth.functions";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  FolderOpen,
  Images,
  LayoutDashboard,
  Library,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  server: {},
  beforeLoad: async ({}) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        // search: { redirect: location.href },
      });
    }
    return { user: session.user };
  },
  component: RouteComponent,
});

const NAV_ITEMS = [
  { to: "/admin" as const, label: "儀表板", icon: LayoutDashboard },
  { to: "/admin/upload" as const, label: "上傳素材", icon: Upload },
  { to: "/admin/media" as const, label: "素材管理", icon: Library },
  { to: "/admin/categories" as const, label: "分類管理", icon: FolderOpen },
  { to: "/media" as const, label: "瀏覽媒體庫", icon: Images },
];

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Admin
          </p>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              activeProps={{
                className:
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-cyan-50 text-cyan-700 font-medium",
              }}
              activeOptions={to === "/admin" ? { exact: true } : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
