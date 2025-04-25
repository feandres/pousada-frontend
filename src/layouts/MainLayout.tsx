import { Outlet } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <SidebarTrigger />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Toaster />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
