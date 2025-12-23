import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

class InvalidLoginError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  // In local dev provide a non-secret fallback so next-auth doesn't throw a MissingSecret error.
  // This is intentionally permissive for developer convenience; set NEXTAUTH_SECRET in production.
  // eslint-disable-next-line no-console
  console.warn(
    "NEXTAUTH_SECRET is not set. Using development fallback secret — set NEXTAUTH_SECRET in environment for production."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          throw new InvalidLoginError(
            "Please provide both username and password"
          );
        }

        try {
          const res = await fetch("https://tire-backend-h8tz.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.username, // mapping username field to email
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new InvalidLoginError(data.message || "Invalid username or password");
          }

          // Backend returns: { token: "...", user: { id, name, email, ... } }
          if (data && data.token && data.user) {
            return {
              id: String(data.user.id), // Ensure ID is a string
              name: data.user.name,
              email: data.user.email,
              accessToken: data.token, // Use 'token' from backend response
            };
          }

          // If response doesn't have expected structure, log it for debugging
          console.error("Unexpected backend response structure:", data);
          throw new InvalidLoginError("Invalid response from server");

        } catch (error) {
          if (error instanceof InvalidLoginError) {
            throw error;
          }
          console.error("Login error:", error);
          throw new InvalidLoginError("An unexpected error occurred");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.loginTime = Date.now(); // Track login time
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour in seconds
    updateAge: 10 * 60, // Update session every 10 minutes of activity
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Setting maxAge to 0 makes the cookie a session cookie (expires on browser close)
        // But we still enforce 1-hour timeout via session.maxAge above
        maxAge: undefined, // Session cookie - expires when browser closes
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: NEXTAUTH_SECRET ?? "dev-insecure-secret",
});
