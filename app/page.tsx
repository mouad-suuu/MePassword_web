export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Secure Password Manager Backend
      </h1>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-lg mb-4">
          This is a secure backend instance for storing encrypted passwords and
          keys.
        </p>
        <p className="text-sm text-gray-600">
          All data is stored encrypted and can only be accessed with proper
          authentication, in the extention side after beeing decrypted localy
          using RSA asymmetric Keys.
        </p>
      </div>
    </main>
  );
}
