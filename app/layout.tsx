import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NavigationBar } from "@/component/navigation/NavigationBar";
import "./globals.css";
import { Provider } from "./provider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Shalinle",
    description: "Guess stops in schematic tram lines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
                <Provider>
                    <NavigationBar />
                    {children}
                </Provider>
            </body>
        </html>
    );
}
