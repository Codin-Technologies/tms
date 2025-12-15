import SidebarNav from "@/components/navigation/sidebarNav";
import { ReactNode } from "react";
import { HeaderProvider } from "@/components/HeaderContext";
import TopRibbon from "@/components/TopRibbon";

const TMSLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header (Top ribbon) now provided to all pages via HeaderProvider */}

      {/* Sidebar + main content */}
      <div className="flex-1 flex overflow-hidden">
        <SidebarNav /> {/* Updated: Direct import, no wrapper needed */}
        <div className="flex-1 overflow-auto">
          <HeaderProvider>
            <div className="p-8">
              <TopRibbon />
              <div className="mt-6">{children}</div>
            </div>
          </HeaderProvider>
        </div>
      </div>
    </div>
  );
};

export default TMSLayout;