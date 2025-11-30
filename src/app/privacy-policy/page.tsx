import { CONTACT } from '@/constants/constants';
import { generatePageMetadata } from '@/utils/metadata';

export const metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description:
    'Read our privacy policy to learn how Muslim99 protects your data and respects your privacy.',
  path: '/privacy-policy',
  keywords: [
    'Muslim99 privacy policy',
    'privacy',
    'data protection',
    'Islamic app privacy',
    'user data',
  ],
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-linear-to-r from-[#DF98FA] to-[#9055FF] px-6 py-12 text-white">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="font-poppins-medium mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="font-poppins text-base text-white/90">
            Your privacy matters to us. Learn how we protect your data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            Muslim99 is committed to protecting your privacy. This comprehensive Islamic app
            provides accurate prayer times, Quran recitation, and Islamic knowledge while respecting
            your data privacy. This Privacy Policy explains how we collect, use, and protect your
            information.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            1. Information we collect:
          </h2>

          <p className="text-foreground font-poppins mb-6 text-lg leading-relaxed">
            Muslim99 only collects very basic information from all our users and it does not include
            any private information. The information we gather is only for improving your experience
            and giving you better versions of our features. This information will not save on any
            server and neither given or sale to anyone.
          </p>

          <div className="mb-8">
            <h3 className="text-foreground font-poppins-medium mb-4 text-2xl font-bold">
              1.1 General information and permissions:
            </h3>
            <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
              No general information is collected from users. No specific information is collected
              by any user and the case is the same for all the users. The permissions we take are
              for the improvement of features of the app.
            </p>

            <p className="text-foreground font-poppins-medium mb-3 text-lg font-medium">
              They are:
            </p>

            <ul className="mb-6 list-disc space-y-3 pl-5">
              <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
                We collect location to tell you correct Qibla direction, prayer timings and the
                Islamic data.
              </li>

              <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
                We daily send only one notification for the ayat of the day and notifications for
                prayer time if permitted by the user in settings.
              </li>

              <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
                Media storage (photo gallery) permission is required for downloading translations of
                Quran and for sharing Prayer times, Duas, Ayats and Gallery images.
              </li>

              <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
                Device information is collected in order to have better insights into the crashes
                observed by users.
              </li>

              <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
                Push notification requires Device identifiers so we also collect that.
              </li>
            </ul>

            <p className="text-foreground font-poppins-medium mb-4 text-lg font-bold">
              Note: ABOVE INFORMATIONS NOT SAVED IN ANY SERVER.
            </p>

            <p className="text-foreground font-poppins mb-2 text-lg font-medium">
              Can the permissions be changed later?
            </p>
            <p className="text-foreground font-poppins text-lg leading-relaxed">
              Yes, every sort of permission can be changed by every user by going into your Device's
              settings.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-poppins-medium mb-4 text-2xl font-bold">
              1.2 App analytics:
            </h3>
            <p className="text-foreground font-poppins text-lg leading-relaxed">
              To know the statistics of a number of users with the parameters of region and device
              (model), we collect app analytics through Firebase(Google). We also use the same
              methodology to figure out the crashes occurrence.
            </p>
          </div>
        </section>

        {/* 2. How Your Information Is Used */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            2. How your information is used:
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            We save user's preferences about notifications and other things on the local
            (smartphone) and not on the server so no issues related to security of user's
            preferences are faced.
          </p>
        </section>

        {/* 3. Who Gets Your Information */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            3. Who gets your information:
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            We don't have any user information to share with any social media platform. We have a
            strict policy for that. Different statistics number of install, views and so on are used
            for marketing purpose which is available on Firebase or Google. We do not share them
            with any 3rd party vendor or user or anyone.
          </p>
        </section>

        {/* 4. Third Party websites and services */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            4. Third Party websites and services:
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            In case of any questions regarding Privacy policy or any other matter, we are easily
            reachable at{' '}
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="text-primary hover:text-primary/60 font-poppins underline">
              {CONTACT.supportEmail}
            </a>
          </p>
        </section>

        {/* 5. Privacy Policy Changes */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            5. Privacy policy changes:
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            In case of any new feature or content or permission, Muslim99 has the right to change
            the privacy policy and users are highly requested to overview it from time to time.
          </p>
        </section>

        {/* 6. Deleting Your Data */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            6. Deleting your data:
          </h2>
          <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
            If you wish to delete your data, please contact us on{' '}
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="text-primary hover:text-primary/60 underline">
              {CONTACT.supportEmail}
            </a>
            . We will delete your data within 15 days. Please note that if the data is deleted, you
            will not be able to access it anymore.
          </p>
        </section>

        {/* 7. Disclaimers */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            7. Disclaimers:
          </h2>
          <ul className="list-disc space-y-4 pl-5">
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              All Quranic translations are composed manually and hence are bound to contain human
              errors. If any error is found and reported it will be corrected ASAP.
            </li>

            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Namaz timings are specific to user's location. They might differ from your local
              Masjid depending upon your location that is collected via Google. It is preferred that
              you follow your local masjid in case of any confusion.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
