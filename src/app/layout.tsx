import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Legal Compass — Evidence-Grounded Legal Navigation System',
  description: 'Upload a legal document. Understand your position, identify what matters, see the evidence, and know what to ask next.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const saved = localStorage.getItem('legal-compass-theme'); const theme = saved === 'day' || saved === 'night' ? saved : (matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night'); document.documentElement.dataset.theme = theme; } catch (_) { document.documentElement.dataset.theme = 'night'; } })();`,
          }}
        />
      </head>
      <body className="bg-legal-950 text-legal-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
