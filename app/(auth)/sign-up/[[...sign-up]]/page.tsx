import { SignUp } from "@clerk/nextjs";
import { AuthWrapper } from '../../../../components/auth/AuthWrapper'

export default function Page() {
  return(
    <AuthWrapper>
      <div className="relative min-h-screen w-full">
        <SignUp afterSignOutUrl="/" />
      </div>
    </AuthWrapper>
  );
}
