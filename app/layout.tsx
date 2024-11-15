import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactQueryProvider from "./utils/provider/reactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
  };

  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <ReactQueryProvider>
        <body className={inter.className} suppressHydrationWarning={true}>
          {children}
        </body>
      </ReactQueryProvider>
    </html>
  );
}
