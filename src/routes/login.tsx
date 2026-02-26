import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";

const checkHasUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("@/lib/db");
  const row = db.prepare(`SELECT COUNT(*) as count FROM "user"`).get() as {
    count: number;
  };
  return row.count > 0;
});

export const Route = createFileRoute("/login")({
  loader: async () => {
    const hasUsers = await checkHasUsers();
    return { hasUsers };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { hasUsers: initialHasUsers } = Route.useLoaderData();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If no users exist → registration mode; otherwise → login only
  const isRegister = !initialHasUsers;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const res = await authClient.signUp.email({
          name: name || email,
          email,
          password,
        });
        if (res.error) {
          setError(res.error.message ?? "註冊失敗");
          return;
        }
        router.navigate({ to: "/admin" });
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (res.error) {
          setError(res.error.message ?? "登入失敗");
          return;
        }
        router.navigate({ to: "/admin" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 mb-4">
            <Lock size={28} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DAM</h1>
          <p className="text-gray-400 text-sm mt-1">數位資產管理系統</p>
        </div>

        {/* First-user notice */}
        {isRegister && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-2">
            <UserPlus size={16} className="shrink-0 mt-0.5" />
            <span>目前系統尚無帳號，請建立第一位管理員帳號。</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">
            {isRegister ? "建立管理員帳號" : "登入"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  名稱
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="顯示名稱"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                密碼
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "至少 8 位字元" : "••••••••"}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
            >
              {loading ? "處理中…" : isRegister ? "建立帳號" : "登入"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
