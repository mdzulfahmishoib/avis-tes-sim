"use client"

import Link from "next/link"
import { Users, FileQuestion, BarChart3, LogOut, ShieldCheck, House, MessageSquarePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { logout } from "@/app/admin/login/actions"

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#21479B] dark:text-white">
          <ShieldCheck className="h-6 w-6" />
          <span className="">Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary dark:text-white"
          >
            <House className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/questions"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary dark:text-white"
          >
            <FileQuestion className="h-4 w-4" />
            Questions
          </Link>
          <Link
            href="/admin/results"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary dark:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Test Results
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary dark:text-white"
          >
            <Users className="h-4 w-4" />
            Admin Users
          </Link>
          <Link
            href="/admin/feedbacks"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary dark:text-white"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Kritik & Saran
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4 flex items-center justify-between gap-2 border-t">
        <ThemeToggle hideText />
        <form action={logout}>
          <Button type="submit" variant="outline" size="icon" title="Logout">
            <LogOut className="h-4 w-4 text-red-500" />
            <span className="sr-only">Logout</span>
          </Button>
        </form>
      </div>
    </aside>
  )
}
