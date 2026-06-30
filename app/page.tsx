import { redirect } from "next/navigation";

// Root "/" redirects to dashboard.
// Middleware handles unauthenticated redirect to /login.
export default function RootPage() {
  redirect("/dashboard");
}
