import { auth } from "./app/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === "/login";

  // Redirect authenticated users away from login page
  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }

  // Redirect unauthenticated users to login page
  if (!isLoggedIn && !isOnLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
})

export const config = {
  // Protect all routes except login, API routes, and static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}