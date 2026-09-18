import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SkillLab — Kho năng lực thực chiến", description: "Thư viện Skill giúp biến ý tưởng thành kết quả với AI.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body className="antialiased">{children}</body></html>; }
