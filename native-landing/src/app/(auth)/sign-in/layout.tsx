import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthPrivacyFooter } from "@/components/auth-privacy-footer";
import { createPageMetadata } from "@/lib/metadata";

const description = "Sign in to Kerygma Social and manage your social content on autopilot.";

export const metadata = createPageMetadata({
  title: "Sign in",
  description,
  ogTitle: "Sign in | Kerygma Social",
  ogDescription: description,
  path: "/sign-in",
});

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthPageShell
        layout="centered"
        contentMaxWidth="max-w-[340px]"
        backgroundImage="/images/sign-in-forest-hammock.png"
        imagePosition="bg-[50%_42%]"
        imageLabel="A person relaxing in a forest hammock beside a stream, with mountains in the distance"
        footer={<AuthPrivacyFooter />}
      >
        {children}
    </AuthPageShell>
  );
}
