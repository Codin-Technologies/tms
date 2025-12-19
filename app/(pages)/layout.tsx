import SidebarNav from "@/components/navigation/sidebarNav";
import { ReactNode } from "react";
import { HeaderProvider } from "@/components/HeaderContext";
import TopRibbon from "@/components/TopRibbon";
import ActivityTracker from "@/components/ActivityTracker";

const TMSLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Activity Tracker for session timeout */}
      <ActivityTracker />

      {/* Sidebar + main content */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav />
        <div className="flex-1 overflow-auto">
          <HeaderProvider>
            <TopRibbon />
            <div className="p-8 pt-6">{children}</div>
          </HeaderProvider>
        </div>
      </div>
    </div>
  );
};

export default TMSLayout;