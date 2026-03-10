'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitQuizResult(data: {
  participant_name: string
  participant_email: string
  sim_type: string
  score_persepsi: number
  score_wawasan: number
  score_pengetahuan: number
}) {
  const supabase = await createClient()

  const totalScore = data.score_persepsi + data.score_wawasan + data.score_pengetahuan
  const passStatus = totalScore >= 70

  const { data: record, error } = await supabase
    .from('test_results')
    .insert({
      participant_name: data.participant_name,
      participant_email: data.participant_email,
      sim_type: data.sim_type,
      score_persepsi: data.score_persepsi,
      score_wawasan: data.score_wawasan,
      score_pengetahuan: data.score_pengetahuan,
      total_score: totalScore,
      pass_status: passStatus
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting quiz result:', error)
    return { error: 'Gagal menyimpan hasil ujian.' }
  }

  return { id: record.id }
}
