import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname (e.g. "bob.localhost:3000" or "bob.hoodieplatform.com")
  const hostname = req.headers.get("host");

  // Define your production domain so we can handle "localhost" vs "prod"
  // You can put this in .env later: process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const allowedDomains = ["localhost:3000", "hoodieplatform.com"]; 
  
  // Prevent rewrite for the main marketing site (optional, but good practice)
  // if (hostname === "hoodieplatform.com") {
  //   return NextResponse.next();
  // }

  // Rewrite everything to `/[domain]/path`
  // This effectively "moves" the user into your [domain] folder
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // REWRITE: Tell Next.js to serve the content from apps/web-storefront/src/app/[domain]/page.tsx
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
