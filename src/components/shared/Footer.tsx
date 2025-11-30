import Images from '@/constants/images';
import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pt-16">
      <div className="row-gap-6 mb-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* Logo and Description */}
        <div className="sm:col-span-2 lg:col-span-1">
          <a
            href="/"
            aria-label="Go home"
            title="Muslim99"
            className="inline-flex items-center">
            <Image
              src={Images.logo.src}
              alt="Muslim99 Logo"
              width={60}
              height={60}
              className="rounded-[6px]"
            />
            <span className="text-foreground ml-2 text-xl font-bold tracking-wide uppercase">
              Muslim99
            </span>
          </a>
          <div className="mt-6 lg:max-w-sm">
            <p className="text-muted-foreground text-sm">
              The Muslim99 team strives to deliver quality content for its community to benefit from
              religious enlightenment.
            </p>
          </div>
        </div>

        {/* Available On */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-start text-lg font-bold tracking-wide text-gray-900">Available On:</p>
          <div className="flex flex-col items-start space-y-3">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block">
              <div className="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs">GET IT ON</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </div>
            </a>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block">
              <div className="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Follow us on */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-foreground text-lg font-bold tracking-wide">Follow us on:</p>
          <div className="flex flex-col space-y-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-blue-600">
              <div className="rounded-full bg-blue-600 p-2 transition-colors group-hover:bg-blue-700">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-medium">Facebook</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-pink-600">
              <div className="rounded-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-2 transition-opacity group-hover:opacity-90">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-medium">Instagram</span>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-red-600">
              <div className="rounded-full bg-red-600 p-2 transition-colors group-hover:bg-red-700">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-medium">Youtube</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="flex flex-col-reverse justify-between border-t pt-5 pb-10 lg:flex-row">
        <p className="text-muted-foreground text-sm">© 2025 Muslim99. All rights reserved.</p>
        <ul className="mb-3 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-5 lg:mb-0">
          <li>
            <a
              href="/faq"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-emerald-600">
              F.A.Q
            </a>
          </li>
          <li>
            <a
              href="/privacy-policy"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-emerald-600">
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="/terms"
              className="text-sm text-gray-600 transition-colors duration-300 hover:text-emerald-600">
              Terms &amp; Conditions
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
