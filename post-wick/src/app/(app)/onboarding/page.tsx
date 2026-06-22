import Link from "next/link";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <>
      <Header title="Welcome to Post-Wick" />
      <div className="mx-auto max-w-xl flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Let&apos;s get you set up</CardTitle>
            <CardDescription>
              Three steps to your first autopilot post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-brand-muted">
              <li>Add your brand and website URL</li>
              <li>Connect your social accounts</li>
              <li>Swipe approve your first batch of posts</li>
            </ol>
            <Link href="/brands/new">
              <Button>Add your first brand</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
