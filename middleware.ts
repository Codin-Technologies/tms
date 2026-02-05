import { auth } from "./app/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");

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
  // Protect all routes except login, API routes, and static files.
  // Explicitly include the root `/` so it is checked by the middleware.
  // Exclude all `_next` paths, any `api` routes (including next-auth), and the login page.
  matcher: [
    "/",
    "/((?!api|_next|favicon.ico|login).*)",
  ],
}