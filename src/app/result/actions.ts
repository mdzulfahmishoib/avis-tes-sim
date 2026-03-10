"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()

  const participant_name = formData.get("participant_name") as string
  const participant_email = formData.get("participant_email") as string
  const content = formData.get("content") as string
  const type = "General" // Default type since UI was simplified

  if (!participant_name || !participant_email || !content) {
    return { error: "Isi masukan tidak boleh kosong." }
  }

  const { error } = await supabase
    .from("feedbacks")
    .insert([{ participant_name, participant_email, type, content }])

  if (error) {
    console.error("Error submitting feedback:", error)
    return { error: "Gagal mengirim masukan. Silakan coba lagi nanti." }
  }

  revalidatePath("/admin/feedbacks")
  return { success: true }
}
