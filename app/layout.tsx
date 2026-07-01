import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavigationBar } from "@/component/navigation/NavigationBar";
import "./globals.css";
import { Provider } from "./provider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Shalinle",
    description: "Guess stops in schematic tram lines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} antialiased`}>
                <Provider>
                    <NavigationBar />
                    {children}
                </Provider>
            </body>
        </html>
    );
}
