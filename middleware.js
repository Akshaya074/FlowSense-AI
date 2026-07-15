import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define matches for routes requiring authentication guards
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[^?]*$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
