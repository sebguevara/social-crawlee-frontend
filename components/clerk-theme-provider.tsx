"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";

// Deep merge custom localization with esES
const localization = {
  ...esES,
  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      title: "Iniciar sesión",
      titleCombined: "Iniciar sesión en {{applicationName}}",
      subtitle: "Accedé a tu panel para gestionar scraping y datasets",
      subtitleCombined: "Accedé a tu panel para gestionar scraping y datasets",
    },
  },
};

export function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mounting, we don't know the theme — render without theme to avoid flash
  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <ClerkProvider
      localization={localization}
      signInUrl="/sign-in"
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#547792",
          colorDanger: "#dc2626",
          ...(isDark
            ? {
                colorBackground: "#0c0c0e",
                colorInputBackground: "#18181b",
                colorInputText: "#e4e4e7",
                colorText: "#e4e4e7",
                colorTextSecondary: "#a1a1aa",
              }
            : {}),
          borderRadius: "0.5rem",
        },
        elements: {
          rootBox: "w-full",
          cardBox: "w-full",
          card: isDark
            ? "!bg-[#0c0c0e] border border-white/[0.08] !shadow-2xl !shadow-black/40"
            : "bg-white border border-gray-200 shadow-sm",
          headerTitle: isDark ? "!text-[#e4e4e7]" : "",
          headerSubtitle: isDark ? "!text-[#a1a1aa]" : "",
          formFieldInput: isDark
            ? "!bg-[#18181b] !border-white/[0.08] !text-[#e4e4e7] placeholder:!text-[#52525b]"
            : "",
          formFieldLabel: isDark ? "!text-[#a1a1aa]" : "",
          footerActionLink: "text-[#547792] hover:text-[#6b8faa]",
          socialButtonsBlockButton: isDark
            ? "!bg-[#18181b] !border-white/[0.08] !text-[#e4e4e7] hover:!bg-[#27272a]"
            : "",
          socialButtonsBlockButtonText: isDark ? "!text-[#e4e4e7]" : "",
          dividerLine: isDark ? "!bg-white/[0.08]" : "",
          dividerText: isDark ? "!text-[#52525b]" : "",
          identityPreviewEditButton: "text-[#547792]",
          identityPreviewText: isDark ? "!text-[#e4e4e7]" : "",
          formButtonPrimary:
            "!bg-[#547792] hover:!bg-[#476880] !text-white !shadow-none",
          footerAction: "hidden",
          // UserButton popover (dashboard sidebar)
          userButtonPopoverCard: isDark
            ? "!bg-[#0c0c0e] !border !border-white/[0.08] !shadow-2xl"
            : "",
          userButtonPopoverActionButton: isDark
            ? "!text-[#e4e4e7] hover:!bg-white/[0.04]"
            : "",
          userButtonPopoverActionButtonText: isDark ? "!text-[#e4e4e7]" : "",
          userButtonPopoverActionButtonIcon: isDark ? "!text-[#a1a1aa]" : "",
          userButtonPopoverFooter: isDark ? "!border-white/[0.08]" : "",
          userPreviewMainIdentifier: isDark ? "!text-[#e4e4e7]" : "",
          userPreviewSecondaryIdentifier: isDark ? "!text-[#a1a1aa]" : "",
          // UserProfile & manage account modals
          navbar: isDark ? "!bg-[#0c0c0e] !border-white/[0.08]" : "",
          navbarButton: isDark
            ? "!text-[#a1a1aa] hover:!text-[#e4e4e7] hover:!bg-white/[0.04]"
            : "",
          pageScrollBox: isDark ? "!bg-[#0c0c0e]" : "",
          profileSection: isDark ? "!border-white/[0.08]" : "",
          profileSectionTitleText: isDark ? "!text-[#a1a1aa]" : "",
          profileSectionPrimaryButton: isDark
            ? "!text-[#547792] hover:!bg-white/[0.04]"
            : "",
          badge: isDark
            ? "!bg-[#547792]/20 !text-[#7fb0cc] !border-[#547792]/30"
            : "",
          modalBackdrop: "!bg-black/60 backdrop-blur-sm",
          modalContent: isDark
            ? "!bg-[#0c0c0e] !border !border-white/[0.08] !shadow-2xl"
            : "",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
