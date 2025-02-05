import Image from 'next/image';
import Link from 'next/link';

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl py-6 flex items-center justify-between z-50 bg-transparent">
        <div className="flex items-center gap-x-20">
          <Link href="/">
            <Image
              src="/images/conjugate.svg"
              width={120}
              height={120}
              alt="confugate logo"
            />
          </Link>
        </div>
        <div className="flex items-center gap-x-1">
          <Link href="/sign-in">
            <button className=" text-white px-7 text-sm rounded-md py-2.5 font-sans">
              Log in
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="bg-midnight text-white px-8 py-2 font-sans text-sm">
              Try for free
            </button>
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
