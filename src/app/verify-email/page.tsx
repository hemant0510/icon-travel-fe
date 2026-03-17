import Link from "next/link";
import { CheckCircle, XCircle, Mail } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string; email?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { success, error, email } = params;

  if (success === "true") {
    return <VerifyResult
      icon={<CheckCircle size={48} className="text-green-500" />}
      title="Email verified!"
      message="Your email address has been verified. You can now sign in to your account."
      cta={{ label: "Sign In", href: "/" }}
    />;
  }

  const errorMessages: Record<string, string> = {
    missing_token:       "The verification link is missing a token. Please use the link from your email.",
    invalid_or_expired:  "This verification link has expired or has already been used. Please request a new one.",
    server_error:        "Something went wrong on our end. Please try again.",
  };

  if (error) {
    return <VerifyResult
      icon={<XCircle size={48} className="text-red-500" />}
      title="Verification failed"
      message={errorMessages[error] ?? "An unknown error occurred."}
      cta={{ label: "Go Home", href: "/" }}
      email={email}
      showResend
    />;
  }

  // Default: landed without params — show generic "check your email" screen
  return <VerifyResult
    icon={<Mail size={48} className="text-primary-500" />}
    title="Check your inbox"
    message="We've sent a verification link to your email address. Click the link to activate your account."
    cta={{ label: "Back to Home", href: "/" }}
    email={email}
    showResend
  />;
}

interface VerifyResultProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  cta: { label: string; href: string };
  email?: string;
  showResend?: boolean;
}

async function VerifyResult({ icon, title, message, cta, email, showResend }: VerifyResultProps) {
  // Dynamic import of client component to keep page server-side
  const { default: ResendVerification } = await import("@/components/auth/ResendVerification");

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#eff6ff 0%,#fff7ed 100%)" }}>
      <div className="glass-card w-full max-w-md p-8 text-center animate-fade-in">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary">{title}</h1>
        <p className="mb-6 text-sm leading-relaxed text-text-secondary">{message}</p>

        {showResend && email && (
          <div className="mb-6 flex justify-center">
            <ResendVerification email={email} />
          </div>
        )}

        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity"
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
