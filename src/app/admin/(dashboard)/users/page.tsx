import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { deleteAdminUser } from "./actions"
import { CreateAdminModal } from "./create-admin-modal"
import { ResetPasswordModal } from "./reset-password-modal"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // We need to fetch users from supabase admin api or profiles table
  // Since profiles holds the role, we can fetch from profiles, 
  // but we also want the email which is in auth.users. 
  // We can use the admin client to fetch all users.
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

  // Also get the current user to prevent self-deletion
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
        <CreateAdminModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operator Accounts</CardTitle>
          <CardDescription>
            Manage users who have access to this dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u, index) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-xs text-center">{index + 1}</TableCell>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <ResetPasswordModal userId={u.id} userEmail={u.email || ''} />
                    {currentUser?.id !== u.id && (
                      <form action={deleteAdminUser.bind(null, u.id)} className="inline">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
