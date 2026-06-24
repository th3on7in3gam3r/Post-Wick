import dynamic from "next/dynamic";
import { AppHeaderWithClient } from "@/components/app/client-scoped";
import { CalendarLoading } from "@/components/app/calendar-loading";
import { getCalendarPostsByUserId } from "@/lib/db";
import { processDuePostsForUser } from "@/lib/publish/process-due";
import { requireUserId } from "@/lib/server/app-data";

const ClientScopedCalendar = dynamic(
  () =>
    import("@/components/app/client-scoped-calendar").then(
      (mod) => mod.ClientScopedCalendar,
    ),
  {
    ssr: false,
    loading: () => <CalendarLoading />,
  },
);

export default async function CalendarPage() {
  const userId = await requireUserId();
  await processDuePostsForUser(userId);

  const start = new Date();
  start.setMonth(start.getMonth() - 1, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth() + 3, 0);
  end.setHours(23, 59, 59, 999);

  const posts = await getCalendarPostsByUserId(userId, start.toISOString(), end.toISOString());

  return (
    <>
      <AppHeaderWithClient
        title="Calendar"
        description="monthly view — click for details, drag to reschedule"
      />
      <div className="flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <ClientScopedCalendar
          posts={posts.map((post) => ({
            id: post.id,
            brandId: post.brandId,
            brandName: post.brandName,
            platform: post.platform,
            content: post.content,
            caption: post.content,
            imageUrl: post.imageUrl,
            status: post.status,
            scheduledAt: post.scheduledAt ?? "",
            externalPostId: post.externalPostId,
          }))}
        />
      </div>
    </>
  );
}
