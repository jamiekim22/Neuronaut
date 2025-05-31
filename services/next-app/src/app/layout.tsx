import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StarField from "@/components/StarField";

const orbitron = Orbitron({
  weight: ["400", "500", "700"],     // whichever weights you need
  subsets: ["latin"],
  variable: "--font-orbitron",        // the custom property name
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Neuronaut: Interactive 3D Brain Explorer",
  description: "made by Jamie Kim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {/* Render the star‐twinkle background behind website.
          StarField is fixed and has z-index: -1, so it will sit under page. */}
        <StarField numStars={150} />

        {children}
      </body>
    </html>
  );
}
