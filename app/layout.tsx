import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EncryptionLockIcon } from "@/components/ui/EncryptionLockIcon";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ALM-Asia | Audio Intelligence Platform",
  description: "Next-gen audio intelligence engine that listens, thinks, and understands the entire sonic world — from speech to emotion to environmental reality.",
  openGraph: {
    title: "ALM-Asia | Audio Intelligence Platform",
    description: "Next-gen audio intelligence engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
              <EncryptionLockIcon />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}

