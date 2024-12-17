import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/MePassword.png"
        alt="MePassword Logo"
        width={32}
        height={32}
        className="rounded-sm"
      />
      <span className="font-bold text-xl">MePassword</span>
    </Link>
  );
}
