import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthPrivacyFooter } from "@/components/auth-privacy-footer";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Create your Kerygma Social account and generate a month of social posts from your URL.";

export const metadata = createPageMetadata({
  title: "Sign up",
  description,
  ogTitle: "Sign up | Kerygma Social",
  ogDescription: description,
  path: "/sign-up",
});

export default function SignUpLayout({
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
