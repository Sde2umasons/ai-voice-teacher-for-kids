import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Little Wonder | AI Voice Teacher",
  description: "A friendly place to learn, speak, and grow.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
