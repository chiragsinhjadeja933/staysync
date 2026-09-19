import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "StaySync | Real-Time Property & Amenity Management",
  description: "Centralized real-time property management platform for tenants, property managers, and administrators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
