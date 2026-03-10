import { ShieldCheck, Award, Timer, BookOpen, Users, TrendingUp, CheckCircle2 } from "lucide-react"
import { StartQuizModal } from "@/components/start-quiz-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  // Fetch public stats for the landing page
  const [
    { count: totalTests },
    { count: passCount },
  ] = await Promise.all([
    supabase.from('test_results').select('*', { count: 'exact', head: true }),
    supabase.from('test_results').select('*', { count: 'exact', head: true }).eq('pass_status', true),
  ])

  const total = totalTests || 0
  const passed = passCount || 0
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-[#21479B] dark:text-white text-xl">
            <ShieldCheck className="h-8 w-8" />
            <span>AVIS SIM</span>
          </div>
          <ThemeToggle hideText />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2">
              Simulasi Ujian Teori
            </h1>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5">
              <span className="text-[#21479B]">SIM A & SIM C</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Persiapkan diri Anda dengan simulasi ujian teori SIM yang akurat,
              mengikuti ebook materi ujian terbaru dari Korlantas Polri.
            </p>
            <div className="flex justify-center">
              <StartQuizModal />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 text-[#21479B] dark:text-white">
                  <Timer className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Batas Waktu Akurat</h3>
                <p className="text-muted-foreground">
                  Setiap sesi memiliki batas waktu pengerjaan otomatis seperti ujian aslinya.
                </p>
              </div>
              <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 text-[#21479B] dark:text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tiga Materi Utama</h3>
                <p className="text-muted-foreground">
                  Persepsi Bahaya, Wawasan, dan Pengetahuan mencakup total 65 soal.
                </p>
              </div>
              <div className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 text-[#21479B] dark:text-white">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Sertifikat Hasil</h3>
                <p className="text-muted-foreground">
                  Dapatkan skor detail dan status kelulusan secara instan setelah selesai.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {total > 0 && (
          <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-[#171717] dark:to-[#0a0a0a]">
            <div className="container mx-auto max-w-6xl text-center">

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                Segera Lakukan Tes Simulasi SIM Sekarang
              </h2>

              <p className="text-gray-600 dark:text-slate-300 mb-12">
                Sudah banyak yang berhasil lulus tes simulasi SIM dengan menggunakan aplikasi ini.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 dark:backdrop-blur shadow-sm hover:shadow-md transition-shadow">

                {/* Stat 1 */}
                <div className="py-10 px-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {total.toLocaleString("id-ID")}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-300 mt-2">
                    Kali Simulasi Dilakukan
                  </p>
                </div>

                {/* Stat 2 */}
                <div className="py-10 px-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {passRate}%
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-300 mt-2">
                    Tingkat Kelulusan
                  </p>
                </div>

                {/* Stat 3 */}
                <div className="py-10 px-6">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {passed.toLocaleString("id-ID")}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-300 mt-2">
                    Pengguna Lulus
                  </p>
                </div>

              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30 text-center">
        <div className="container mx-auto">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AVIS SIM Simulator. Dikembangkan untuk edukasi keselamatan berkendara.
          </p>
        </div>
      </footer>
    </div>
  )
}
