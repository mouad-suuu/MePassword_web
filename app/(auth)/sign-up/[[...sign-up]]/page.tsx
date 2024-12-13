import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from '../../../../components/auth/AuthWrapper'
import Link from 'next/link'

export default function Page() {
  return(
    <AuthWrapper>
      <div className='flex items-center justify-center flex-col gap-6'>
        <SignUp afterSignUpUrl="/" signInUrl="/sign-in" />
        
      </div>
    </AuthWrapper>
  );
}
