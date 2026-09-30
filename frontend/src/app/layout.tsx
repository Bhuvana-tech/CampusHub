import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import { Footer } from '../components/Footer';
import FloatingMicButton from '../components/FloatingMicButton';

export const metadata: Metadata = {
  title: 'FreshBasket — Fresh Fruits & Vegetables Made Easy',
  description: 'An easy-to-use fruits and vegetables ordering website with a simple voice assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <FloatingMicButton />
          <VoiceAssistantModal />
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
