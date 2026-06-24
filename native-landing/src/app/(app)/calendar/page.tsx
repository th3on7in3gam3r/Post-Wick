import Link from "next/link";
import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { CalendarLoading } from "@/components/app/calendar-loading";
import { EmptyState } from "@/components/app/empty-state";
import { TextureButton } from "@/components/ui/texture-button";
import { getCalendarPostsByUserId } from "@/lib/db";
import { processDuePostsForUser } from "@/lib/publish/process-due";
import { requireUserId } from "@/lib/server/app-data";

const CalendarClient = dynamic(
  () =>
    import("@/components/app/calendar-client").then((mod) => mod.CalendarClient),
  {
    ssr: false,
    loading: () => <CalendarLoading />,
  },
);

export default async function CalendarPage() {
  const userId = await requireUserId();
  await processDuePostsForUser(userId);

  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 13);

  const posts = await getCalendarPostsByUserId(userId, start.toISOString(), end.toISOString());

  return (
    <>
      <AppHeader
        title="Calendar"
        description="See what's scheduled and drag approved posts to any day."
      />
      <div className="flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {posts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No scheduled posts"
            description="Approve posts in your queue, then drag them on the calendar to pick any day."
            action={
              <TextureButton asChild variant="primary" size="default">
                <Link href="/queue">Open approval queue</Link>
              </TextureButton>
            }
          />
        ) : (
          <CalendarClient
            posts={posts.map((post) => ({
              id: post.id,
              brandName: post.brandName,
              platform: post.platform,
              content: post.content,
              status: post.status,
              scheduledAt: post.scheduledAt,
              externalPostId: post.externalPostId,
            }))}
          />
        )}
      </div>
    </>
  );
}
