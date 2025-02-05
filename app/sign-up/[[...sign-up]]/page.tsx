import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => {
  return <SignUp forceRedirectUrl="/new-user" />;
};

export default SignUpPage;
