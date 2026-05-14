import NextAuthProvider from '../components/SessionProvider';
import WhatsAppButton from '../components/WhatsAppButton';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}