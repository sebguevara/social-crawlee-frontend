import { DashboardHeader } from "@/components/dashboard/header";
import { ScrapeForm } from "@/components/dashboard/scrape-form";

export default function ScrapePage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Nuevo scraping"
        description="Configura y lanza una nueva ejecución de scraping."
      />
      <div className="mx-auto w-full max-w-3xl p-6">
        <ScrapeForm />
      </div>
    </div>
  );
}
