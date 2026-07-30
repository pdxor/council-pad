import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CouncilPAD — Where wisdom becomes present",
  description: "A physical-digital thinking instrument. Not a chatbot. A council.",
  icons: {
    icon: '/council-logo.png',
    apple: '/council-logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A2F3D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-futurist-navy">
        {children}
      </body>
    </html>
  );
}

