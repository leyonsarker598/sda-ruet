import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sirajganj District Association, RUET (SDA RUET)",
    template: "%s | SDA RUET",
  },
  description:
    "Official portal of Sirajganj District Association, Rajshahi University of Engineering & Technology (RUET). Connecting students, alumni, and faculty from Sirajganj. Motto: Take a Stand & Hold a Hand.",
  keywords: [
    "SDA RUET",
    "Sirajganj District Association",
    "RUET",
    "Rajshahi University of Engineering and Technology",
    "Sirajganj",
    "RUET Alumni",
    "RUET Library",
  ],
  authors: [{ name: "Sirajganj District Association, RUET" }],
  creator: "SDA RUET",
  publisher: "Sirajganj District Association, RUET",
  icons: {
    icon: [
      { url: "/assets/Sda-PNG.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/assets/Sda-PNG.png",
    apple: [
      { url: "/assets/Sda-PNG.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Sirajganj District Association, RUET",
    description: "Connecting Sirajganj, Empowering RUET. Take a Stand & Hold a Hand.",
    url: "https://sdaruet.org",
    siteName: "SDA RUET",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[#FBF9F5] text-[#0F172A] font-sans flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
