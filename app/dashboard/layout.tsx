import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { JobMonitorProvider } from "@/components/dashboard/job-monitor";

export const metadata: Metadata = {
  title: "Panel",
  description:
    "Gestiona tus ejecuciones, datasets y configuraciones de scraping.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <JobMonitorProvider>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </JobMonitorProvider>
  );
}
