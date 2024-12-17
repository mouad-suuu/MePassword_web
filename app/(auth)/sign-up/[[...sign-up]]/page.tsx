import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from '../../../../components/auth/AuthWrapper'

export default function Page() {
  return(
    <AuthWrapper>
      <div className='flex items-center justify-center flex-col gap-6'>
        <SignUp afterSignUpUrl="/dashboard" signInUrl="/sign-in" />
      </div>
    </AuthWrapper>
  );
}
