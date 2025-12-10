import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
  
  // List of domains that serve the Admin App
  const adminDomains = [
    "localhost:3000", 
    "hoodieplatform.com", 
    "www.hoodieplatform.com",
  ];
  
  // Check if it's an admin domain OR the default CloudFront URL
  const isAdmin = adminDomains.includes(hostname) || hostname.endsWith(".cloudfront.net");

  if (isAdmin) {
    // 1. Check for Preview Mode Cookie
    const previewCookie = request.cookies.get("x-preview-store");
    const previewStoreParam = request.nextUrl.searchParams.get("preview_store");
    const exitPreview = request.nextUrl.searchParams.get("exit_preview");

    // If exit_preview is set, clear cookie and redirect to home
    if (exitPreview) {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("x-preview-store");
        return response;
    }
    
    // If query param exists, we are entering preview mode -> Set cookie and rewrite
    if (previewStoreParam) {
       const response = NextResponse.rewrite(new URL(`/${previewStoreParam}.hoodieplatform.com${path}`, request.url));
       response.cookies.set("x-preview-store", previewStoreParam);
       return response;
    }

    // If cookie exists, we are IN preview mode -> Rewrite unless it's a reserved admin path
    if (previewCookie) {
        const reservedPaths = ["/login", "/auth", "/new-store", "/store", "/editor", "/settings", "/api"];
        const isReserved = reservedPaths.some(p => url.pathname.startsWith(p));
        
        if (!isReserved) {
            return NextResponse.rewrite(new URL(`/${previewCookie.value}.hoodieplatform.com${path}`, request.url));
        }
    }

    return await updateSession(request)
  }

  // It's a Storefront (Subdomain or Custom Domain)
  // Rewrite to the dynamic route
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, request.url));
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
