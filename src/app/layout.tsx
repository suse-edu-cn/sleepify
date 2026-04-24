import type { Metadata } from "next";
import "mdui/mdui.css";
import "./globals.css";
import AppShell from "@/components/AppShell";
import AppProviders from "@/components/AppProviders";
import MduiRuntime from "@/components/MduiRuntime";

export const metadata: Metadata = {
  title: "Sleepy",
  description: "Sleepy 睡眠管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="mdui-theme-auto">
      <body>
        <MduiRuntime />
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
