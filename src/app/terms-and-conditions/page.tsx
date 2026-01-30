import { SITE_CONFIG } from '@/constants/site';
import { generatePageMetadata } from '@/utils/metadata';

export const metadata = generatePageMetadata({
  title: 'Terms and Conditions',
  description:
    'Read the terms and conditions for using Muslim99 app. Learn about user agreements, app usage guidelines, and service terms.',
  path: '/terms-and-conditions',
  keywords: [
    'Muslim99 terms',
    'terms and conditions',
    'user agreement',
    'Islamic app terms',
    'service terms',
    'app usage policy',
  ],
});

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-linear-to-r from-[#DF98FA] to-[#9055FF] px-6 py-12 text-white">
        <div className="mx-auto max-w-[1100px]">
          <h1 className="font-poppins-medium mb-4 text-4xl font-bold">Terms and Conditions</h1>
          <p className="font-poppins text-base text-white/90">
            Please read these terms carefully before using Muslim99.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            Welcome to Muslim99, your complete Islamic companion app. By downloading, installing, or
            using the Muslim99 application, you agree to be bound by these Terms and Conditions.
            Please read them carefully. If you do not agree with these terms, please do not use our
            app.
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            1. Acceptance of Terms
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            By accessing and using Muslim99, you accept and agree to be bound by the terms and
            provision of this agreement. These Terms and Conditions constitute a legally binding
            agreement between you and Muslim99. Your continued use of the app constitutes your
            acceptance of any updates or modifications to these terms.
          </p>
        </section>

        {/* 2. App Description */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            2. App Description
          </h2>
          <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
            Muslim99 is a comprehensive Islamic application that provides:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-5">
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Accurate prayer times based on your location
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Qibla direction finder
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Quran recitation and translations
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Islamic calendar and important dates
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Daily Islamic knowledge and reminders
            </li>
          </ul>
        </section>

        {/* 3. User Responsibilities */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            3. User Responsibilities
          </h2>
          <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
            As a user of Muslim99, you agree to:
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Use the app for lawful purposes only
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Not attempt to modify, reverse engineer, or create derivative works from the app
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Not use the app in any way that could damage, disable, or impair the service
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Respect the intellectual property rights of Muslim99 and third parties
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Verify prayer times with your local mosque for accuracy
            </li>
          </ul>
        </section>

        {/* 4. Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            4. Intellectual Property
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            All content, features, and functionality of the Muslim99 app, including but not limited
            to text, graphics, logos, icons, images, audio clips, and software, are the exclusive
            property of Muslim99 or its content suppliers and are protected by international
            copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        {/* 5. Prayer Times and Qibla Direction */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            5. Prayer Times and Qibla Direction
          </h2>
          <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
            While we strive to provide accurate prayer times and Qibla direction:
          </p>
          <ul className="list-disc space-y-3 pl-5">
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Prayer times are calculated based on your device's location and standard calculation
              methods
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Times may vary from your local mosque's schedule
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              We recommend verifying with your local mosque for the most accurate times
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Qibla direction depends on device sensors and location accuracy
            </li>
          </ul>
        </section>

        {/* 6. Quran and Islamic Content */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            6. Quran and Islamic Content
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            The Quran translations and Islamic content provided in the app are for educational and
            spiritual purposes. While we make every effort to ensure accuracy, translations are
            human interpretations and may contain errors. For religious guidance, please consult
            qualified Islamic scholars and authentic sources.
          </p>
        </section>

        {/* 7. Permissions and Data Usage */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            7. Permissions and Data Usage
          </h2>
          <p className="text-foreground font-poppins mb-4 text-lg leading-relaxed">
            Muslim99 requires certain permissions to function properly:
          </p>
          <ul className="mb-6 list-disc space-y-3 pl-5">
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Location access for accurate prayer times and Qibla direction
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Notification permissions for prayer reminders
            </li>
            <li className="text-foreground marker:text-foreground font-poppins text-lg leading-relaxed marker:text-[14px]">
              Storage access for saving Quran downloads and sharing content
            </li>
          </ul>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            For detailed information about how we collect and use your data, please refer to our{' '}
            <a
              href="/privacy-policy"
              className="text-primary hover:text-primary/60 font-poppins underline">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            8. Limitation of Liability
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            Muslim99 is provided "as is" without any warranties, expressed or implied. We do not
            guarantee that the app will be error-free, secure, or uninterrupted. In no event shall
            Muslim99 be liable for any indirect, incidental, special, consequential, or punitive
            damages arising out of or related to your use of the app.
          </p>
        </section>

        {/* 9. Updates and Modifications */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            9. Updates and Modifications
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            Muslim99 reserves the right to modify, update, or discontinue the app or any of its
            features at any time without prior notice. We may also update these Terms and Conditions
            periodically. Continued use of the app after changes constitutes acceptance of the
            updated terms.
          </p>
        </section>

        {/* 10. Third-Party Services */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            10. Third-Party Services
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            The app may contain links to third-party websites or services. Muslim99 is not
            responsible for the content, privacy policies, or practices of any third-party sites or
            services. Your use of such services is at your own risk.
          </p>
        </section>

        {/* 11. Termination */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            11. Termination
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            We reserve the right to terminate or suspend your access to the app at any time, with or
            without notice, for any reason, including violation of these Terms and Conditions.
          </p>
        </section>

        {/* 12. Governing Law */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            12. Governing Law
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            These Terms and Conditions shall be governed by and construed in accordance with the
            applicable laws, without regard to its conflict of law provisions.
          </p>
        </section>

        {/* 13. Contact Information */}
        <section className="mb-12">
          <h2 className="text-foreground font-poppins-medium mb-6 text-3xl font-bold">
            13. Contact Information
          </h2>
          <p className="text-foreground font-poppins text-lg leading-relaxed">
            If you have any questions about these Terms and Conditions, please contact us at{' '}
            <a
              href={`mailto:${SITE_CONFIG.contact.supportEmail}`}
              className="text-primary hover:text-primary/60 font-poppins underline">
              {SITE_CONFIG.contact.supportEmail}
            </a>
          </p>
        </section>

        {/* Last Updated */}
        <section className="mb-12">
          <p className="text-foreground font-poppins text-base italic">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
