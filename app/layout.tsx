import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CouncilPAD — Where wisdom becomes present",
  description: "A physical-digital thinking instrument. Not a chatbot. A council.",
  icons: {
    icon: '/council-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/council-logo.png" />
        <link rel="apple-touch-icon" href="/council-logo.png" />
        <meta name="theme-color" content="#D6B25E" />
      </head>
      <body className="antialiased min-h-screen bg-council-wood">
        {children}
      </body>
    </html>
  );
}

