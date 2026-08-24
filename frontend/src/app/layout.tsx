import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaPay - Financial Transactions & Rewards Dashboard",
  description:
    "Production-ready consumer credit card transactions dashboard, real-time spend analytics, and coin rewards redemption engine built for Digital Alpha Technology.",
  keywords: [
    "credit card",
    "transactions",
    "rewards",
    "spend analytics",
    "fintech",
    "Digital Alpha Technology",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
