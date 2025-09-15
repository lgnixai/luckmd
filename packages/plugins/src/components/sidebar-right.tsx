import * as React from "react"
import { Plus } from "lucide-react"

import { Calendars } from '@/components/calendars'
import { DatePicker } from '@/components/date-picker'
import { NavUser } from '@/components/nav-user'
import {
  MultiSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
  MultiSidebarTrigger,
} from '@/components/ui/multi-sidebar'

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof MultiSidebar>) {
  return (
    <MultiSidebar
      side="right"
      collapsible="offcanvas"
      className="sticky top-0 h-svh border-l"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <div className="flex items-center justify-between px-2">
          <NavUser user={data.user} />
          <MultiSidebarTrigger side="right" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <button className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 h-8 text-sm">
              <Plus />
              <span>New Calendar</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </MultiSidebar>
  )
}
