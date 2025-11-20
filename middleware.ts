import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/demo(.*)",   // All routes starting with /demo
  "/public(.*)", // All routes starting with /public
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();


  // TODO: Uncomment this when we have a Demo Page
  ////If the route is not public and user is not authenticated, redirect to intro page
  // if (!isPublicRoute(req) && !userId) {
  //   const introUrl = new URL("/public/intro", req.url);
  //   return NextResponse.redirect(introUrl);
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

