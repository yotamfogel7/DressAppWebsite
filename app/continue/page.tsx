import { redirect } from "next/navigation"
import { getPostAuthRedirectPath } from "@/lib/post-auth-redirect"

export default async function ContinuePage() {
  redirect(await getPostAuthRedirectPath())
}
