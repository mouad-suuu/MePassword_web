import { Card, CardContent } from "../../components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto min-h-screen py-8 px-4 flex items-center justify-center">
      <Card className="max-w-4xl w-full">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
          <div className="prose prose-sm max-w-none">
            <p className="mb-4">
              Last updated: December 21, 2023
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p>
                MePassword (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our password management service. As an open-source project, we believe in transparency and community-driven development.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Data Storage and Location</h2>
              <p className="mb-3">Our data storage is strictly segregated:</p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Windows Hello Storage:</h3>
              <ul className="list-disc pl-6 mb-3">
                <li>Private Key</li>
                <li>AES Key</li>
                <li>Initialization Vector (IV)</li>
                <li>User Credentials (encrypted)</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Browser Storage:</h3>
              <ul className="list-disc pl-6 mb-3">
                <li>Session settings (auto-lock time, session duration)</li>
                <li>Biometric verification preferences</li>
                <li>Session timestamps</li>
                <li>Lock-on-leave preferences</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Server Storage (Encrypted):</h3>
              <ul className="list-disc pl-6 mb-3">
                <li>Website URLs (encrypted)</li>
                <li>Usernames (encrypted)</li>
                <li>Passwords (encrypted)</li>
                <li>Non-sensitive metadata (last update time, owner email)</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Chrome Extension Permissions</h2>
              <p className="mb-3">Our extension requires minimal permissions:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>Storage: For session settings and encryption keys only</li>
                <li>Active Tab: Required for auto-fill functionality</li>
                <li>Identity: For secure user authentication</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Security Measures</h2>
              <p className="mb-3">Our security implementation includes:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>RSA-OAEP encryption (4096-bit) for asymmetric encryption</li>
                <li>AES-GCM (256-bit) for symmetric encryption</li>
                <li>Windows Hello biometric authentication integration</li>
                <li>Automatic session management with configurable timeouts</li>
                <li>Device-specific security tracking</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Device Information</h2>
              <p>
                We collect the following device information for security purposes:
              </p>
              <ul className="list-disc pl-6 mb-3">
                <li>Device ID</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Last active timestamp</li>
                <li>Session status</li>
              </ul>
              <p className="mt-3">
                This information is used solely for security monitoring and ensuring secure access to your account.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">6. Data Encryption</h2>
              <p>
                All sensitive data (website URLs, usernames, and passwords) are encrypted before transmission and storage. The encryption keys are securely stored using Windows Hello when biometric authentication is enabled, ensuring that only you can access your data.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">7. Your Rights and Control</h2>
              <p className="mb-3">You have complete control over:</p>
              <ul className="list-disc pl-6 mb-3">
                <li>Session duration settings (up to your configured limit)</li>
                <li>Auto-lock timing preferences</li>
                <li>Biometric authentication settings</li>
                <li>Lock-on-leave functionality</li>
                <li>Access to your encrypted data</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">8. Open Source Commitment</h2>
              <p className="mb-3">
                MePassword is an open-source project, meaning:
              </p>
              <ul className="list-disc pl-6 mb-3">
                <li>Our source code is publicly available for review</li>
                <li>Security researchers can verify our encryption implementations</li>
                <li>Community contributions are welcome</li>
                <li>All security measures are transparent and auditable</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p>
                We will notify users of any material changes to this privacy policy through the extension interface. Continued use of the extension after such modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="mb-3">
                For any questions or concerns about this Privacy Policy, you can:
              </p>
              <ul className="list-disc pl-6 mb-3">
                <li>Email us at mouad.mennioui3@gmail.com</li>
                <li>Create an issue on our GitHub repository</li>
                <li>Join our community discussions</li>
              </ul>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}