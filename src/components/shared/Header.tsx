import Images from '@/constants/images';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="p bg-linear-to-r from-[#DF98FA] to-[#9055FF] px-5 py-4">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2">
          <div className="flex flex-row items-center justify-center gap-2 rounded-lg p-1">
            <Image
              src={Images.tansparent_logo.src}
              alt="Logo"
              width={50}
              height={50}
            />
            <span className="font-poppins-medium text-lg font-bold text-white">Muslim99</span>
          </div>
        </Link>

        {/* Right Side - Links and Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/privacy-policy"
            className="font-poppins hidden text-base text-white transition hover:text-white/80 sm:block">
            Privacy Policy
          </Link>

          <Link
            href="/download-app"
            className="font-poppins-medium rounded-full border-2 border-white px-6 py-2 text-base font-semibold text-white transition hover:bg-white/10">
            Download the App
          </Link>
        </div>
      </div>
    </header>
  );
}
