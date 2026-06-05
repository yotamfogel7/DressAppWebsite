import { AuthError } from "next-auth"
import { signIn } from "@/auth"

/** Creates a full Auth.js session after pending signup is completed. */
export async function establishCredentialsSession(
  email: string,
  password: string,
): Promise<void> {
  try {
    await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      console.error("[establishCredentialsSession] signIn failed:", e.type, e)
      throw new Error("Could not sign you in after creating your account.")
    }
    throw e
  }
}
