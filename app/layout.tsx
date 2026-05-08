import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jacklyons.us"),
  title: "Jack Lyons",
  description:
    "Creative director, worship leader, organizational manager.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.jacklyons.us",
    siteName: "Jack Lyons",
    title: "Jack Lyons builds bridges between people, process, & purpose.",
    description:
      "Creative Director, Worship Leader, and Organizational Manager with a background spanning operations, ministry, brand design, and international missions.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1024,
        height: 536,
        alt: "jacklyons.us site preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jack Lyons builds bridges between people, process, & purpose.",
    description:
      "Creative Director, Worship Leader, and Organizational Manager with a background spanning operations, ministry, brand design, and international missions.",
    images: ["/thumbnail.png"],
  },
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
