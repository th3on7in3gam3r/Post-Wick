import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/opengraph-image(.*)",
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
  "/api/health/stripe",
  "/api/health/integrations",
  "/api/cron/publish",
  "/api/webhooks/stripe",
  "/api/contact",
  "/api/generated/(.*)",
  "/api/social/linkedin/callback",
  "/api/social/meta/callback",
  "/api/social/x/callback",
  "/api/social/pinterest/callback",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
