export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="h-[85vh] bg-linear-to-r from-[#DF98FA] to-[#9055FF] px-6 py-24">
        <div className="mx-auto max-w-[1100px] text-center">
          <h1 className="font-poppins-medium mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            Muslim99
          </h1>
          <p className="font-poppins mb-8 text-xl text-white/90 md:text-2xl">
            Your Complete Islamic Companion
          </p>
          <p className="font-poppins mx-auto mb-12 max-w-[700px] text-lg text-white/80 md:text-xl">
            Experience accurate prayer times, Quran recitation, Qibla direction, and Islamic
            knowledge all in one beautiful app. Stay connected with your faith, anytime, anywhere.
          </p>
          <a
            href="/download-app"
            className="font-poppins-medium inline-block rounded-full bg-[#F4C15D] px-12 py-5 text-xl font-semibold text-gray-900 shadow-lg transition hover:bg-[#F4C15D]/90 hover:shadow-xl">
            Download App
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-poppins-medium text-foreground mb-12 text-center text-4xl font-bold">
            Features
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">🕌</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Accurate Prayer Times
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Get precise prayer times based on your location with customizable notifications for
                each salah.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">📖</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Quran & Translations
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Read and listen to the Holy Quran with translations in multiple languages and
                beautiful recitations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">🧭</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Qibla Direction
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Find the accurate Qibla direction from anywhere in the world using your device's
                compass.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">🤲</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Duas & Supplications
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Access a comprehensive collection of daily duas and supplications for every
                occasion.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">📅</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Islamic Calendar
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Stay updated with Islamic dates, Ramadan timings, and important Islamic events
                throughout the year.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-3xl">🌙</span>
                </div>
              </div>
              <h3 className="font-poppins-medium text-foreground mb-3 text-xl font-bold">
                Daily Ayat
              </h3>
              <p className="font-poppins text-foreground/70 text-base">
                Receive a beautiful verse from the Quran every day to inspire and strengthen your
                faith.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
