
import "./globals.css";

export const metadata = {
  title: "Nexa Trade Pro",
  description: "AI-powered Deriv trading and market analysis platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
