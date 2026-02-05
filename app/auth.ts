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
          throw new InvalidLoginError("Please provide both email and password");
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://194.146.13.23';
          const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              email: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (response.ok && data.token) {
            const userObj = data.user || data.data?.user || data.data;

            // Robust role extraction
            let userRole = 'GUEST';
            const rawRole = userObj?.role || userObj?.roles || data.role || data.roles;

            if (typeof rawRole === 'string') {
              userRole = rawRole;
            } else if (Array.isArray(rawRole) && rawRole.length > 0) {
              const firstRole = rawRole[0];
              userRole = typeof firstRole === 'string' ? firstRole : (firstRole.name || firstRole.key || 'GUEST');
            } else if (rawRole && typeof rawRole === 'object') {
              userRole = rawRole.name || rawRole.key || 'GUEST';
            }

            return {
              id: (userObj?.id || 'unknown').toString(),
              name: userObj?.name || 'Unknown User',
              email: userObj?.email || '',
              role: userRole,
              accessToken: data.token,
            };
          } else {
            throw new InvalidLoginError(data.message || "Invalid email or password");
          }
        } catch (error: any) {
          console.error("Auth error:", error);
          if (error instanceof InvalidLoginError) throw error;
          throw new InvalidLoginError("Authentication failed. Please check your credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  // Pass the secret explicitly; use the env value when present or a development fallback
  secret: NEXTAUTH_SECRET ?? "dev-insecure-secret",
});