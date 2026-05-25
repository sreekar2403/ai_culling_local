import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ollama Photo Culler",
  description:
    "Local, privacy-first AI photo culling using Ollama vision models. Your photos never leave your machine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
