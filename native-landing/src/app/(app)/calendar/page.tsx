import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { CalendarClient } from "@/components/app/calendar-client";
import { EmptyState } from "@/components/app/empty-state";
import { TextureButton } from "@/components/ui/texture-button";
import { getCalendarPostsByUserId } from "@/lib/db";
import { processDuePostsForUser } from "@/lib/publish/process-due";
import { requireUserId } from "@/lib/server/app-data";

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
        description="See what autopilot will publish and when."
      />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        {posts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No scheduled posts"
            description="Approve posts in your queue and they will land here on Mon, Wed, and Fri at 10:00 AM."
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
            }))}
          />
        )}
      </div>
    </>
  );
}
