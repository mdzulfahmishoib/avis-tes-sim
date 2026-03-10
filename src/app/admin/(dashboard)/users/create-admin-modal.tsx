'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAdminUser } from "./actions"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export function CreateAdminModal() {
  const [open, setOpen] = useState(false)

  async function onSubmit(formData: FormData) {
    const res = await createAdminUser(formData)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Admin user created successfully")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="bg-[#21479B] hover:bg-[#1a3778] dark:text-white" />}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Admin User
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Admin</DialogTitle>
          <DialogDescription>
            Create a new operator account with access to the dashboard.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
