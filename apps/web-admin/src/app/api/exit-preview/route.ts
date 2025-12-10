import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Delete the preview cookie
  cookieStore.delete("x-preview-store");
  
  const url = new URL(request.url);
  // Redirect to the dashboard (root)
  return NextResponse.redirect(new URL("/", url.origin));
}
