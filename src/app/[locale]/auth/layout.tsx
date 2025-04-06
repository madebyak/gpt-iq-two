import { AuthNavbar } from "@/components/layout/auth-navbar";
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: { 
    locale: string;
  };
}

export default async function AuthLayout({
  children,
  params
}: AuthLayoutProps) {
  // Get translations for components used in the auth pages
  const authNavbarT = await getTranslations('AuthNavbar');
  const authLoginT = await getTranslations('Auth.Login');
  const authSignupT = await getTranslations('Auth.Signup');
  const authForgotPasswordT = await getTranslations('Auth.ForgotPassword');
  const authVerifyEmailT = await getTranslations('Auth.VerifyEmail');
  const authCommonT = await getTranslations('Auth.Common');
  
  // Prepare client messages object with all necessary translations
  const messages = {
    AuthNavbar: {
      backToHome: authNavbarT('backToHome'),
      help: authNavbarT('help'),
      privacy: authNavbarT('privacy'),
      disclaimer: authNavbarT('disclaimer')
    },
    Auth: {
      Login: {
        title: authLoginT('title'),
        subtitle: authLoginT('subtitle'),
        loginButton: authLoginT('loginButton'),
        forgotPassword: authLoginT('forgotPassword'),
        rememberMe: authLoginT('rememberMe'),
        googleLogin: authLoginT('googleLogin'),
        noAccount: authLoginT('noAccount'),
        signUpLink: authLoginT('signUpLink')
      },
      Signup: {
        title: authSignupT('title'),
        subtitle: authSignupT('subtitle'),
        signupButton: authSignupT('signupButton'),
        googleSignup: authSignupT('googleSignup'),
        firstNameLabel: authSignupT('firstNameLabel'),
        firstNamePlaceholder: authSignupT('firstNamePlaceholder'),
        lastNameLabel: authSignupT('lastNameLabel'),
        lastNamePlaceholder: authSignupT('lastNamePlaceholder'),
        confirmPasswordLabel: authSignupT('confirmPasswordLabel'),
        confirmPasswordPlaceholder: authSignupT('confirmPasswordPlaceholder'),
        termsText: authSignupT('termsText'),
        termsLink: authSignupT('termsLink'),
        hasAccount: authSignupT('hasAccount'),
        loginLink: authSignupT('loginLink')
      },
      ForgotPassword: {
        title: authForgotPasswordT('title'),
        subtitle: authForgotPasswordT('subtitle'),
        resetButton: authForgotPasswordT('resetButton'),
        rememberedPassword: authForgotPasswordT('rememberedPassword'),
        backToLoginLink: authForgotPasswordT('backToLoginLink')
      },
      VerifyEmail: {
        title: authVerifyEmailT('title'),
        subtitle: authVerifyEmailT('subtitle'),
        description: authVerifyEmailT('description'),
        resendButton: authVerifyEmailT('resendButton'),
        backToLoginLink: authVerifyEmailT('backToLoginLink')
      },
      Common: {
        emailLabel: authCommonT('emailLabel'),
        emailPlaceholder: authCommonT('emailPlaceholder'),
        passwordLabel: authCommonT('passwordLabel'),
        passwordPlaceholder: authCommonT('passwordPlaceholder'),
        orContinueWith: authCommonT('orContinueWith'),
        fieldsRequired: "All fields are required",
        invalidCredentials: "Invalid email or password",
        errorOccurred: "An error occurred. Please try again.",
        loading: "Loading..."
      }
    }
  };

  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/90 to-primary/5">
        <AuthNavbar />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
