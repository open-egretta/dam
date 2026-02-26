import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth.functions";

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

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
