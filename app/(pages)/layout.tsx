import SidebarNav from "@/components/navigation/sidebarNav";
import { ReactNode } from "react";

const TMSLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header removed (top white ribbon) */}

      {/* Sidebar + main content */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav /> {/* Updated: Direct import, no wrapper needed */}
        <div className="p-8 overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default TMSLayout;