import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/media")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
