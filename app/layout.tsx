import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Wisdom — agents who know progress',
  description:
    'A shared layer for agent teams. Follow captured work, discover context, and keep progress within clear boundaries.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
