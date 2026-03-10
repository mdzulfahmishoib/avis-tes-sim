"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResultsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [simType, setSimType] = useState(searchParams.get("sim_type") || "all")

  const debouncedSearch = useDebounce(search, 500)

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "all") {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })

      // Always reset to page 1 on filter change
      newParams.delete("page")

      return newParams.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const query = createQueryString({ search: debouncedSearch })
    router.push(`/admin/results?${query}`)
  }, [debouncedSearch, router, createQueryString])

  const handleStatusChange = (val: string | null) => {
    if (!val) return
    setStatus(val)
    const query = createQueryString({ status: val })
    router.push(`/admin/results?${query}`)
  }

  const handleSimTypeChange = (val: string | null) => {
    if (!val) return
    setSimType(val)
    const query = createQueryString({ sim_type: val })
    router.push(`/admin/results?${query}`)
  }

  const clearFilters = () => {
    setSearch("")
    setStatus("all")
    setSimType("all")
    router.push("/admin/results")
  }

  const hasFilters = search !== "" || status !== "all" || simType !== "all"

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email..."
          className="pl-9 bg-white dark:bg-slate-950"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="w-full md:w-[150px]">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="bg-white dark:bg-slate-950">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pass">Lulus</SelectItem>
            <SelectItem value="fail">Tidak Lulus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-[150px]">
        <Select value={simType} onValueChange={handleSimTypeChange}>
          <SelectTrigger className="bg-white dark:bg-slate-950">
            <SelectValue placeholder="SIM Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua SIM</SelectItem>
            <SelectItem value="A">SIM A</SelectItem>
            <SelectItem value="C">SIM C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="px-3">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}
