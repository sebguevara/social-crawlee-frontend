import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sileo";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkThemeProvider } from "@/components/clerk-theme-provider";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const defaultTheme = (process.env.NEXT_PUBLIC_DEFAULT_THEME ?? "system") as
  | "light"
  | "dark"
  | "system";

export const metadata: Metadata = {
  title: {
    default: "Social Crawlee",
    template: "%s | Social Crawlee",
  },
  description:
    "Extrae datos estructurados de Instagram, Facebook, X y TikTok a escala. Una API, cuatro plataformas.",
  generator: "Social Crawlee",
  keywords: [
    "scraping",
    "redes sociales",
    "instagram",
    "facebook",
    "tiktok",
    "x",
    "twitter",
    "api",
    "data extraction",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem
          disableTransitionOnChange
        >
          <ClerkThemeProvider>
            {children}
            <Toaster position="bottom-right" />
          </ClerkThemeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
