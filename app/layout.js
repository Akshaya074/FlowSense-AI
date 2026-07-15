import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "FlowSense AI - Recover Your Coding Context Instantly",
  description: "AI-Powered Developer Context Recovery Platform. Automatically tracks your active files and browser reference searches to recover your coding flow on demand.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="h-full antialiased"
      >
        <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
