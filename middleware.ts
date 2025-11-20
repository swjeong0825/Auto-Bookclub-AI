import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/demo(.*)",   // All routes starting with /demo
  "/public(.*)", // All routes starting with /public
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isDemoApiRoute = req.nextUrl.pathname.startsWith('/api/demo');

  // If not authenticated and not a public route
  if (!isPublicRoute(req) && !userId) {
    // For API routes: only allow demo endpoints, block others
    if (isApiRoute) {
      if (!isDemoApiRoute) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      // Demo API routes are allowed through
    } else {
      // For page routes: redirect to intro page
      const introUrl = new URL("/public/intro", req.url);
      return NextResponse.redirect(introUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

