'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Notice we need the service role key to manage users in Supabase Auth
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createAdminUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Use the admin API to bypass RLS and create a user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return { error: error.message }
  }

  // Insert into profiles table
  const supabase = await createClient() // normal client is fine here if RLS allows or if we just use admin client
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: data.user.id,
      role: 'admin'
    })

  if (profileError) {
    // Attempt rollback if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    return { error: 'Failed to create admin profile: ' + profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteAdminUser(userId: string) {
  const supabase = await createClient()
  
  // Verify current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id === userId) {
     return
  }

  await supabaseAdmin.auth.admin.deleteUser(userId)
  revalidatePath('/admin/users')
}

export async function resetAdminPassword(formData: FormData) {
  const userId = formData.get('userId') as string
  const password = formData.get('password') as string

  if (!userId || !password) {
    return { error: "Missing fields" }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: password
  })

  if (error) {
     return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
