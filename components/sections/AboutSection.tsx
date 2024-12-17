'use client';

export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Understanding the secure setup and encryption process
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 
                          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-100 dark:hover:border-blue-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1️⃣ Initial Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                After signing in, you&apos;ll need to generate your encryption keys. These keys are the foundation 
                of your password security. You&apos;ll create a master password that encrypts these keys - 
                <span className="text-amber-600 dark:text-amber-400 font-medium"> make sure to remember this password and save your keys in a secure location</span>.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 
                          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-100 dark:hover:border-blue-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2️⃣ Key Storage
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your encryption keys are stored in an encrypted file, protected by your master password. 
                This two-layer approach means that even if someone gets access to your encrypted file, 
                they can&apos;t access your passwords without your master password.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 
                          transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-100 dark:hover:border-blue-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3️⃣ Password Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                When you save a password, it&apos;s encrypted using your keys before being stored locally. 
                When you need to access a password, the extension first decrypts your keys using your 
                master password, then uses those keys to decrypt your stored passwords.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 
                        transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-100 dark:hover:border-blue-900">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Why This Approach?
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  🔐 True Zero-Knowledge
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your master password never leaves your device. Even we can&apos;t access your passwords 
                  or encryption keys.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  💾 Local-First Security
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  All encryption and decryption happens locally on your device. Your sensitive data 
                  never travels over the network unencrypted.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  🔄 Key Recovery
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  By saving your encrypted keys file, you can recover access to your passwords even if 
                  you need to reinstall the extension - as long as you remember your master password.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  Important: Your master password is crucial for accessing your passwords. If you lose it, 
                  there&apos;s no way to recover your stored passwords.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
