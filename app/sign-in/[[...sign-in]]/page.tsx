import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SpacetimeGrid } from "@/components/landing/spacetime-grid";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0 gradient-hero" />
      <SpacetimeGrid />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 glow-orb blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <SignIn path="/sign-in" routing="path" forceRedirectUrl="/dashboard" />
      </div>
    </main>
  );
}
