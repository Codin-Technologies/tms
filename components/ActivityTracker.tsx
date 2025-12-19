"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export default function ActivityTracker() {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(5 * 60); // 5 minutes in seconds

    const handleLogout = async () => {
        try {
            const { signOut } = await import("@/app/auth");
            await signOut({ redirectTo: "/login" });
        } catch (error) {
            console.error("Logout error:", error);
            router.push("/login");
        }
    };

    const resetTimer = () => {
        // Clear existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        setShowWarning(false);

        // Set warning timer (55 minutes)
        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true);
            setRemainingTime(5 * 60); // Reset to 5 minutes

            // Start countdown
            const countdownInterval = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, INACTIVITY_TIMEOUT - WARNING_TIME);

        // Set logout timer (60 minutes)
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    };

    const handleActivity = () => {
        if (!showWarning) {
            resetTimer();
        }
    };

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        resetTimer();
    };

    useEffect(() => {
        // Activity events to monitor
        const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, [showWarning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Session Timeout Warning</h3>
                        <p className="text-sm text-gray-600">You will be logged out due to inactivity</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 mb-2">Time remaining:</p>
                        <p className="text-4xl font-bold text-yellow-600">{formatTime(remainingTime)}</p>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                        Click "Stay Logged In" to continue your session, or you will be automatically logged
                        out.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    >
                        Logout Now
                    </button>
                    <button
                        onClick={handleStayLoggedIn}
                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                        Stay Logged In
                    </button>
                </div>
            </div>
        </div>
    );
}
