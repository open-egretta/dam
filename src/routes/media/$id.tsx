import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/media/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/media/$id"!</div>
}
