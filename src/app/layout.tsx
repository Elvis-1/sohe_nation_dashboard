import type { Metadata } from "next";
import "./globals.css";
import { DashboardProviders } from "@/src/core/ui/dashboard-providers";
import { StyledJsxRegistry } from "./styled-jsx-registry";

export const metadata: Metadata = {
  title: "Sohe's Nation Dashboard",
  description: "Back-office dashboard for Sohe's Nation operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StyledJsxRegistry>
          <DashboardProviders>{children}</DashboardProviders>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
