import "./globals.css";

export const metadata = {
  title: "Geonest Ventures",
  description: "Geonest Ventures — Mart, Salon, Prints, Travel & Tour",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">{children}</body>
    </html>
  );
}
