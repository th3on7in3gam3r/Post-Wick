import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthScrollLock } from "@/components/auth-scroll-lock";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthScrollLock />
      <AuthPageShell
        layout="centered"
        contentMaxWidth="max-w-[340px]"
        backgroundImage="/images/sign-in-forest-hammock.png"
        imagePosition="bg-[50%_42%]"
        imageLabel="A person relaxing in a forest hammock beside a stream, with mountains in the distance"
      >
        {children}
      </AuthPageShell>
    </>
  );
}
