import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  let hostname = request.headers.get("host") || "";
  
  // Remove port if present for consistent domain checking
  hostname = hostname.split(':')[0];

  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
  
  // List of domains that serve the Admin App
  const adminDomains = new Set([
    "localhost", 
    "hoodieplatform.com", 
    "www.hoodieplatform.com",
    "swatbloc.com",
    "www.swatbloc.com",
  ]);
  
  // Check if it's an admin domain OR the default CloudFront URL
  let isAdmin = adminDomains.has(hostname) || hostname.endsWith(".cloudfront.net");

  // Explicitly treat subdomains of swatbloc.com as Storefronts (NOT admin)
  // e.g. "store.swatbloc.com" -> isAdmin = false
  if (hostname.endsWith(".swatbloc.com") && !adminDomains.has(hostname)) {
    isAdmin = false;
  }

  // Explicitly treat subdomains of hoodieplatform.com as Storefronts (NOT admin)
  if (hostname.endsWith(".hoodieplatform.com") && !adminDomains.has(hostname)) {
    isAdmin = false;
  }

  if (!isAdmin) {
    // Redirect /login to the main admin login (helpful if users try to access admin from storefront)
    if (url.pathname === '/login') {
      const targetDomain = process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'swatbloc.com';
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      return NextResponse.redirect(new URL(`${protocol}://${targetDomain}/login`, request.url));
    }

    if (url.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Rewrite to the dynamic [domain] route - storefronts are PUBLIC, no auth!
    const response = NextResponse.rewrite(new URL(`/${hostname}${path}`, request.url));
    response.headers.set('x-debug-hostname', hostname);
    response.headers.set('x-debug-is-admin', 'false');
    return response;
  }

  // --- ADMIN ROUTES ---
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

    const response = await updateSession(request);
    response.headers.set('x-debug-hostname', hostname);
    response.headers.set('x-debug-is-admin', 'true');
    return response;
  }

  // Fallback - should not reach here, but return next() just in case
  return NextResponse.next();
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
