import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VA Command Center",
  description: "Run your VA business in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
