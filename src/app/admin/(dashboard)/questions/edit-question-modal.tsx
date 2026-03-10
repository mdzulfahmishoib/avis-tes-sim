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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { QuestionCategory, updateQuestion } from "./actions"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Edit2 } from "lucide-react"

type Question = {
  id: string
  category: QuestionCategory
  text: string
  media_url: string | null
  media_type: string | null
  options: string[]
  correct_answer: string
  sim_type: string
  audio_url: string | null
}

export function EditQuestionModal({ question }: { question: Question }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<QuestionCategory>(question.category)
  const [loading, setLoading] = useState(false)

  const [opt1, setOpt1] = useState(question.options[0] || "")
  const [opt2, setOpt2] = useState(question.options[1] || "")
  const [opt3, setOpt3] = useState(question.options[2] || "")

  async function handleAction(formData: FormData) {
    if (!category) {
      toast.error('Please select a category')
      return
    }
    formData.append('category', category)
    setLoading(true)
    const res = await updateQuestion(question.id, formData)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Question updated successfully")
      setOpen(false)
    }
  }

  const isPersepsi = category === 'Persepsi Bahaya'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="icon" className="h-8 w-8" />}
      >
        <Edit2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Modify the content or answers for this question.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                defaultValue={category}
                onValueChange={(v) => setCategory(v as QuestionCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Persepsi Bahaya">Persepsi Bahaya</SelectItem>
                  <SelectItem value="Wawasan">Wawasan</SelectItem>
                  <SelectItem value="Pengetahuan">Pengetahuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim_type">SIM Type</Label>
              <Select name="sim_type" defaultValue={question.sim_type} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select SIM Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">SIM A (Mobil)</SelectItem>
                  <SelectItem value="C">SIM C (Motor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Textarea
              id="text"
              name="text"
              defaultValue={question.text}
              placeholder="Enter the question text here..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="media">Media File (Change if needed - Image/MP4)</Label>
            {question.media_url && (
              <div className="text-xs mb-2 text-muted-foreground">Current media exists. Providing a new one will replace it.</div>
            )}
            <Input id="media" name="media" type="file" accept="image/*,video/mp4" />
          </div>

          {isPersepsi && (
            <div className="space-y-2">
              <Label htmlFor="audio" className="flex items-center gap-2">
                Audio File
                <span className="text-xs text-muted-foreground font-normal">(Persepsi Bahaya — akan auto-play saat tes)</span>
              </Label>
              {question.audio_url && (
                <div className="text-xs mb-2 text-muted-foreground flex items-center gap-2">
                  <span>Audio saat ini:</span>
                  <audio src={question.audio_url} controls className="h-7" />
                </div>
              )}
              <Input id="audio" name="audio" type="file" accept="audio/*" />
            </div>
          )}

          <Card className="p-4 bg-muted/50 space-y-4">
            <h4 className="font-semibold text-sm">Options & Answer</h4>

            {isPersepsi ? null : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="option_1">Option A</Label>
                  <Input id="option_1" name="option_1" value={opt1} onChange={(e) => setOpt1(e.target.value)} required className="bg-white dark:bg-slate-950" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="option_2">Option B</Label>
                  <Input id="option_2" name="option_2" value={opt2} onChange={(e) => setOpt2(e.target.value)} required className="bg-white dark:bg-slate-950" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="option_3">Option C</Label>
                  <Input id="option_3" name="option_3" value={opt3} onChange={(e) => setOpt3(e.target.value)} className="bg-white dark:bg-slate-950" />
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="correct_answer">Correct Answer</Label>
              <Select name="correct_answer" defaultValue={question.correct_answer} required>
                <SelectTrigger className="w-full px-3 py-2 bg-white dark:bg-transparent">
                  <SelectValue placeholder="Pilih jawaban benar" />
                </SelectTrigger>
                <SelectContent>
                  {isPersepsi ? (
                    <>
                      <SelectItem value="Mengurangi Kecepatan">Mengurangi Kecepatan</SelectItem>
                      <SelectItem value="Melakukan Pengereman">Melakukan Pengereman</SelectItem>
                      <SelectItem value="Mempertahankan Kecepatan">Mempertahankan Kecepatan</SelectItem>
                    </>
                  ) : (
                    <>
                      {opt1 && <SelectItem value={opt1}>{opt1}</SelectItem>}
                      {opt2 && <SelectItem value={opt2}>{opt2}</SelectItem>}
                      {opt3 && <SelectItem value={opt3}>{opt3}</SelectItem>}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
