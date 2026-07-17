import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/tools/grading",
  "/directory",
  "/directory/(.*)",
  "/agency",
  "/agency/register",
  "/get-started",
  "/guides",
  "/guides/(.*)",
  "/industries",
  "/industries/(.*)",
  "/opengraph-image(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login.html",
  "/signup.html",
  "/api/health",
  "/api/health/images",
  "/api/health/linkedin",
  "/api/health/meta",
  "/api/health/facebook",
  "/api/health/x",
  "/api/health/pinterest",
  "/api/health/bluesky",
  "/api/health/stripe",
  "/api/health/integrations",
  "/oauth-client-metadata.json",
  "/.well-known/jwks.json",
  "/api/cron/publish",
  "/api/cron/queue-reminders",
  "/api/cron/weekly-digest",
  "/api/webhooks/stripe",
  "/api/contact",
  "/api/partner/studio-billing",
  "/api/v1/(.*)",
  "/api/import/(.*)",
  "/api/generated/(.*)",
  "/api/social/linkedin/callback",
  "/api/social/meta/callback",
  "/api/social/x/callback",
  "/api/social/pinterest/callback",
  "/api/social/bluesky/callback",
]);

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
  );
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth().protect();
  }
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    if (!isPublicRoute(req)) {
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
  }

  try {
    return await clerkHandler(req, event);
  } catch (error) {
    console.error("[middleware] Clerk invocation failed:", error);
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(signIn);
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
