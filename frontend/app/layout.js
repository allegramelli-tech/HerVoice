import "./globals.css";
import HelpButton from "../components/HelpButton";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-950 antialiased">
        <HelpButton />
        {children}
      </body>
    </html>
  );
}
