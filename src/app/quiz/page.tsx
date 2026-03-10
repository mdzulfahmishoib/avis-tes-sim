"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Timer, AlertCircle, Volume2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { submitQuizResult } from "./actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Question = {
  id: string
  category: string
  text: string
  media_url: string | null
  media_type: string | null
  audio_url: string | null
  options: string[]
  correct_answer: string
}

export default function QuizPage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1. Check for participant data
  useEffect(() => {
    const data = sessionStorage.getItem("quiz_participant")
    if (!data) {
      router.push("/")
      return
    }
    setParticipant(JSON.parse(data))
  }, [router])

  // 2. Fetch Questions
  useEffect(() => {
    if (!participant) return

    async function fetchQuestions() {
      const supabase = createClient()
      const simType = participant.simType // 'A' or 'C'

      const { data: qPersepsi } = await supabase
        .from("questions")
        .select("*")
        .eq("category", "Persepsi Bahaya")
        .eq("sim_type", simType)
        .limit(25)

      const { data: qWawasan } = await supabase
        .from("questions")
        .select("*")
        .eq("category", "Wawasan")
        .eq("sim_type", simType)
        .limit(20)

      const { data: qPengetahuan } = await supabase
        .from("questions")
        .select("*")
        .eq("category", "Pengetahuan")
        .eq("sim_type", simType)
        .limit(20)

      const all = [
        ...(qPersepsi || []),
        ...(qWawasan || []),
        ...(qPengetahuan || []),
      ]

      setQuestions(all)
      setLoading(false)

      if (all.length > 0) {
        // Set initial timer
        const cat = all[0].category
        setTimeLeft(cat === "Persepsi Bahaya" ? 25 : 20)
      }
    }

    fetchQuestions()
  }, [participant])

  const currentQuestion = questions[currentIndex]

  // Auto-play audio for Persepsi Bahaya questions
  useEffect(() => {
    if (!currentQuestion || currentQuestion.category !== 'Persepsi Bahaya' || !currentQuestion.audio_url) return
    // Stop any previous audio first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    const audio = new Audio(currentQuestion.audio_url)
    audioRef.current = audio
    audio.play().catch(() => {
      // Browser may block autoplay before user interaction — silently ignore
    })
    return () => {
      audio.pause()
    }
  }, [currentIndex, currentQuestion])

  // Auto-dismiss banner after 7 seconds
  useEffect(() => {
    if (!showBanner) return
    const timer = setTimeout(() => {
      setShowBanner(false)
    }, 7000)
    return () => clearTimeout(timer)
  }, [showBanner])

  // 3. Auto Next Logic
  const handleNext = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      // Set new timer
      const nextCat = questions[nextIndex].category
      setTimeLeft(nextCat === "Persepsi Bahaya" ? 25 : 20)
    } else {
      // Final submit
      handleSubmit()
    }
  }, [currentIndex, questions])

  // 4. Timer countdown — only mutates timeLeft, no side effects
  useEffect(() => {
    if (loading || isSubmitting || timeLeft <= 0 || questions.length === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, loading, isSubmitting, questions.length])

  // 4b. When timer hits 0, advance to next question (outside setter to avoid Router update during render)
  useEffect(() => {
    if (timeLeft === 0 && !loading && !isSubmitting && questions.length > 0) {
      handleNext()
    }
  }, [timeLeft, loading, isSubmitting, questions.length, handleNext])

  // 5. Submit Logic
  async function handleSubmit() {
    setIsSubmitting(true)

    // Calculate scores
    let scoreP = 0
    let scoreW = 0
    let scoreK = 0

    questions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.correct_answer
      if (isCorrect) {
        if (q.category === "Persepsi Bahaya") scoreP += 1
        if (q.category === "Wawasan") scoreW += 1
        if (q.category === "Pengetahuan") scoreK += 1
      }
    })

    const result = await submitQuizResult({
      participant_name: participant.name,
      participant_email: participant.email,
      sim_type: participant.simType,
      score_persepsi: scoreP,
      score_wawasan: scoreW,
      score_pengetahuan: scoreK,
    })

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      sessionStorage.setItem("last_result_id", result.id)
      router.push("/result")
    }
  }

  if (loading || !participant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full max-w-4xl" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center p-6">
        <div className="space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Bank Soal Kosong</h2>
          <p className="text-muted-foreground">Admin belum mengunggah soal ke database.</p>
          <Button onClick={() => router.push("/")}>Kembali</Button>
        </div>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Progress bar */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#21479B] text-white px-3 py-1 rounded font-bold text-sm">
                SOAL {currentIndex + 1} / {questions.length}
              </div>
              <div className="hidden md:block text-muted-foreground text-sm">
                {currentQuestion.category}
              </div>
            </div>

            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#21479B] dark:text-blue-400'}`}>
              <Timer className="h-5 w-5" />
              {timeLeft}S
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className={cn("flex-1 transition-all duration-300 px-4", showBanner ? "mt-26" : "mt-28")}>
        <div className="container mx-auto max-w-6xl">
          {showBanner && (
            <div className="mb-6 bg-[#21479B]/10 border border-[#21479B]/20 rounded-xl p-4 flex items-center justify-between text-[#21479B] dark:text-blue-300 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="bg-[#21479B] p-2 rounded-full text-white">
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Informasi Penting</p>
                  <p className="text-xs opacity-90">Simulasi ini berisi audio & video interaktif. Mohon aktifkan volume speaker Anda.</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBanner(false)}
                className="hover:bg-[#21479B]/20 h-8 w-8 text-[#21479B] dark:text-blue-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Card className="shadow-xl border-none overflow-hidden">
            <div className="flex flex-col md:flex-row gap-7">
              {/* Left Side - Media */}
              {currentQuestion.media_url && (
                <div className="w-full md:w-1/2 bg-transparent aspect-video md:aspect-auto flex items-center justify-center">
                  {currentQuestion.media_type === "video" ? (
                    <video
                      src={currentQuestion.media_url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      muted
                    />
                  ) : (
                    <img
                      src={currentQuestion.media_url}
                      className="w-full h-full object-contain"
                      alt="Question Media"
                    />
                  )}
                </div>
              )}

              {/* Right Side - Question, Options & Button */}
              <div className={`flex flex-col ${currentQuestion.media_url ? 'w-full md:w-1/2' : 'w-full'}`}>
                <CardContent className="p-5 md:p-5 space-y-8 flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold leading-relaxed">
                    {currentQuestion.text}
                  </h2>

                  <RadioGroup
                    value={answers[currentIndex] || ""}
                    onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentIndex]: val }))}
                    className="grid gap-3"
                  >
                    {currentQuestion.options.map((opt, i) => (
                      <Label
                        key={i}
                        className={`flex items-center gap-4 p-2 rounded-xl border-2 transition-all cursor-pointer
                          hover:bg-muted/50
                          ${answers[currentIndex] === opt
                            ? 'border-[#21479B] bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-400'
                            : 'border-border'}`}
                      >
                        <RadioGroupItem value={opt} id={`opt-${i}`} />
                        <span className="text-lg font-medium">{opt}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>

                {/* Action Button */}
                <div className="flex justify-end p-3 md:p-6 pt-0">
                  <Button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="bg-[#21479B] hover:bg-[#1a3778] text-white px-8 py-6 rounded-xl text-lg w-full md:w-auto"
                  >
                    {isSubmitting ? 'Menyimpan...' : (currentIndex === questions.length - 1 ? 'Selesai' : 'Lanjut →')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
