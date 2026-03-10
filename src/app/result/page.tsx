"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, Award, RotateCcw, Home } from "lucide-react"

export default function ResultPage() {
  const router = useRouter()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resultId = sessionStorage.getItem("last_result_id")
    if (!resultId) {
      router.push("/")
      return
    }

    async function fetchResult() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("id", resultId)
        .single()

      if (error) {
        console.error("Error fetching result:", error)
        router.push("/")
      } else {
        setResult(data)
      }
      setLoading(false)
    }

    fetchResult()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Skeleton className="h-[500px] w-full max-w-2xl" />
      </div>
    )
  }

  if (!result) return null

  const isPassed = result.pass_status

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <Card className="relative w-full max-w-2xl shadow-2xl border-none overflow-hidden">
        <div className={`absolute top-0 left-0 h-3 w-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`} />

        <CardContent className="p-5 md:p-5">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`rounded-full p-4 ${isPassed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
              {isPassed ? <CheckCircle2 className="h-16 w-16" /> : <XCircle className="h-16 w-16" />}
            </div>

            <div className="mb-0">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                {isPassed ? "LULUS" : "TIDAK LULUS"}
              </h1>
              <p className="text-muted-foreground text-lg mb-0">
                Peserta: <span className="font-semibold text-foreground">{result.participant_name}</span>
              </p>
              <p className="text-muted-foreground text-lg mb-0">
                Email: <span className="font-semibold text-foreground">{result.participant_email}</span>
              </p>
              <p className="text-muted-foreground text-sm">SIM {result.sim_type}</p>
            </div>

            <div className="w-full grid md:grid-cols-2 gap-4 my-4">
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Skor Total</p>
                  <p className="text-5xl font-bold text-[#21479B] dark:text-white">{result.total_score}</p>
                  <p className="text-xs text-muted-foreground mt-1">Syarat Nilai Kelulusan: 70/100</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-green-50 dark:bg-green-900/20 border-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Benar</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {result.score_persepsi + result.score_wawasan + result.score_pengetahuan}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">soal</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/20 border-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-1">Salah</p>
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                      {65 - (result.score_persepsi + result.score_wawasan + result.score_pengetahuan)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">soal</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Per-category breakdown */}
            <Card className="bg-muted/50 border-none w-full">
              <CardContent className="p-4 text-left">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">Rincian Per Sesi</p>
                <div className="space-y-3">
                  {[
                    { label: 'Persepsi Bahaya', score: result.score_persepsi, total: 25 },
                    { label: 'Wawasan', score: result.score_wawasan, total: 20 },
                    { label: 'Pengetahuan', score: result.score_pengetahuan, total: 20 },
                  ].map(({ label, score, total }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className="font-bold">
                          <span className="text-green-600 dark:text-green-400">{score} benar</span>
                          {' · '}
                          <span className="text-red-500 dark:text-red-400">{total - score} salah</span>
                          <span className="text-muted-foreground font-normal"> / {total}</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#21479B] dark:bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(score / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={() => router.push("/")}
                className="flex-1 py-6 rounded-xl bg-[#21479B] hover:bg-[#1a3778] text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Coba Lagi
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="flex-1 py-6 rounded-xl border-2"
              >
                <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
