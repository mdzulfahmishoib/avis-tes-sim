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
import { resetAdminPassword } from "./actions"
import { toast } from "sonner"

export function ResetPasswordModal({ userId, userEmail }: { userId: string, userEmail: string }) {
  const [open, setOpen] = useState(false)

  async function onSubmit(formData: FormData) {
    formData.append('userId', userId)
    const res = await resetAdminPassword(formData)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Password reset successfully")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Reset Password
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter a new password for <strong>{userEmail}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                New Pwd
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
            <Button type="submit">Update Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
