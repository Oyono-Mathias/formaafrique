"use client"

import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { X, Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

import { Button } from "./button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

const sidebarVariants = cva("flex h-full flex-col", {
  variants: {
    side: {
      left: "items-start",
      right: "items-end",
    },
  },
  defaultVariants: {
    side: "left",
  },
})

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SidebarContext.Provider
      value={{
        isOpen: isOpen,
        setIsOpen: setIsOpen,
      }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (context === undefined)
    throw new Error("useSidebar must be used within a SidebarProvider")

  return context
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, side, ...props }, ref) => {
    const isMobile = useIsMobile()
    const { isOpen, setIsOpen } = useSidebar()

    if (isMobile) {
      return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side={side} className={cn("w-64 p-0", className)}>
            <SheetTitle className="sr-only">Menu principal</SheetTitle>
            <div ref={ref} className={cn(sidebarVariants({ side }))} {...props}>
              {children}
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <aside
        ref={ref}
        className={cn(
          "hidden lg:block w-64 flex-shrink-0 border-r bg-card",
          isOpen ? "w-64" : "w-16",
          "transition-all duration-300 ease-in-out",
          className
        )}
      >
        <div className={cn(sidebarVariants({ side }))} {...props}>
          {children}
        </div>
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 shrink-0 items-center border-b px-4",
        !isOpen && "justify-center",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1", className)} {...props} />
})
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-4", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    isActive?: boolean
    tooltip?: string
  }
>(({ className, children, isActive, tooltip, ...props }, ref) => {
  const { isOpen } = useSidebar()

  const content = (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "h-10 w-full justify-start",
        !isOpen && "justify-center",
        className
      )}
      {...props}
    >
      {isOpen ? children : <>{children}</>}
    </Button>
  )

  if (isOpen) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      {tooltip && <TooltipContent>{tooltip}</TooltipContent>}
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-auto", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  const { isOpen, setIsOpen } = useSidebar()

  if (isMobile) {
    return (
      <SheetTrigger asChild>
        <Button ref={ref} variant="ghost" size="icon" {...props}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
    )
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <main ref={ref} className={cn("flex-1", className)} {...props} />
  }

  return (
    <main ref={ref} className={cn("flex-1", className)} {...props} />
  )
})
SidebarInset.displayName = "SidebarInset"

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
}
