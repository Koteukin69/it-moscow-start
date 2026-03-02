import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Metrika from "@/components/metrika";
import CookieConsent from "@/components/cookie-consent";

const montserrat = Montserrat({
  variable: "--montserrat",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  title: "IT.Москва Старт",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <Metrika />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
