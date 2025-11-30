export default function DownloadApp() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#DF98FA] to-[#9055FF]">
      <div className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="w-full max-w-[900px] text-center">
          {/* Heading */}
          <h1 className="font-poppins-medium mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Download Muslim99 App
          </h1>

          {/* Subtitle */}
          <p className="font-poppins mb-12 text-lg text-white/90 md:text-xl lg:text-2xl">
            Get access to Quran, Hadith, and Islamic content on your device
          </p>

          {/* Store Buttons */}
          <div className="flex w-full flex-col items-center justify-center gap-6 md:flex-row">
            {/* Google Play Store */}
            <a
              href="#"
              className="flex h-[89px] w-full items-center gap-4 rounded-2xl bg-white px-5 py-0 shadow-lg transition hover:shadow-xl md:w-[280px] md:p-8">
              {/* Play Store Icon */}
              <div className="">
                <svg
                  className="h-12 w-12 text-[#34A853] md:h-14 md:w-14"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
              </div>

              {/* Text */}
              <div className="text-left">
                <p className="font-poppins text-accent-foreground text-sm md:text-sm">Get it on</p>
                <p className="font-poppins-medium text-foreground text-[16px] font-bold md:text-[16px]">
                  Google Play Store
                </p>
              </div>
            </a>

            {/* App Store */}
            <a
              href="#"
              className="group flex h-[89px] w-full items-center gap-4 rounded-2xl bg-white px-5 py-0 shadow-lg transition hover:shadow-xl md:w-[280px] md:p-8">
              {/* Apple Icon */}
              <div className="">
                <svg
                  className="text-foreground h-12 w-12 md:h-14 md:w-14"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </div>

              {/* Text */}
              <div className="text-left">
                <p className="font-poppins text-accent-foreground text-sm md:text-sm">
                  Download on
                </p>
                <p className="font-poppins-medium text-foreground text-[16px] font-bold md:text-[16px]">
                  App Store
                </p>
              </div>
            </a>
          </div>

          {/* Back to Home Link */}
          <div className="mt-12">
            <a
              href="/"
              className="font-poppins inline-block text-base text-white/90 underline transition hover:text-white">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
