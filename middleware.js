import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define matches for routes requiring Clerk session auth guards
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Match all dashboard paths
    "/dashboard(.*)",
    // Match user/token endpoints (Clerk auth required)
    "/api/user(.*)",
    // Skip static files, Next.js internals, and specifically the /api/events telemetry endpoint
    "/((?!_next|api/events|[^?]*\\.[^?]*$).*)",
  ],
};
