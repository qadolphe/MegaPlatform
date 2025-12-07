import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // List of domains that serve the Admin App
  const adminDomains = [
    "localhost:3000", 
    "hoodieplatform.com", 
    "www.hoodieplatform.com",
    "d254brwtrxy0xs.cloudfront.net"
  ];
  
  const isAdmin = adminDomains.includes(hostname);

  if (!isAdmin) {
      // It's a Storefront (Subdomain or Custom Domain)
      const searchParams = request.nextUrl.searchParams.toString();
      const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
      
      // Rewrite to the dynamic route
      return NextResponse.rewrite(new URL(`/${hostname}${path}`, request.url));
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
