import type { Metadata, Viewport } from 'next';
import { Fira_Code, Inter, JetBrains_Mono, Mona_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

// Fira Code sets the page; the other three are the fonts the feature clips draw with (lib/film).
const fira = Fira_Code({ subsets: ['latin'], variable: '--font-fira', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const mona = Mona_Sans({ subsets: ['latin'], variable: '--font-mona', display: 'swap' });

export const metadata: Metadata = {
  title: 'Wisdom — collaboration in the agentic era',
  description:
    'Wisdom records every agent session and ties each commit to the session that made it.',
};

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0d1117' };

// --z: the whole page's size on big screens. 1 up to about 1600x1000, then it grows with the smaller of
// width and height (up to 2). Set before first paint so nothing jumps.
const PAGE_SCALE = `(function(){var r=document.documentElement,f=function(){r.style.setProperty('--z',Math.max(1,Math.min(2,innerWidth/1600,innerHeight/1000)).toFixed(3))};f();addEventListener('resize',f)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fira.variable} ${inter.variable} ${jetbrains.variable} ${mona.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Script id="page-scale" strategy="beforeInteractive">
          {PAGE_SCALE}
        </Script>
      </body>
    </html>
  );
}
