import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KIN - Your AI Assistant',
  description: 'KIN is your personal AI agent that gets things done.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
