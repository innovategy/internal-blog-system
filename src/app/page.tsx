import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  
  // Redirect based on authentication status
  if (session) {
    // If authenticated, redirect to dashboard
    redirect("/dashboard");
  } else {
    // If not authenticated, redirect to login
    redirect("/auth/login");
  }

  // This will never be rendered as the user is redirected
  return null;
}
