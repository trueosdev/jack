import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jack Lyons",
  description:
    "Creative director, worship leader, organizational manager.",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
