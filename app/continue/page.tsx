import { redirect } from "next/navigation"
import { getPostAuthRedirectPath } from "@/lib/post-auth-redirect"

export default async function ContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const sp = await searchParams
  redirect(await getPostAuthRedirectPath(sp.next))
}
