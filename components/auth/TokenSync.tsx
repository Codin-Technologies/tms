'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function TokenSync() {
    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            console.log("[TokenSync] session object:", JSON.stringify(session, null, 2));
            console.log("[TokenSync] user role in session:", (session?.user as any)?.role);

            if ((session as any).accessToken) {
                const currentToken = localStorage.getItem('api_token');
                const newToken = (session as any).accessToken;

                if (currentToken !== newToken) {
                    console.log("[TokenSync] Syncing access token to localStorage");
                    localStorage.setItem('api_token', newToken);
                }
            } else {
                console.warn("[TokenSync] Session found but accessToken is MISSING");
            }
        } else {
            console.log("[TokenSync] No session found yet");
        }
    }, [session]);

    return null;
}
