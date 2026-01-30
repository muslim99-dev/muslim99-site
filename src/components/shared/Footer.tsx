import { SOCIAL_MEDIA, STORE_URLS } from '@/constants/constants';
import Images from '@/constants/images';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="border-border mx-2 border-t pt-16">
      <div className="row-gap-6 mx-auto mb-8 grid max-w-[1200px] gap-10 px-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <a
            href="#"
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
            <span className="text-foreground font-poppins-medium ml-2 text-xl font-bold tracking-wide">
              Muslim99
            </span>
          </a>
          <div className="mt-6 lg:max-w-sm">
            <p className="text-muted-foreground font-poppins text-sm">
              The Muslim99 team strives to deliver quality content for its community to benefit from
              religious enlightenment.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex max-w-fit flex-col justify-between gap-4">
            <p className="text-foreground font-poppins-medium text-start text-lg font-bold tracking-wide">
              Available On:
            </p>
            <div className="flex flex-col items-start space-y-3">
              {/* App Store - Coming Soon */}
              <div className="relative inline-block opacity-60">
                <Image
                  src={Images.appstore_logo.src}
                  alt="Appstore logo - Coming Soon"
                  width={120}
                  height={120}
                  className="grayscale"
                />
              </div>

              {/* Play Store */}
              <a
                href={STORE_URLS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition hover:opacity-80">
                <Image
                  src={Images.playstore_logo.src}
                  alt="Playstore logo"
                  width={120}
                  height={120}
                />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-foreground font-poppins-medium text-lg font-bold tracking-wide">
            Follow us on:
          </p>
          <div className="flex flex-col space-y-3">
            <a
              href={SOCIAL_MEDIA.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-blue-600">
              <div className="rounded-full bg-blue-600 p-2 transition-colors group-hover:bg-blue-700">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <span className="font-poppins-medium text-base font-medium">Facebook</span>
            </a>
            <a
              href={SOCIAL_MEDIA.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-pink-600">
              <div className="rounded-full bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-2 transition-opacity group-hover:opacity-90">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <span className="font-poppins-medium text-base font-medium">Instagram</span>
            </a>
            <a
              href={SOCIAL_MEDIA.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-3 text-gray-700 transition-colors hover:text-red-600">
              <div className="rounded-full bg-red-600 p-2 transition-colors group-hover:bg-red-700">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="font-poppins-medium text-base font-medium">Youtube</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col-reverse justify-between border-t px-5 pt-5 pb-10 lg:flex-row">
        <p className="text-muted-foreground font-poppins text-sm">
          © {currentYear} Muslim99. All rights reserved.
        </p>
        <ul className="mb-3 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-5 lg:mb-0">
          <li>
            <a
              href="#"
              className="text-muted-foreground font-poppins-medium hover:text-primary/90 text-sm font-medium transition-colors duration-300">
              F.A.Q
            </a>
          </li>
          <li>
            <Link
              href="/privacy-policy"
              className="text-muted-foreground font-poppins-medium hover:text-primary/90 text-sm font-medium transition-colors duration-300">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link
              href="/terms-and-conditions"
              className="text-muted-foreground font-poppins-medium hover:text-primary/90 text-sm font-medium transition-colors duration-300">
              Terms &amp; Conditions
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
