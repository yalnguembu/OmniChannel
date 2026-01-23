import { createFileRoute } from "@tanstack/react-router"
import { ClientSegmentMembersListPage } from "@/features/clientSegmentMember/pages/ClientSegmentMembersListPage"

export const Route = createFileRoute("/_protected/clientSegmentMember/")({
  component: ClientSegmentMembersListPage,
})
