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

const SITE_URL = "https://itmoscow.pro";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Колледж ИТ.МОСКВА — поступление на IT-специальности",
    template: "%s | Колледж ИТ.МОСКВА",
  },
  description:
    "Государственный колледж информационных технологий Москвы (бывший МГКЭИТ). Обучение по специальностям: программирование, информационные системы, кибербезопасность. Поступление без ЕГЭ после 9 и 11 класса.",
  keywords: [
    "IT колледж Москва",
    "ИТ.МОСКВА колледж",
    "МГКЭИТ",
    "колледж информационных технологий",
    "поступление в колледж без ЕГЭ",
    "программирование колледж",
    "кибербезопасность колледж",
    "среднее профессиональное образование IT",
    "колледж после 9 класса Москва",
    "колледж после 11 класса Москва",
    "ГБПОУ ИТ Москва",
  ],
  authors: [{ name: "Колледж информационных технологий ИТ.МОСКВА" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Колледж ИТ.МОСКВА",
    title: "Колледж ИТ.МОСКВА — поступление на IT-специальности",
    description:
      "Государственный колледж информационных технологий Москвы. Программирование, кибербезопасность, информационные системы. Поступление без ЕГЭ после 9 и 11 класса.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Колледж информационных технологий ИТ.МОСКВА",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
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
