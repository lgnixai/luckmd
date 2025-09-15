'use client'

import * as React from 'react'
import { PanelLeftIcon, PanelRightIcon } from 'lucide-react'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '../../lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarState = {
  expanded: boolean
  open: boolean
  openMobile: boolean
}

type MultiSidebarContextProps = {
  leftSidebar: SidebarState & {
    setOpen: (open: boolean) => void
    setOpenMobile: (open: boolean) => void
    toggleSidebar: () => void
  }
  rightSidebar: SidebarState & {
    setOpen: (open: boolean) => void
    setOpenMobile: (open: boolean) => void
    toggleSidebar: () => void
  }
  isMobile: boolean
}

const MultiSidebarContext = React.createContext<MultiSidebarContextProps | null>(null)

function useMultiSidebar() {
  const context = React.useContext(MultiSidebarContext)
  if (!context) {
    throw new Error('useMultiSidebar must be used within a MultiSidebarProvider.')
  }
  return context
}

function useLeftSidebar() {
  const { leftSidebar } = useMultiSidebar()
  return leftSidebar
}

function useRightSidebar() {
  const { rightSidebar } = useMultiSidebar()
  return rightSidebar
}

function MultiSidebarProvider({
  defaultLeftOpen = true,
  defaultRightOpen = true,
  leftOpen: leftOpenProp,
  rightOpen: rightOpenProp,
  onLeftOpenChange: setLeftOpenProp,
  onRightOpenChange: setRightOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultLeftOpen?: boolean
  defaultRightOpen?: boolean
  leftOpen?: boolean
  rightOpen?: boolean
  onLeftOpenChange?: (open: boolean) => void
  onRightOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  
  // Left sidebar state
  const [leftOpenMobile, setLeftOpenMobile] = React.useState(false)
  const [_leftOpen, _setLeftOpen] = React.useState(defaultLeftOpen)
  const leftOpen = leftOpenProp ?? _leftOpen
  const setLeftOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(leftOpen) : value
      if (setLeftOpenProp) {
        setLeftOpenProp(openState)
      } else {
        _setLeftOpen(openState)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}_left=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setLeftOpenProp, leftOpen],
  )
  const toggleLeftSidebar = React.useCallback(() => {
    return isMobile ? setLeftOpenMobile((open) => !open) : setLeftOpen((open) => !open)
  }, [isMobile, setLeftOpen, setLeftOpenMobile])

  // Right sidebar state
  const [rightOpenMobile, setRightOpenMobile] = React.useState(false)
  const [_rightOpen, _setRightOpen] = React.useState(defaultRightOpen)
  const rightOpen = rightOpenProp ?? _rightOpen
  const setRightOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(rightOpen) : value
      if (setRightOpenProp) {
        setRightOpenProp(openState)
      } else {
        _setRightOpen(openState)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}_right=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setRightOpenProp, rightOpen],
  )
  const toggleRightSidebar = React.useCallback(() => {
    return isMobile ? setRightOpenMobile((open) => !open) : setRightOpen((open) => !open)
  }, [isMobile, setRightOpen, setRightOpenMobile])

  // Keyboard shortcut for left sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleLeftSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleLeftSidebar])

  const contextValue = React.useMemo<MultiSidebarContextProps>(
    () => ({
      leftSidebar: {
        expanded: leftOpen,
        open: leftOpen,
        openMobile: leftOpenMobile,
        setOpen: setLeftOpen,
        setOpenMobile: setLeftOpenMobile,
        toggleSidebar: toggleLeftSidebar,
      },
      rightSidebar: {
        expanded: rightOpen,
        open: rightOpen,
        openMobile: rightOpenMobile,
        setOpen: setRightOpen,
        setOpenMobile: setRightOpenMobile,
        toggleSidebar: toggleRightSidebar,
      },
      isMobile,
    }),
    [
      leftOpen,
      leftOpenMobile,
      setLeftOpen,
      setLeftOpenMobile,
      toggleLeftSidebar,
      rightOpen,
      rightOpenMobile,
      setRightOpen,
      setRightOpenMobile,
      toggleRightSidebar,
      isMobile,
    ],
  )

  return (
    <MultiSidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </MultiSidebarContext.Provider>
  )
}

function MultiSidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
}) {
  const { isMobile, leftSidebar, rightSidebar } = useMultiSidebar()
  const sidebar = side === 'left' ? leftSidebar : rightSidebar

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={sidebar.openMobile} onOpenChange={sidebar.setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  const state = sidebar.expanded ? 'expanded' : 'collapsed'

  return (
    <div
      className={cn(
        "group peer text-sidebar-foreground hidden md:block",
        className
      )}
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function MultiSidebarTrigger({
  side = 'left',
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & {
  side?: 'left' | 'right'
}) {
  const { leftSidebar, rightSidebar } = useMultiSidebar()
  const sidebar = side === 'left' ? leftSidebar : rightSidebar

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('size-7', className)}
      onClick={(event) => {
        onClick?.(event)
        sidebar.toggleSidebar()
      }}
      {...props}
    >
      {side === 'left' ? <PanelLeftIcon /> : <PanelRightIcon />}
      <span className="sr-only">Toggle {side} Sidebar</span>
    </Button>
  )
}

function MultiSidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'bg-background relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  )
}

// Re-export all the other components from the original sidebar
export {
  MultiSidebarProvider,
  MultiSidebar,
  MultiSidebarTrigger,
  MultiSidebarInset,
  useMultiSidebar,
  useLeftSidebar,
  useRightSidebar,
}

// Re-export all the sidebar components that are still needed
export {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
