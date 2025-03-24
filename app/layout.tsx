import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import localFont from 'next/font/local';

const euclidCircular = localFont({
  variable: '--font-euclid-circular',
  src: [
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/euclid_circular/Euclid_Circular_A_Italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
});

const gtSuper = localFont({
  variable: '--font-gt-super',
  src: [
    {
      path: './fonts/gt_super/GT-Super-Display-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/gt_super/GT-Super-Display-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/gt_super/GT-Super-Display-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/gt_super/GT-Super-Display-Super.otf',
      weight: '900',
      style: 'normal',
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${euclidCircular.variable} font-sans ${gtSuper.variable} font-serif`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
