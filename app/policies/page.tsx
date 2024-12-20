import { Card, CardContent } from "../../components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto min-h-screen py-8 px-4 flex items-center justify-center">
      <Card className="max-w-4xl w-full">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
          <div className="prose prose-sm max-w-none">
            <p className="mb-4">
              Last updated: December 20, 2023
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>
                MePassword (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our password management service.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>Account information (email address, encrypted master password)</li>
                <li>Encrypted passwords and related website data</li>
                <li>Device information for security purposes</li>
                <li>Usage data to improve our services</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">Your information is used to:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>Provide and maintain our password management service</li>
                <li>Ensure the security of your stored passwords</li>
                <li>Improve and optimize our service</li>
                <li>Communicate important updates and changes</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Security Measures</h2>
              <p>
                We implement strong security measures including end-to-end encryption, secure key generation, and biometric authentication options to protect your data. All passwords are encrypted locally on your device before being stored.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
              <p>
                We do not sell or share your personal information with third parties. Your encrypted data is only shared between your authorized devices and with users you explicitly choose to share with.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>Access your stored information</li>
                <li>Request data deletion</li>
                <li>Export your data</li>
                <li>Modify your account settings</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at mouad.mennioui3@gamil.com
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}