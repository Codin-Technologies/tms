"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

type HeaderState = {
  title?: ReactNode;
  subtitle?: ReactNode;
  searchPlaceholder?: string;
  actions?: ReactNode;
};

type HeaderContextType = {
  header: HeaderState;
  setHeader: (h: HeaderState) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [header, setHeader] = useState<HeaderState>({});

  // Default mapping by pathname when no header title is set
  useEffect(() => {
    if (!header.title) {
      const map: Record<string, HeaderState> = {
        "/": { title: "Dashboard Overview", subtitle: "Welcome back, here's what's happening today", searchPlaceholder: "Search tires, vehicles..." },
        "/stock": { title: "Tyre Stock", subtitle: "Current inventory overview", searchPlaceholder: "Search tyre SKU, model..." },
        "/operations": { title: "Operations", subtitle: "Manage vehicles & operations", searchPlaceholder: "Search vehicles, tasks..." },
        "/inspection": { title: "Inspections", subtitle: "Inspection schedules and reports", searchPlaceholder: "Search inspections..." },
        "/reports": { title: "Reports", subtitle: "Analytics & export", searchPlaceholder: "Search reports..." },
        "/tpms": { title: "TPMS", subtitle: "Tire Pressure Monitoring", searchPlaceholder: "Search sensors..." },
        "/users": { title: "User Management", subtitle: "Manage users and roles", searchPlaceholder: "Search users..." },
      };

      const base = Object.keys(map).find((p) => pathname?.startsWith(p));
      if (base) setHeader((prev) => ({ ...map[base], ...prev }));
      else setHeader((prev) => ({ title: "Page", ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <HeaderContext.Provider value={{ header, setHeader }}>{children}</HeaderContext.Provider>;
};

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used within a HeaderProvider");
  return ctx;
};

export default HeaderContext;
