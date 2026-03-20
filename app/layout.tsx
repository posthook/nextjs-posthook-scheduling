import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Posthook Next.js Starter",
  description: "Schedule delayed tasks in Next.js with Posthook.",
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
